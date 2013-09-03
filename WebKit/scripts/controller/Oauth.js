define([
    "helper/HostApp",
    "helper/APICalls",
    "helper/Hmac"
],

function(HostApp, APICalls, Hmac) {

    function Oauth() {
        this.app_info = {
            "type": "https://tent.io/types/app/v0#",
            "content": {
                "name": "Bungloo on " + HostApp.osType(),
                "url": "http://jabs.nu/bungloo/",
                "description": "A desktop Tent client.",
                "redirect_uri": "bungloo://oauthtoken",
                "types": {
                    "read": [
                        "https://tent.io/types/meta/v0",
                        "https://tent.io/types/relationship/v0",
                        "https://tent.io/types/subscription/v0",
                        "https://tent.io/types/delete/v0",
                        "https://tent.io/types/status/v0",
                        "https://tent.io/types/repost/v0",
                        "https://tent.io/types/photo/v0",
                        "https://tent.io/types/cursor/v0",
                        "https://tent.io/types/basic-profile/v0"
                    ],
                    "write": [
                        "https://tent.io/types/relationship/v0",
                        "https://tent.io/types/subscription/v0",
                        "https://tent.io/types/delete/v0",
                        "https://tent.io/types/status/v0",
                        "https://tent.io/types/repost/v0",
                        "https://tent.io/types/photo/v0",
                        "https://tent.io/types/cursor/v0"
                    ]
                },
                "scopes": ["permissions"]
            },
            "permissions": {
                "public": false
            }
        };
        this.register_data = null;
        this.profile = null;
        this.state = null;
    }

    Oauth.prototype.isAuthenticated = function() {
        return HostApp.stringForKey("user_access_token") != null;
    }

    Oauth.prototype.authenticate = function() {

        var entity = HostApp.stringForKey("entity");

        if (entity && entity.startsWith("http")) {
            if((entity.startsWith("http://") || entity.startsWith("https://"))) {
                this.entity = entity;
                this.requestProfileURL(this.entity);                
            } else {
                this.entity = "https://" + entity;
                HostApp.setStringForKey(this.entity, "entity");
                this.requestProfileURL(this.entity);                
            }
        } else {
            HostApp.authentificationDidNotSucceed("The entity should start with https:// or http://");
        }
    }

    Oauth.prototype.requestProfileURL = function (entity) {
        var those = this;
        APICalls.findProfileURL(entity,
            function(profile_url) {
                if (profile_url && (profile_url.startsWith("http://") || profile_url.startsWith("https://"))) {
                    those.register(profile_url);
                } else {
                    HostApp.authentificationDidNotSucceed("Could not find profile for: " + entity);
                }
            },
            function(errorMessage) { // error callback
                HostApp.authentificationDidNotSucceed(errorMessage);
                HostApp.authentificationDidNotSucceed("Could not find profile for: " + entity);
            }
        );
    }

    Oauth.prototype.register = function (url) {
        var those = this;

        APICalls.get(url, {
            no_auth: true,
            callback: function(resp) {

            those.profile = JSON.parse(resp.responseText).post;
            those.entity = those.profile.content.entity;
            HostApp.setStringForKey(those.entity, "entity")
            HostApp.setServerUrls(those.profile.content.servers[0].urls);
            APICalls.post(HostApp.serverUrl("new_post"), JSON.stringify(those.app_info), {
                content_type: "https://tent.io/types/app/v0#",
                no_auth: true,
                callback: function(resp) {
                    var app_id = JSON.parse(resp.responseText).post.id;
                    var header_string = resp.getAllResponseHeaders();
                    var regexp = /https:\/\/tent.io\/rels\/credentials/i
                    var url = APICalls.parseHeaderForLink(header_string, regexp);

                    APICalls.get(url, {
                        content_type: "https://tent.io/types/app/v0#",
                        no_auth: true,
                        callback: function(resp) {
                            var data = JSON.parse(resp.responseText);
                            those.authRequest(data.post, app_id);                  
                        }
                    });
            }});

        }});
    }

    Oauth.prototype.authRequest = function(credentials, app_id) {
    
        HostApp.setStringForKey(app_id, "app_id");
        HostApp.setStringForKey(credentials.id, "app_hawk_id");
        HostApp.setStringForKey(credentials.content.hawk_key, "app_hawk_key");
        HostApp.setStringForKey(credentials.content.hawk_algorithm, "app_hawk_algorithm");
        
        this.state = Hmac.makeid(19);
        var url = HostApp.serverUrl("oauth_auth") + "?client_id=" + app_id + "&state=" + this.state;
        HostApp.openAuthorizationURL(url);
    }

    Oauth.prototype.requestAccessToken = function(responseBody) {
            // /oauthtoken?code=51d0115b04d1ed94001dde751c5b360f&state=aQfH1VEohYsQr86qqyv
            // https://app.example.com/oauth?code=K4m2J2bGI9rcICBqmUCYuQ&state=d173d2bb868a

            var urlVars = APICalls.getUrlVars(responseBody);
            if(this.state && this.state != "" && urlVars["state"] == this.state) {

                var url = HostApp.serverUrl("oauth_token");

                var requestBody = JSON.stringify({
                    'code' : urlVars["code"],
                    'token_type': "https://tent.io/oauth/hawk-token"
                });

                var those = this;
                var auth_header = Hmac.makeHawkAuthHeader(
                        url,
                        "POST",
                        HostApp.stringForKey("app_hawk_id"),
                        HostApp.stringForKey("app_hawk_key")
                    );

                APICalls.post(url, requestBody, {
                    content_type: "application/json",
                    auth_header: auth_header,
                    callback: function(resp) {
                        those.requestAccessTokenTicketFinished(resp.responseText);
                }});

            } else {
                console.error("State is not the same: {" + this.state + "} vs {" + urlVars["state"] + "}")
            }

            this.state = null; // reset the state
    }

    Oauth.prototype.requestAccessTokenTicketFinished = function(responseBody) {

        var access = JSON.parse(responseBody);

        HostApp.setStringForKey(access["access_token"], "user_access_token");
        HostApp.setSecret(access["hawk_key"]);
        HostApp.setStringForKey(access["hawk_algorithm"], "user_hawk_algorithm");
        HostApp.setStringForKey(access["token_type"], "user_token_type");

        HostApp.loggedIn();
    }

    Oauth.prototype.logout = function() { // FIXME

        var url = APICalls.mkApiRootPath("/apps/" + HostApp.stringForKey("app_id"));
        var http_method = "DELETE";
        var auth_header = Hmac.makeAuthHeader(
            url,
            http_method,
            HostApp.stringForKey("app_mac_key"),
            HostApp.stringForKey("app_mac_key_id")
        );

        APICalls.http_call(url, http_method, function(resp) {
            HostApp.setStringForKey(null, "app_mac_key");
            HostApp.setStringForKey(null, "app_mac_key_id");
            HostApp.setStringForKey(null, "app_id");
            HostApp.setStringForKey(null, "app_mac_algorithm");
            HostApp.setStringForKey(null, "user_access_token");
            HostApp.setStringForKey(null, "user_mac_key");
            HostApp.setStringForKey(null, "user_mac_algorithm");
            HostApp.setStringForKey(null, "user_token_type");
            HostApp.setStringForKey(null, "api_root");
            HostApp.setStringForKey(null, "entity");
        }, null, auth_header);
    }


    return Oauth;

});
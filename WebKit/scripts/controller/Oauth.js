define([
    "helper/HostApp",
    "helper/Paths",
    "helper/Hmac"
],

function(HostApp, Paths, Hmac) {

    function Oauth() {
        this.app_info = {
            "id": null,
            "name": "Tentia on " + HostApp.osType(),
            "description": "A small TentStatus client.",
            "url": "http://jabs.nu/Tentia/",
            "icon": "http://jabs.nu/Tentia/icon.png",
            "redirect_uris": [
                "tentia://oauthtoken"
            ],
            "scopes": {
                "read_posts": "Uses posts to show them in a list",
                "write_posts": "Posts on users behalf",
                "read_profile": "Displays your own profile",
                "write_profile": "Updating profile and mentions pointer",
                "read_followers": "Display a list of people who follow you",
                "write_followers": "Be able to block people who follow you",
                "read_followings": "Display following list and their older posts in conversations",
                "write_followings": "Follow ne entities"
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

        if (entity && (entity.startsWith("http://") || entity.startsWith("https://"))) {
            this.entity = entity;
            this.requestProfileURL(this.entity);
        } else {
            HostApp.authentificationDidNotSucceed("The entity should start with https:// or http://");
        }
    }

    Oauth.prototype.apiRoot = function() {
        return this.profile["https://tent.io/types/info/core/v0.1.0"]["servers"][0];
    }

    Oauth.prototype.requestProfileURL = function (entity) {
        var those = this;
        Paths.findProfileURL(entity,
            function(profile_url) {
                if (profile_url && (profile_url.startsWith("http://") || profile_url.startsWith("https://"))) {
                    those.register(profile_url);
                } else {
                    HostApp.authentificationDidNotSucceed("Could not find profile for: " + entity);
                }
            },
            function(errorMessage) { // error callback
                HostApp.authentificationDidNotSucceed("Could not find profile for: " + entity);
            }
        );
    }

    Oauth.prototype.register = function (url) {
        var those = this;

        Paths.getURL(url, "GET", function(resp) {

            those.profile = JSON.parse(resp.responseText);
            those.entity = those.profile["https://tent.io/types/info/core/v0.1.0"].entity;
            HostApp.setStringForKey(those.entity, "entity")
            HostApp.setStringForKey(those.apiRoot(), "api_root");

            var callback = function(resp) {
                var data = JSON.parse(resp.responseText);
                those.authRequest(data);
            }
            Paths.getURL(Paths.mkApiRootPath("/apps"), "POST", callback, JSON.stringify(those.app_info), false);
        }, null, false);
    }

    Oauth.prototype.authRequest = function(register_data) {
        // id
        // mac_key_id
        // mac_key
        // mac_algorithm
        this.register_data = register_data;
        
        // Needed for later App Registration Modification
        HostApp.setStringForKey(register_data["mac_key"], "app_mac_key");
        HostApp.setStringForKey(register_data["mac_key_id"], "app_mac_key_id");
        HostApp.setStringForKey(register_data["id"], "app_id");
        HostApp.setStringForKey(register_data["mac_algorithm"], "app_mac_algorithm");

        this.state = Hmac.makeid(19);
        var auth = "/oauth/authorize?client_id=" + register_data["id"]
                    + "&redirect_uri=" + this.app_info["redirect_uris"][0]
                    + "&scope=" + Object.keys(this.app_info["scopes"]).join(",")
                    + "&state=" + this.state
                    + "&tent_post_types=all"
                    + "&tent_profile_info_types=all";

        HostApp.openAuthorizationURL(this.apiRoot() + auth);
    }

    Oauth.prototype.requestAccessToken = function(responseBody) {
            // /oauthtoken?code=51d0115b04d1ed94001dde751c5b360f&state=aQfH1VEohYsQr86qqyv

            var urlVars = Paths.getUrlVars(responseBody);
            if(this.state && this.state != "" && urlVars["state"] == this.state) {

                var url = Paths.mkApiRootPath("/apps/") + this.register_data["id"] + "/authorizations";

                var requestBody = JSON.stringify({
                    'code' : urlVars["code"],
                    'token_type' : "mac"
                });

                var those = this;
                var http_method = "POST";
                var callback = function(resp) {
                    those.requestAccessTokenTicketFinished(resp.responseText);
                };

                var auth_header = Hmac.makeAuthHeader(
                        url, 
                        http_method, 
                        HostApp.stringForKey("app_mac_key"), 
                        HostApp.stringForKey("app_mac_key_id")
                    );

                Paths.getURL(url, http_method, callback, requestBody, auth_header);

            } else {
                console.error("State is not the same: {" + this.state + "} vs {" + urlVars["state"] + "}")
            }

            this.state = null; // reset the state
    }

    Oauth.prototype.requestAccessTokenTicketFinished = function(responseBody) {

        var access = JSON.parse(responseBody); 

        HostApp.setStringForKey(access["access_token"], "user_access_token");
        HostApp.setSecret(access["mac_key"]);
        HostApp.setStringForKey(access["mac_algorithm"], "user_mac_algorithm");
        HostApp.setStringForKey(access["token_type"], "user_token_type");
        
        HostApp.loggedIn();
    }

    Oauth.prototype.logout = function() {

        var url = Paths.mkApiRootPath("/apps/" + HostApp.stringForKey("app_id"));
        var http_method = "DELETE";
        var auth_header = Hmac.makeAuthHeader(
            url, 
            http_method, 
            HostApp.stringForKey("app_mac_key"), 
            HostApp.stringForKey("app_mac_key_id")
        );

        Paths.getURL(url, http_method, function(resp) {
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
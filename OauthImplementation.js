//
//  OauthImplementation.js
//  Tentia
//
//  Created by Jeena on 19.09.11.
//  Licence: BSD (see attached LICENCE.txt file).
//

function getUrlVars(url) {
        var vars = [], hash;
        if(url.indexOf("#") > -1) url = url.slice(0, url.indexOf("#"));
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
        }
        return vars;
}

function OauthImplementation() {
    this.app_info = {
        "id": null,
        "name": "Tentia",
        "description": "A small TentStatus client.",
        "url": "http://jabs.nu/Tentia/",
        "icon": "http://jabs.nu/Tentia/icon.png",
        "redirect_uris": [
            "tentia://oauthtoken"
        ],
        "scopes": {
            "read_posts": "Uses posts to show them in a list",
            "write_posts": "Posts on users behalf"
        }
    };
    this.register_data = null;
    this.profile = null;
    this.state = null;

    this.authenticate();
}

OauthImplementation.prototype.authenticate = function() {
    this.entity = controller.stringForKey_("entity");
    this.requestProfileURL(this.entity);
}

OauthImplementation.prototype.apiRoot = function() {
    return this.profile["https://tent.io/types/info/core/v0.1.0"]["servers"][0];
}

OauthImplementation.prototype.requestProfileURL = function (entity) {
    var those = this;
    findProfileURL(entity, function(profile_url) {
        those.register(profile_url);
    });
}

OauthImplementation.prototype.register = function (url) {
    var those = this;
    getURL(url, "GET", function(resp) {
        those.profile = JSON.parse(resp.responseText);
        controller.setString_forKey_(those.apiRoot(), "api_root");
        var callback = function(resp) {
            var data = JSON.parse(resp.responseText);
            those.authRequest(data);
        }
        getURL(those.apiRoot() + "/apps", "POST", callback, JSON.stringify(those.app_info));
    });
}

OauthImplementation.prototype.authRequest = function(register_data) {
    // id
    // mac_key_id
    // mac_key
    // mac_algorithm
    this.register_data = register_data;
    
    // Needed for later App Registration Modification
    controller.setString_forKey_(register_data["mac_key"], "app_mac_key");
    controller.setString_forKey_(register_data["mac_key_id"], "app_mac_key_id");
    controller.setString_forKey_(register_data["id"], "app_id");
    controller.setString_forKey_(register_data["mac_algorithm"], "app_mac_algorithm");

    this.state = makeid(19);
    var auth = "/oauth/authorize?client_id=" + register_data["id"]
                + "&redirect_uri=" + escape(this.app_info["redirect_uris"][0])
                + "&scope=" + Object.keys(this.app_info["scopes"]).join(",")
                + "&state=" + this.state
                + "&tent_post_types=" + escape("https://tent.io/types/posts/status/v0.1.0");

    controller.openURL_(this.apiRoot() + auth);
}

OauthImplementation.prototype.requestAccessToken = function(responseBody) {
        // /oauthtoken?code=51d0115b04d1ed94001dde751c5b360f&state=aQfH1VEohYsQr86qqyv
        var urlVars = getUrlVars(responseBody);
        if(this.state && this.state != "" && urlVars["state"] == this.state) {

            var url = this.apiRoot() + "/apps/" + this.register_data["id"] + "/authorizations";

            var requestBody = JSON.stringify({
                'code' : urlVars["code"],
                'token_type' : "mac"
            });

            var those = this;
            var http_method = "POST";
            var callback = function(resp) {
                those.requestAccessTokenTicketFinished(resp.responseText);
            };

            var auth_header = makeAuthHeader(
                    url, 
                    http_method, 
                    controller.stringForKey_("app_mac_key"), 
                    controller.stringForKey_("app_mac_key_id")
                );

            getURL(url, http_method, callback, requestBody, auth_header);

        } else {
            alert("State is not the same: {" + this.state + "} vs {" + urlVars["state"] + "}")
        }

        this.state = null; // reset the state
}

OauthImplementation.prototype.requestAccessTokenTicketFinished = function(responseBody) {

    var access = JSON.parse(responseBody); 
    
    controller.setString_forKey_(access["access_token"], "user_access_token");
    controller.setString_forKey_(access["mac_key"], "user_mac_key");
    controller.setString_forKey_(access["mac_algorithm"], "user_mac_algorithm");
    controller.setString_forKey_(access["token_type"], "user_token_type");

    controller.loggedIn();
}

var tentia_oauth;
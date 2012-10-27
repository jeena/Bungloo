//
//  OauthImplementation.js
//  Tentia
//
//  Created by Jeena on 19.09.11.
//  Licence: BSD (see attached LICENCE.txt file).
//

function getURL(url, type, callback, data, auth_header) {
    $.ajax({
        beforeSend: function(xhr) {
            if (data) {
                xhr.setRequestHeader("Content-Length", data.length);
            }

            if (auth_header) {
                xhr.setRequestHeader("Authorization", auth_header);                
            }
        },
        url: url,
        accepts: "application/vnd.tent.v0+json",
        contentType: "application/vnd.tent.v0+json",
        type: type,
        complete: callback,
        data: data,
        processData: false,
        error: function(xhr, ajaxOptions, thrownError) {
            alert("getURL ERROR:");
            alert(xhr.statusText);
            alert(ajaxOptions);
            alert(thrownError);
        }
    });
}

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

function makeAuthHeader(url, http_method, mac_key, mac_key_id) {

    url = URI(url);
    var nonce = makeid(8);
    var time_stamp = parseInt((new Date).getTime() / 1000, 10);

    var normalizedRequestString = "" 
                                + time_stamp + '\n'
                                + nonce + '\n'
                                + http_method + '\n'
                                + url.path() + '\n'
                                + url.hostname() + '\n'
                                + url.port() + '\n'
                                + '\n' ;

    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, mac_key);
    hmac.update(normalizedRequestString);
    var hash = hmac.finalize();
    var mac = hash.toString(CryptoJS.enc.Base64);

    return 'MAC id="' + mac_key_id +
            '", ts="' + time_stamp +
            '", nonce="' + nonce +
            '", mac="' + mac + '"';
}


function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function OauthImplementation(entity) {
    this.entity = entity || "http://lala.home.jeena.net:3002";
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
    this.requestProfileURL(this.entity);
}

OauthImplementation.prototype.apiRoot = function() {
    return this.profile["https://tent.io/types/info/core/v0.1.0"]["servers"][0];
}

OauthImplementation.prototype.requestProfileURL = function (entity) {
    var those = this;
    getURL(entity, "HEAD", function(resp) {
        var headers = resp.getAllResponseHeaders();
        var regex = /Link: <([^>]*)>; rel="https:\/\/tent.io\/rels\/profile"/;
        var profile_url = headers.match(regex)[1]
        if (profile_url == "/profile") {
            profile_url = entity + "/profile";
        }
        those.register(profile_url);
    });

}

OauthImplementation.prototype.register = function (url) {
    var those = this;
    getURL(url, "GET", function(resp) {
        those.profile = JSON.parse(resp.responseText);
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
            var callback = function(resp) {
                those.requestAccessTokenTicketFinished(resp.responseText);
            };

            var auth_header = makeAuthHeader(url, "POST", this.register_data["mac_key"], this.register_data["mac_key_id"]);
            getURL(url, "POST", callback, requestBody, auth_header);

        } else {
            alert("State is not the same: {" + this.state + "} vs {" + urlVars["state"] + "}")
        }

        this.state = null; // reset the state
}





OauthImplementation.prototype.requestAccessTokenTicketFinished = function(responseBody) {

    var secret_data = {
        access: JSON.parse(responseBody),
        register_data: this.register_data
    }

    controller.storeSecretData_(JSON.stringify(secret_data));
}

var tentia_oauth;
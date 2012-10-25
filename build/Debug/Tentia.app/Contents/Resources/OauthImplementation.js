//
//  OauthImplementation.js
//  Tentia
//
//  Created by Jeena on 19.09.11.
//  Licence: BSD (see attached LICENCE.txt file).
//

MY_ENTITY = "http://lala.home.jeena.net:3002";

var app_info = {
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

function getURL(url, type, callback, data) {
    $.ajax({
        url: url,
        accepts: "application/vnd.tent.v0+json",
        contentType: "application/vnd.tent.v0+json",
        type: type,
        complete: callback,
        data: data,
        processData: false,
        error: function(xhr, ajaxOptions, thrownError) {
             alert(xhr.statusText);
             alert(ajaxOptions);
             alert(thrownError);
        }
    });
}

function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function OauthImplementation() {
        this.requestProfileURL(MY_ENTITY);
        //this.requestAToken();
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
        alert(profile_url);
        those.register(profile_url);
    });

}

OauthImplementation.prototype.register = function (url) {
    var those = this;
    getURL(url, "GET", function(resp) {
        var profile = JSON.parse(resp.responseText);
        var server = profile["https://tent.io/types/info/core/v0.1.0"]["servers"][0];
        var callback = function(resp) {
            var data = JSON.parse(resp.responseText);
            those.authRequest(server, data);
        }
        alert(server + "/apps")
        getURL(server + "/apps", "POST", callback, JSON.stringify(app_info));
    });
}

OauthImplementation.prototype.authRequest = function(server, register_data) {
    // id
    // mac_key_id
    // mac_key
    // mac_algorithm
    var state = makeid(19);
    var auth = "/oauth/authorize?client_id=" + register_data["id"]
                + "&redirect_uri=" + escape(app_info["redirect_uris"][0])
                + "&scope=" + Object.keys(app_info["scopes"]).join(",")
                + "&state=" + state
                + "&tent_post_types=" + escape("https://tent.io/types/posts/status/v0.1.0");

    alert(server + auth)
    controller.openURL_(server + auth);
}







OauthImplementation.prototype.requestAToken = function() {
    var url = OAUTH_REQUEST_TOKEN_URL;
    var _this = this;
    
    var message = { method:"POST" , action:url };
    
    OAuth.completeRequest(message,
                            { consumerKey   : OAUTH_CONSUMER_KEY
                            , consumerSecret: OAUTH_CONSUMER_SECRET
                            //, token         : controller.oauth.accessToken.key
                            //, tokenSecret   : controller.oauth.accessToken.secret
                            });
        
    $.ajax({
                     beforeSend: function(xhr) {
                     xhr.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
                     },
                     url: url,
                     type: 'POST',
                     dataType: 'text',
                     success: function(data) {
                     _this.requestTokenTicketFinished(data);
                     },
                     error:function (xhr, ajaxOptions, thrownError) {
                     alert(xhr.statusText);
                     alert(ajaxOptions);
                     alert(thrownError);                
                     }
                     });

}

OauthImplementation.prototype.requestTokenTicketFinished = function(data) {
        controller.openURL_(OAUTH_USER_AUTHORIZATION_URL + "?" + data);
}

OauthImplementation.prototype.requestAccessToken = function(responseBody) {
        // "twittia://oauth_token?oauth_token=jCcf7ClzJMbE4coZdONi467OAQxRGOBZJsuopG8C8&oauth_verifier=BK2ZkAIz51lqI4qta8MnKc280GyDLy0OQBpdsEmjT40"
        alert("XXX");
        alert(responseBody);


        /*
        var urlVars = getUrlVars(responseBody);
        
        var url = OAUTH_ACCESS_TOKEN_URL;
    var _this = this;
        var accessTokenKey = getUrlVars(responseBody)
    
    var message = { method:"POST" , action:url };
    
    OAuth.completeRequest(message,
                            { consumerKey   : OAUTH_CONSUMER_KEY
                            , consumerSecret: OAUTH_CONSUMER_SECRET
                            , token         : urlVars["oauth_token"]
                            , tokenSecret   : urlVars["oauth_verifier"]
                            });
        
    $.ajax({
                     beforeSend: function(xhr) {
                     xhr.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
                     },
                     url: url,
                     type: 'POST',
                     dataType: 'text',
                     success: function(data) {
                     _this.requestAccessTokenTicketFinished(data);
                     },
                     error:function (xhr, ajaxOptions, thrownError) {
                     alert(xhr.statusText);
                     alert(ajaxOptions);
                     alert(thrownError);                
                     }
                     });*/
}

OauthImplementation.prototype.requestAccessTokenTicketFinished = function(responseBody) {
        var urlVars = getUrlVars(responseBody);
        controller.storeAccessToken_secret_userId_andScreenName_(
                                                                                                                         urlVars["oauth_token"],
                                                                                                                         urlVars["oauth_token_secret"],
                                                                                                                         urlVars["user_id"],
                                                                                                                         urlVars["screen_name"]
                                                                                                                         );
}

function getUrlVars(url)
{
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

var tentia_oauth;
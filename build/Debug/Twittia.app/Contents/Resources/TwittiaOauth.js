//
//  TwittiaOauth.js
//  Tentia
//
//  Created by Jeena on 19.09.11.
//  Licence: BSD (see attached LICENCE.txt file).
//

function TwittiaOauth() {
    this.requestAToken();
}

TwittiaOauth.prototype.requestAToken = function() {
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

TwittiaOauth.prototype.requestTokenTicketFinished = function(data) {
    controller.openURL_(OAUTH_USER_AUTHORIZATION_URL + "?" + data);
}

TwittiaOauth.prototype.requestAccessToken = function(responseBody) {
    // "twittia://oauth_token?oauth_token=jCcf7ClzJMbE4coZdONi467OAQxRGOBZJsuopG8C8&oauth_verifier=BK2ZkAIz51lqI4qta8MnKc280GyDLy0OQBpdsEmjT40"
    
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
           });
}

TwittiaOauth.prototype.requestAccessTokenTicketFinished = function(responseBody) {
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

var twittia_oauth;
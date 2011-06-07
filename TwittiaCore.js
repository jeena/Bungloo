//
//  TwittiaCore.js
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

API_PATH = "http://api.twitter.com/1/";
WEBSITE_PATH = "http://twitter.com/";
//API_PATH = "http://identi.ca/api/";

function Twittia(action) {
	this.max_length = 100;
	this.since_id;
	this.timeout = 2 * 60 * 1000;
	this.action = action;
	this.getNewData();
	this.unread_mentions = 0;
	
	this.body = document.createElement("ol");
	this.body.className = this.action;
}

Twittia.prototype.newStatus = function(status, supress_new_with_timeout) {
	if(status != null) {
		for(var i = status.length-1, c=0; i>=c; --i) {
			if(this.body.childNodes.length > 0) {
				if(this.body.childNodes.length > this.max_length) {
					this.body.removeChild(this.body.lastChild);
				}
				this.body.insertBefore(this.getItem(status[i]),	this.body.firstChild);
			} else {
				this.body.appendChild(this.getItem(status[i]));
			}
		}
	}
	
	if(!supress_new_with_timeout) {
		var _this = this;
		setTimeout(function() { _this.getNewData() }, this.timeout);
	}
	if(this.action == "mentions" && this.is_not_init) {
		this.unread_mentions += status.length;
		controller.unreadMentions_(this.unread_mentions);
	}
	this.is_not_init = true;
}

Twittia.prototype.getItem = function(status) {
	var _this = this;
	this.since_id = status.id_str;
	
	
	if(status.retweeted_status != null) {
		var original_status = status;
		var status = status.retweeted_status;
	}

	var template = this.getTemplate();
	/*
	template.item.id = "id-" + status.id_str;
	template.item.onmousedown = function(e) { if(e.button == 2) {
		var target = e.target;
		while(target.nodeName != "LI" && target != null) {
			target = target.parentNode;
		}
		
		alert(target.id);
	}}*/
	template.reply_to.onclick = function() { replyTo(status.user.screen_name, status.id_str); return false; }
	template.retweet.onclick = function() { template.retweet.className = "hidden"; _this.retweet(status.id_str, template.item); return false; }
	
	template.image.src = status.user.profile_image_url;
	template.username.innerText = status.user.screen_name;
	template.username.href = API_PATH + status.user.screen_name
	
	if(original_status != null) {
		var retweeted = document.createElement("span")
		retweeted.className = "retweeted";
		var retweeted_icon = document.createElement("span");
		retweeted_icon.innerText = " ";
		retweeted.appendChild(retweeted_icon);
		var retweeted_by = document.createElement("a");
		retweeted_by.innerText = original_status.user.screen_name + " ";
		retweeted_by.href = API_PATH + original_status.user.screen_name;
		retweeted.appendChild(document.createTextNode("@"));
		retweeted.appendChild(retweeted_by);
		template.in_reply.parentNode.parentNode.insertBefore(retweeted, template.in_reply.parent);
	}
	
	if(status.in_reply_to_status_id != null) template.in_reply.innerText = status.in_reply_to_screen_name;
	else template.in_reply.parentNode.className = "hidden";
	template.in_reply.href = WEBSITE_PATH + status.in_reply_to_screen_name + "/status/" + status.in_reply_to_status_id;

	template.message.innerHTML = replaceTwitterLinks(replaceURLWithHTMLLinks(status.text));
	
	var time = document.createElement("abbr");
	time.innerText = status.created_at;
	time.title = status.created_at;
	time.className = "timeago";
	$(time).timeago();
	template.ago.appendChild(time);
	template.ago.href = WEBSITE_PATH +  status.user.screen_name + "/status/" + status.id_str;
	
	// {"type":"Point","coordinates":[57.10803113,12.25854746]}
	if (status.geo && status.geo.type == "Point") {
		template.geo.href = "http://maps.google.com/maps?q=" + status.geo.coordinates[0] + "," + status.geo.coordinates[1];
		template.geo.style.display = "";
	}
	
	template.source.innerHTML = status.source;
	
	return template.item;
}

Twittia.prototype.getTemplate = function() {

	if(this.template == "undefined") {
		return jQuery.extend(true, {}, this.template);
	}
	
	var a = document.createElement("a");
	
	var item = document.createElement("li");
	
	var reply_to = a.cloneNode();
	reply_to.className = "reply_to"
	reply_to.innerText = " ";
	reply_to.href = "#";
	item.appendChild(reply_to);
	
	var retweet = a.cloneNode();
	retweet.className = "retweet";
	retweet.innerText = " ";
	retweet.href = "#";
	item.appendChild(retweet);
	
	
	var image = document.createElement("img");
	image.className = "image";
	image.onmousedown = function(e) { e.preventDefault(); };
	item.appendChild(image);
	
	var image_username = a.cloneNode();
	image.appendChild(image_username);
	
	var data = document.createElement("div");
	data.className = "data";
	item.appendChild(data);
	
	var head = document.createElement("h1");
	data.appendChild(head);
	
	var username = a.cloneNode();
	head.appendChild(username);
	
	var in_reply = document.createElement("span");
	in_reply.className = "reply";
	head.appendChild(in_reply);
	
	var space = document.createTextNode(" ");
	head.appendChild(space);
	
	var geo = document.createElement("a");
	geo.style.display = "none";
	head.appendChild(geo);
	
	var pin = document.createElement("img");
	pin.src = "pin.png";
	pin.alt = "Map link";
	geo.appendChild(pin);
	
	var in_reply_text = document.createTextNode(" in reply to ");
	in_reply.appendChild(in_reply_text)
	
	var in_reply_a = a.cloneNode();
	in_reply.appendChild(in_reply_a);
	
	var message = document.createElement("p");
	message.className = "message";
	data.appendChild(message);
	
	var date = message.cloneNode();
	date.className = "date";
	data.appendChild(date);
	
	var ago = a.cloneNode();
	date.appendChild(ago);
	
	var from = document.createTextNode(" from ");
	date.appendChild(from)
	
	var source = document.createElement("span");
	source.className = "source";
	date.appendChild(source)
	
	this.template = {
		item: item,
		reply_to: reply_to,
		retweet: retweet,
		image: image,
		username: username,
		in_reply: in_reply_a,
		message: message,
		ago: ago,
		source: source,
		geo: geo
	}

	return jQuery.extend(true, {}, this.template);
}


Twittia.prototype.getNewData = function(supress_new_with_timeout) {

	var url = API_PATH + "statuses/" + this.action + ".json"
	var parameters = {count: this.max_length}
	if(this.since_id) parameters.since_id = this.since_id

	
	var url2 = "?count=" + this.max_length;
	if(this.since_id) url2 += "&since_id=" + this.since_id;
	var _this = this;
	
	var message = { method:"GET" , action:url, parameters: parameters };
	
	OAuth.completeRequest(message,
						  { consumerKey   : controller.oauth.consumerToken.key
						  , consumerSecret: controller.oauth.consumerToken.secret
						  , token         : controller.oauth.accessToken.key
						  , tokenSecret   : controller.oauth.accessToken.secret
						  });

	$.ajax(
		   {	beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
				},
				url: url + url2,
				dataType: 'json',
				success: function(data) {
					_this.newStatus(data, supress_new_with_timeout);
				},
				error:function (xhr, ajaxOptions, thrownError){
					alert(xhr.status);
					alert(thrownError);
					setTimeout(function() { _this.getNewData(supress_new_with_timeout) }, this.timeout);
			}
		   }
	);
}


Twittia.prototype.sendNewTweet = function(tweet, in_reply_to_status_id) {
	
	var url = API_PATH + "statuses/update.json";
	var data = "source=twittia&status=" + OAuth.percentEncode(tweet);
	if(in_reply_to_status_id != '') data += "&in_reply_to_status_id=" + in_reply_to_status_id
		
	var parameters = { source: "twittia", status: tweet };
	if(in_reply_to_status_id != '') parameters.in_reply_to_status_id = in_reply_to_status_id;
		
	var _this = this;
	
	var message = { method:"POST" , action:url, parameters:parameters };
	
	OAuth.completeRequest(message,
						  { consumerKey   : controller.oauth.consumerToken.key
						  , consumerSecret: controller.oauth.consumerToken.secret
						  , token         : controller.oauth.accessToken.key
						  , tokenSecret   : controller.oauth.accessToken.secret
						  });	
		
	$.ajax({
		beforeSend: function(xhr) {
		   xhr.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
		},
		url: url,
		type: 'POST',
		data: data,
		dataType: 'json',
		success: function(data) {
			_this.getNewData(true);
		},
		error:function (xhr, ajaxOptions, thrownError) {
			alert(xhr.status);
			alert(thrownError);				
		}
	});
}


Twittia.prototype.retweet = function(status_id, item) {
	var url = API_PATH + "statuses/retweet/" + status_id + ".json";
	var _this = this;
	
	var message = { method:"POST" , action:url };
	
	OAuth.completeRequest(message,
						  { consumerKey   : controller.oauth.consumerToken.key
						  , consumerSecret: controller.oauth.consumerToken.secret
						  , token         : controller.oauth.accessToken.key
						  , tokenSecret   : controller.oauth.accessToken.secret
						  });
		
	$.ajax({
		beforeSend: function(xhr) {
		   xhr.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
		},
		url: url,
		type: 'POST',
		dataType: 'json',
		success: function(data) {
			item.parentNode.replaceChild(_this.getItem(data), item);
		},
		error:function (xhr, ajaxOptions, thrownError) {
			alert(xhr.status);
			alert(thrownError);				
		}
	});
}

Twittia.prototype.authorizationHeader = function(method, url, params) {	
	if(params == undefined)
	    params = '';
    if(method == undefined)
	    method = 'GET';    
    var timestamp = OAuth.timestamp();
    var nonce = OAuth.nonce(11);
    var accessor = { consumerSecret: controller.oauth.consumerToken.secret, tokenSecret: controller.oauth.accessToken.secret };

    var message = {method: method, action: url, parameters: OAuth.decodeForm(params)};
    message.parameters.push(['oauth_consumer_key',controller.oauth.consumerToken.key]);
    message.parameters.push(['oauth_nonce',nonce]);
    message.parameters.push(['oauth_signature_method','HMAC-SHA1']);
    message.parameters.push(['oauth_timestamp',timestamp]);
	message.parameters.push(['oauth_token', controller.oauth.accessToken.key]);
    message.parameters.push(['oauth_version','1.0']);
    message.parameters.sort()
    
	OAuth.SignatureMethod.sign(message, accessor);
	
    return OAuth.getAuthorizationHeader("", message.parameters);
}

function replaceURLWithHTMLLinks(text) {
	var exp = /(\b(https?|ftp|file):\/\/\S+)/ig;
	return text.replace(exp,"<a href='$1'>$1</a>"); 
}

function replaceTwitterLinks(text) {
	var username = /(^|\s)(@)(\w+)/ig;
	var hash = /(^|\s)(#)(\w+)/ig;
	text = text.replace(username, "$1$2<a href='http://twitter.com/$3'>$3</a>");
	return text.replace(hash, "$1$2<a href='http://search.twitter.com/search?q=%23$3'>$3</a>");
}

function replyTo(username, status_id) {
	controller.openNewTweetWindowInReplyTo_statusId_(username, status_id);
}

function loadPlugin(url) {
	var plugin = document.createElement("script");
	plugin.type = "text/javascript";
	plugin.src = url;
	document.getElementsByTagName("head")[0].appendChild(plugin);
}


var twittia_instance;

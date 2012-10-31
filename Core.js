//
//  Core.js
//  Tentia
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

function Core(action) {
    this.max_length = 200;
    // this.timeout = 2 * 60 * 1000;
    this.timeout = 10 * 1000; // every 10 seconds
    this.action = action;
    this.getNewData();
    this.unread_mentions = 0;
    this.since_id = null;
    this.since_id_entity = null;
    this.since_time = 0;

    this.body = document.createElement("ol");
    this.body.className = this.action;
    this.cache = {};
    this.is_not_init = false;

/*
    if (action == "home_timeline") {
        this.usernames = [];
        this.getUsernames("friends");
        this.getUsernames("followers");
    }
*/
}

Core.prototype.newStatus = function(status, supress_new_with_timeout) {
	if(status != null && status.length > 0) {
        this.since_id = status[0]["id"];
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

Core.prototype.getItem = function(status) {

	var _this = this;
	this.since_id = status.id;
    this.since_id_entity = status.entity;
    if (this.since_time < status.published_at) this.since_time = status.published_at;
	
    var original_status = null;
	/*
	if(status.retweeted_status != null) {
		var original_status = status;
		var status = status.retweeted_status;
	}*/

	var template = this.getTemplate();

	template.reply_to.onclick = function() {
        var mentions = [];
        for (var i = 0; i < status.mentions.length; i++) {
            var mention = status.mentions[i];
            if(mention.entity != controller.stringForKey_("entity"))
                mentions.push(mention);
        };
        replyTo(status.entity, status.id, mentions);
        return false;
    }
	//template.retweet.onclick = function() { template.retweet.className = "hidden"; _this.retweet(status.id_str, template.item); return false; }
	
	//template.image.src = status.user.profile_image_url;
	template.username.innerText = status.entity;
	template.username.href = status.entity; // FIXME open profile

    findProfileURL(status.entity, function(profile_url) {
        if (profile_url) {
            getURL(profile_url, "GET", function(resp) {
                var profile = JSON.parse(resp.responseText);
                var basic = profile["https://tent.io/types/info/basic/v0.1.0"];

                if (profile && basic) {
                    if(basic.name) {
                        template.username.title = template.username.innerText;
                        template.username.innerText = basic.name;
                    }
                    if(basic.avatar_url) template.image.src = basic.avatar_url;                    
                }
            });
        }
    });

	/*
	if(original_status != null) {
		var retweeted = document.createElement("span")
		retweeted.className = "retweeted";
		var retweeted_icon = document.createElement("span");
		retweeted_icon.innerText = " ";
		retweeted.appendChild(retweeted_icon);
		var retweeted_by = document.createElement("a");
		retweeted_by.innerText = original_status.user.screen_name + " ";
		retweeted_by.href = WEBSITE_PATH + original_status.user.screen_name;
		retweeted.appendChild(document.createTextNode("@"));
		retweeted.appendChild(retweeted_by);
		template.in_reply.parentNode.parentNode.insertBefore(retweeted, template.in_reply.parent);
	}*/
	
	/*if(status.in_reply_to_status_id_str != null) template.in_reply.innerText = status.in_reply_to_screen_name;
	else */template.in_reply.parentNode.className = "hidden";
	//template.in_reply.href = WEBSITE_PATH + status.in_reply_to_screen_name + "/status/" + status.in_reply_to_status_id_str;

	template.message.innerHTML = replaceUsernamesWithLinks(replaceURLWithHTMLLinks(status.content.text, status.entities, template.message));
	
	var time = document.createElement("abbr");
	time.innerText = ISODateString(new Date(status.published_at * 1000));
	time.title = time.innerText;
	time.className = "timeago";
	$(time).timeago();
	template.ago.appendChild(time);
	//template.ago.href = WEBSITE_PATH +  status.user.screen_name + "/status/" + status.id_str;
	
	// {"type":"Point","coordinates":[57.10803113,12.25854746]}
	if (status.content && status.content.location && status.content.location.type == "Point") {
		template.geo.href = "http://maps.google.com/maps?q=" + status.content.location.coordinates[0] + "," + status.content.location.coordinates[1];
		template.geo.style.display = "";
	}
	
    template.source.href = status.app.url;
	template.source.innerHTML = status.app.name;
    template.source.title = status.app.url;
    /*
    if(status.entities.media) {
        
        for(var i=0; i<status.entities.media.length; i++) {
            var media = status.entities.media[i];
            
            if(media.type == "photo") {
                var a = document.createElement("a");
                a.href = media.media_url;
                template.message.innerHTML = template.message.innerHTML.replace(media.url, "");
                alert(media.url)
                
                var img = document.createElement("img");
                img.className = "photo";
                img.src = media.media_url + ":small";
                
                a.appendChild(img);
                template.images.appendChild(a);
                
            } else if(media.type == "tentia_youtube") {
                var a = document.createElement("a");
                a.href = media.url;
                
                var img = document.createElement("img");
                img.className = "video";
                img.src = media.media_url;
                
                a.appendChild(img);
                template.images.appendChild(a);
            } else if(media.type == "tentia_photo") {
                var a = document.createElement("a");
                a.href = media.url;
                
                var img = document.createElement("img");
                img.className = "photo";
                img.src = media.media_url;
                
                a.appendChild(img);
                template.images.appendChild(a);            
            }
        }    
    }
	*/
	return template.item;
}

Core.prototype.getTemplate = function() {

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
	// item.appendChild(retweet); // FIXME
	
	
	var image = document.createElement("img");
	image.className = "image";
    image.src = "default-avatar.png";
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
    
    var images = document.createElement("p")
    images.className = "images";
    data.appendChild(images);
	
	var date = message.cloneNode();
	date.className = "date";
	data.appendChild(date);
	
	var ago = a.cloneNode();
	date.appendChild(ago);
	
	var from = document.createTextNode(" from ");
	date.appendChild(from)
	
	var source = document.createElement("a");
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
		geo: geo,
        images: images
	}

	return jQuery.extend(true, {}, this.template);
}

Core.prototype.getNewData = function(supress_new_with_timeout) {

    var those = this;
    var url = URI(controller.stringForKey_("api_root"));
    url.path("posts");
    url.addSearch("post_types", "https://tent.io/types/post/status/v0.1.0");
    url.addSearch("limit", this.max_length);
    if(this.since_id) {
        url.addSearch("since_id", this.since_id);
        url.addSearch("since_id_entity", this.since_id_entity);
    }

    if (this.action == "mentions") {
        url.addSearch("mentioned_entity", controller.stringForKey_("entity"));
    }

    var http_method = "GET";
    var callback = function(resp) {
        
        try {
            var json = JSON.parse(resp.responseText)
        } catch (e) {
            //alert(resp.responseText);
            alert(url + " JSON parse error");
            throw e;
        }

        those.newStatus(json, supress_new_with_timeout);
    }

    var data = null;

    getURL(
        url.toString(), 
        http_method, 
        callback, 
        data, 
        makeAuthHeader(
            url.toString(), 
            http_method, 
            controller.stringForKey_("user_mac_key"), 
            controller.stringForKey_("user_access_token")
        )
    ); // FIXME: error callback

    /*
	$.ajax(
		   {	beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", );
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
	);*/
}


Core.prototype.sendNewMessage = function(content, in_reply_to_status_id, in_reply_to_entity) {

    var _this = this;

    var url = URI(controller.stringForKey_("api_root") + "/posts");

    var http_method = "POST";
    var callback = function(data) { _this.getNewData(true); }

    var data = {
        "type": "https://tent.io/types/post/status/v0.1.0",
        "published_at": (new Date().getTime() / 1000),
        "permissions": {
            "public": true
        },
        "content": {
            "text": content,
        },
    };

    var mentions = parseMentions(content, in_reply_to_status_id, in_reply_to_entity);
    if (mentions.length > 0) {
        data["mentions"] = mentions;
    }

    getURL(
        url.toString(), 
        http_method, 
        callback, 
        JSON.stringify(data),
        makeAuthHeader(
            url.toString(), 
            http_method, 
            controller.stringForKey_("user_mac_key"), 
            controller.stringForKey_("user_access_token")
        )
    ); // FIXME: error callback
	
    /*
	var url = API_PATH + "statuses/update.json";
	var data = "source=tentia&status=" + OAuth.percentEncode(tweet);
	if(in_reply_to_status_id != '') data += "&in_reply_to_status_id=" + in_reply_to_status_id
		
	var parameters = { source: "tentia", status: tweet };
	if(in_reply_to_status_id != '') parameters.in_reply_to_status_id = in_reply_to_status_id;
		
	var _this = this;
	
	var message = { method:"POST" , action:url, parameters:parameters };
	
	OAuth.completeRequest(message,
						  { consumerKey   : OAUTH_CONSUMER_KEY
						  , consumerSecret: OAUTH_CONSUMER_SECRET
						  , token         : controller.accessToken.accessToken()
						  , tokenSecret   : controller.accessToken.secret()
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
	});*/
}

/*

Core.prototype.retweet = function(status_id, item) {
	var url = API_PATH + "statuses/retweet/" + status_id + ".json";
	var _this = this;
	
	var message = { method:"POST" , action:url };
	
	OAuth.completeRequest(message,
						  { consumerKey   : OAUTH_CONSUMER_KEY
						  , consumerSecret: OAUTH_CONSUMER_SECRET
						  , token         : controller.accessToken.accessToken()
						  , tokenSecret   : controller.accessToken.secret()
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

Core.prototype.getUsernames = function(type, cursor) {
  cursor = typeof cursor == "undefined" ? -1 : cursor;
  
  var url = API_PATH + type + "/ids.json";
  var _this = this;
  var parameters = { stringify_ids: "true", cursor:cursor };

  var message = { method:"GET" , action:url, parameters:parameters };

  OAuth.completeRequest(message,
  					  { consumerKey   : OAUTH_CONSUMER_KEY
  					  , consumerSecret: OAUTH_CONSUMER_SECRET
  					  , token         : controller.accessToken.accessToken()
  					  , tokenSecret   : controller.accessToken.secret()
  					  });

  $.ajax({
  	beforeSend: function(xhr) {
  	   xhr.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
  	},
  	url: url + "?stringify_ids=true&cursor=" + cursor ,
  	type: 'GET',
  	dataType: 'json',
  	success: function(data) {
      for (var i=0; i < data.ids.length; i = i + 100) {
        _this.getUsernamesFromIds(data.ids.slice(i, i + 100));
      }
  		if (data.next_cursor > 0) {
  		  _this.getUsernames(type, data.next_cursor);
  		}
  	},
  	error:function (xhr, ajaxOptions, thrownError) {
  		alert(xhr.status);
  		alert(thrownError);				
  	}
  });
}

Core.prototype.getUsernamesFromIds = function(ids) {
  
  var url = API_PATH + "users/lookup.json";
  var _this = this;
  var parameters = { user_id:ids.join(",") };
  var message = { method:"GET" , action:url, parameters:parameters };

  OAuth.completeRequest(message,
  					  { consumerKey   : OAUTH_CONSUMER_KEY
  					  , consumerSecret: OAUTH_CONSUMER_SECRET
  					  , token         : controller.accessToken.accessToken()
  					  , tokenSecret   : controller.accessToken.secret()
  					  });

  $.ajax({
  	beforeSend: function(xhr) {
  	   xhr.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
  	},
  	url: url + "?user_id=" + ids.join(","),
  	type: 'GET',
  	dataType: 'json',
  	success: function(data) {
      for (var i=0; i < data.length; i++) {
        _this.usernames.push(data[i].screen_name);
      }
  	},
  	error:function (xhr, ajaxOptions, thrownError) {
  		alert(xhr.status);
  		alert(thrownError);				
  	}
  });
}

Core.prototype.findUsernamesFor = function(query) {
  var ret = [];
  for (var i=0; i < this.usernames.length; i++) {
    if(this.usernames[i].startsWith(query)) {
      ret.push(this.usernames[i]);
    }
  }
  return ret;
}
*/
/* Helper functions */

function replaceURLWithHTMLLinks(text, entities, message_node) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_()|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a href='$1'>$1</a>");

    /*
    var urls = entities.urls;
    
    for(var i = 0; i<urls.length; i++) {
        
        var original = urls[i].url;
        var replace = urls[i].expanded_url == null ? original : urls[i].expanded_url;
        
        if(replace.startsWith("http://bit.ly/") || replace.startsWith("http://j.mp/")) {
            replaceShortened(replace, message_node);
        }

        text = text.replace(original, "<a href='" + original + "'>" + replace + "</a>");
        
        var media = null;
        
        // add thumbnail
        if(replace.startsWith("http://youtube.com/") || replace.startsWith("http://www.youtube.com/")) {
            var v = getUrlVars(replace)["v"];
            if (v) {
                media = {
                    type: "tentia_youtube",
                    url: original,
                    media_url: "http://img.youtube.com/vi/" + v + "/1.jpg"
                }            
            }
            
        } else if (replace.startsWith("http://twitpic.com/")) {
            media = {
                type: "tentia_photo",
                url: original,
                media_url: "http://twitpic.com/show/mini/" + replace.substring("http://twitpic.com/".length)
            }
            
        } else if (replace.startsWith("http://yfrog")) {
            media = {
                type: "tentia_photo",
                url: original,
                media_url: replace + ":small"
            }
            
        } else if (replace.startsWith("http://instagr.am/p/") || replace.startsWith("http://instagram.com/p/")) {
            media = {
                type: "tentia_photo",
                url: original,
                media_url: replace + "media?size=t"
            }
        }
        
        if(media) {
            if(entities.media) {
                entities.media.push(media);
            } else {
                entities.media = [media];
            }                
        }

    }

	return text;*/
}

function replaceUsernamesWithLinks(text, mentions) {
    return text; // FIXME!
	var username = /(^|\s)(\^)(\w+)/ig;
	var hash = /(^|\s)(#)(\w+)/ig;
	text = text.replace(username, "$1$2<a href='tentia://profile/$3'>$3</a>");
	return text.replace(hash, "$1$2<a href='http://search.twitter.com/search?q=%23$3'>$3</a>");
}

function replyTo(entity, status_id, mentions) {
    var string = "^" + entity + " ";
    for (var i = 0; i < mentions.length; i++) {
        string += "^" + mentions[i].entity + " ";
    }
	controller.openNewMessageWindowInReplyTo_statusId_withString_(entity, status_id, string);
}

function loadPlugin(url) {
	var plugin = document.createElement("script");
	plugin.type = "text/javascript";
	plugin.src = url;
	document.getElementsByTagName("head")[0].appendChild(plugin);
}

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

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
                   
function replaceShortened(url, message_node) {
    var api = "http://api.bitly.com";
    if(url.startsWith("http://j.mp/")) {
       api = "http://api.j.mp";
    }
    
    var api_url = api + "/v3/expand?format=json&apiKey=R_4fc2a1aa461d076556016390fa6400f6&login=twittia&shortUrl=" + url; // FIXME: new api key
    
    $.ajax({
           url: api_url,
           success: function(data) {
            var new_url = data.data.expand[0].long_url;
            if (new_url) {
                var regex = new RegExp(url, "g");
                message_node.innerHTML = message_node.innerHTML.replace(regex, new_url);
            }
           },
           error:function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
           }
    });
}

function parseMentions(text, post_id, entity) {
    var mentions = [];
    
    if (post_id && entity) {
        mentions.push({
            post: post_id,
            entity: entity
        })
    }
    
    var res = text.match(/((\^https?):\/\/\S+)/ig);

    if (res) {
        for (var i = 0; i < res.length; i++) {
            var e = res[i].substring(1);
            if (e != entity) {
                mentions.push({entity:e});
            }
        }
    }

    return mentions;
}

function ISODateString(d){
  function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'
}

var tentia_instance;
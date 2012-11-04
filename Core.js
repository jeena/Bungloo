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

    var _this = this;
    setInterval(function() { _this.getNewData() }, this.timeout);
}

Core.prototype.newStatus = function(status) {

	if(status != null && status.length > 0) {
		for(var i = status.length-1, c=0; i>=c; --i) {
			if(this.body.childNodes.length > 0) {
				if(this.body.childNodes.length > this.max_length) {
					this.body.removeChild(this.body.lastChild);
				}
			    this.body.insertBefore(this.getItem(status[i]), this.body.firstChild);
			} else {
                this.body.appendChild(this.getItem(status[i]));
			}
		}
	}
	
	if(this.action == "mentions" && this.is_not_init) {
		this.unread_mentions += status.length;
		controller.unreadMentions_(this.unread_mentions);
	}
	this.is_not_init = true;
}

Core.prototype.logout = function() {
    this.body.innerHTML = "";
}

Core.prototype.getItem = function(status) {

	var _this = this;
	this.since_id = status.id;
    this.since_id_entity = status.entity;

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
                    if(basic.avatar_url) {
                        template.image.onerror = function() { template.image.src = 'default-avatar.png' };
                        template.image.src = basic.avatar_url;
                    }
                }
            }, null, false); // do not send auth-headers
        }
    });
	
	template.in_reply.parentNode.className = "hidden";

	template.message.innerHTML = replaceUsernamesWithLinks(replaceURLWithHTMLLinks(status.content.text, status.entities, template.message));
    findMentions(template.message, status.mentions);
	
	var time = document.createElement("abbr");
	time.innerText = ISODateString(new Date(status.published_at * 1000));
	time.title = time.innerText;
	time.className = "timeago";
	$(time).timeago();
	template.ago.appendChild(time);
	
	// {"type":"Point","coordinates":[57.10803113,12.25854746]}
	if (status.content && status.content.location && status.content.location.type == "Point") {
		template.geo.href = "http://maps.google.com/maps?q=" + status.content.location.coordinates[0] + "," + status.content.location.coordinates[1];
		template.geo.style.display = "";
	}

    template.source.href = status.app.url;
	template.source.innerHTML = status.app.name;
    template.source.title = status.app.url;

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

Core.prototype.getNewData = function() {

    var those = this;
    var url = URI(mkApiRootPath("/posts"));
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

        those.newStatus(json);
    }

    var data = null;

    if (controller.stringForKey_("user_access_token")) {
        getURL(url.toString(), http_method, callback, data); // FIXME: error callback        
    }
}


Core.prototype.sendNewMessage = function(content, in_reply_to_status_id, in_reply_to_entity) {

    var _this = this;

    var url = URI(mkApiRootPath("/posts"));

    var http_method = "POST";
    var callback = function(data) { _this.getNewData(); }

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

    getURL(url.toString(), http_method, callback, JSON.stringify(data)); // FIXME: error callback
}

/* Helper functions */

function replaceURLWithHTMLLinks(text, entities, message_node) {
    var exp = /(([^\^]https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_()|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a href='$1'>$1</a>");
}

function replaceUsernamesWithLinks(text, mentions) {
    return text; // FIXME!
	var username = /(^|\s)(\^)(\w+)/ig;
	var hash = /(^|\s)(#)(\w+)/ig;
	text = text.replace(username, "$1$2<a href='tentia://profile/$3'>$3</a>");
	return text.replace(hash, "$1$2<a href='http://search.twitter.com/search?q=%23$3'>$3</a>");
}

function replyTo(entity, status_id, mentions) {
    var string = "^" + entity.replace("https://", "") + " ";
    for (var i = 0; i < mentions.length; i++) {
      var e = mentions[i].entity.replace("https://", "");
      if(string.indexOf(e) == -1) string += "^" + e + " ";
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

function findMentions(node, mentions) {
    var text = node.innerHTML;
    var mentions_in_text = [];
    var res = text.match(/(\^\S+)/ig);

    if (res) {
        for (var i = 0; i < res.length; i++) {
            var name = res[i];
            var e = name.substring(1);
            if (e.substring(0,7) != "http://" && e.substring(0,8) != "https://") {
              e = "https://" + e;
            }
            for (var j = 0; j < mentions.length; j++) {
                var m = mentions[j];
                if(m.entity.startsWith(e)) {
                    mentions_in_text.push({
                        entity: m.entity,
                        text: name
                    });
                }
            }
        }
    }

    for (var i = 0; i < mentions_in_text.length; i++) {
        var mention = mentions_in_text[i];

        (function(mention) { // need this closure
            findProfileURL(mention.entity, function(profile_url) {
                if (profile_url) {
                    getURL(profile_url, "GET", function(resp) {
                        var profile = JSON.parse(resp.responseText);
                        var basic = profile["https://tent.io/types/info/basic/v0.1.0"];

                        if (profile && basic) {
                            if(basic.name) {
                                var new_text = node.innerHTML.replace(
                                    mention.text, 
                                    "<strong class='name' title='" + mention.entity + "'" + ">"
                                    + basic.name
                                    + "</strong>"
                                );
                                node.innerHTML = new_text;
                            }
                        }
                    }, null, false); // do not send auth-headers
                }
            });
        })(mention);
    }
}

function parseMentions(text, post_id, entity) {
    var mentions = [];
    
    if (post_id && entity) {
        mentions.push({
            post: post_id,
            entity: entity
        })
    }
    
    var res = text.match(/(\^\S+)/ig);

    if (res) {
        for (var i = 0; i < res.length; i++) {
            var e = res[i].substring(1);
            if (e.substring(0,7) != "http://" && e.substring(0,8) != "https://") {
              e = "https://" + e;
            }
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

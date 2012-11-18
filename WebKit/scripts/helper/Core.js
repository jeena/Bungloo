define([
    "jquery",
    "helper/Paths",
    "lib/URI",
    "helper/HostApp",
    "helper/Followings",
    "lib/vendor/jquery.plugins"
],

function(jQuery, Paths, URI, HostApp, Followings) {

    function Core() {

        this.followings = new Followings();

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
        image.src = "img/default-avatar.png";
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

        head.appendChild(space.cloneNode());

        var is_private = document.createElement("span")
        is_private.className = "is_private";
        is_private.style.display = "none";
        is_private.innerHTML = "P";
        is_private.title = "Private";
        head.appendChild(is_private);

        head.appendChild(space.cloneNode());
        
        var pin = document.createElement("img");
        pin.src = "img/pin.png";
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
            is_private: is_private,
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

    Core.prototype.getStatusDOMElement = function(status) {

        var _this = this;

        var template = this.getTemplate();

        template.reply_to.onclick = function() {

            var mentions = [];
            for (var i = 0; i < status.mentions.length; i++) {
                var mention = status.mentions[i];
                if(mention.entity != HostApp.stringForKey("entity"))
                    mentions.push(mention);
            }

            _this.replyTo(status.entity, status.id, mentions);
            return false;
        }

        //template.retweet.onclick = function() { template.retweet.className = "hidden"; _this.retweet(status.id_str, template.item); return false; }
        
        template.username.innerText = status.entity;
        template.username.href = status.entity; // FIXME open profile

        var profile = function(profile) {

            var basic = profile["https://tent.io/types/info/basic/v0.1.0"];

            if (profile && basic) {
                if(basic.name) {
                    template.username.title = template.username.innerText;
                    template.username.innerText = basic.name;
                }
                if(basic.avatar_url) {
                    template.image.onerror = function() { template.image.src = 'img/default-avatar.png' };
                    template.image.src = basic.avatar_url;
                }
            }

        }

        if (this.followings.followings[status.entity]) {

            profile(this.followings.followings[status.entity].profile);

        } else {

            Paths.findProfileURL(status.entity, function(profile_url) {
                if (profile_url) {
                    Paths.getURL(profile_url, "GET", function(resp) {
                        var p = JSON.parse(resp.responseText);
                        profile(p)
                    }, null, false); // do not send auth-headers
                }
            });            
        }

        if (status && status.permissions && !status.permissions.public) {
            template.is_private.style.display = '';
        }
        
        template.in_reply.parentNode.className = "hidden";

        var text = status.content.text.replace(/\n/g, "<br>");
        var entities = [status.entity];
        status.mentions.map(function (mention) {
            entities.push(mention.entity)
        });

        template.message.innerHTML = this.replaceUsernamesWithLinks(
            this.replaceURLWithHTMLLinks(text, entities, template.message)
        );

        this.findMentions(template.message, status.mentions);
        
        var time = document.createElement("abbr");
        time.innerText = this.ISODateString(new Date(status.published_at * 1000));
        time.title = time.innerText;
        time.className = "timeago";
        jQuery(time).timeago();
        template.ago.appendChild(time);

        template.ago.href = "#"
        template.ago.onclick = function() {
            HostApp.showConversation(status.id, status.entity);
            return false;
        }
        
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

    Core.prototype.sendNewMessage = function(content, in_reply_to_status_id, in_reply_to_entity, callback) {

        var url = URI(Paths.mkApiRootPath("/posts"));

        var http_method = "POST";

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

        var mentions = this.parseMentions(content, in_reply_to_status_id, in_reply_to_entity);
        if (mentions.length > 0) {
            data["mentions"] = mentions;
        }

        Paths.getURL(url.toString(), http_method, callback, JSON.stringify(data)); // FIXME: error callback
    }


    Core.prototype.logout = function() {
        
        this.body.innerHTML = "";
    }
        

    // Helper functions

    Core.prototype.replaceShortened = function(url, message_node) {

        var api = "http://api.bitly.com";
        if(url.startsWith("http://j.mp/")) {
           api = "http://api.j.mp";
        }
        
        var api_url = api + "/v3/expand?format=json&apiKey=R_4fc2a1aa461d076556016390fa6400f6&login=twittia&shortUrl=" + url; // FIXME: new api key
        
        jQuery.ajax({
            url: api_url,
            success: function(data) {
                var new_url = data.data.expand[0].long_url;
                if (new_url) {
                    var regex = new RegExp(url, "g");
                    message_node.innerHTML = message_node.innerHTML.replace(regex, new_url);
                }
            },
            error:function (xhr, ajaxOptions, thrownError) {
                console.error(xhr.status);
                console.error(thrownError);
            }
        });
    }

    Core.prototype.findMentions = function(node, mentions) {

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

        var _this = this;
        for (var i = 0; i < mentions_in_text.length; i++) {
            var mention = mentions_in_text[i];

            (function(mention) { // need this closure

                var profile = function(profile) {
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
                }

                if (_this.followings.followings[mention.entity]) {

                    profile(_this.followings.followings[mention.entity].profile)

                } else {

                    Paths.findProfileURL(mention.entity, function(profile_url) {
                        if (profile_url) {
                            Paths.getURL(profile_url, "GET", function(resp) {
                                var p = JSON.parse(resp.responseText);
                                profile(p)
                            }, null, false); // do not send auth-headers
                        }
                    });
                }

            })(mention);
        }
    }

    Core.prototype.parseMentions = function(text, post_id, entity) {

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

    Core.prototype.ISODateString = function(d){

      function pad(n){return n<10 ? '0'+n : n}

      return d.getUTCFullYear()+'-'
          + pad(d.getUTCMonth()+1)+'-'
          + pad(d.getUTCDate())+'T'
          + pad(d.getUTCHours())+':'
          + pad(d.getUTCMinutes())+':'
          + pad(d.getUTCSeconds())+'Z'
    }

    Core.prototype.replaceURLWithHTMLLinks = function(text, entities, message_node) {

        var callback = function(url) {

            var result;

            if (entities && entities.some(function(x) { return x == url })) {
                result = url;
            } else {

                var protocol = "";
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    protocol = "http://";
                }
                result = '<a title="' + protocol + url + '"" href="' + protocol + url + '">' + url + '</a>';
            }

            return result;
        }

        return URI.withinString(text, callback);
    }

    Core.prototype.replaceUsernamesWithLinks = function(text, mentions) {
        var hash = /(^|\s)(#)(\w+)/ig;
        return text.replace(hash, "$1$2<a href='https://skate.io/search?q=%23$3'>$3</a>");
    }

    Core.prototype.replyTo = function(entity, status_id, mentions) {        

        var string = "^" + entity.replace("https://", "") + " ";
        for (var i = 0; i < mentions.length; i++) {
          var e = mentions[i].entity.replace("https://", "");
          if(string.indexOf(e) == -1) string += "^" + e + " ";
        }

        HostApp.openNewMessageWidow(entity, status_id, string);
    }

    return Core;

});
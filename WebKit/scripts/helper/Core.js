define([
    "jquery",
    "helper/Paths",
    "lib/URI",
    "helper/HostApp",
    "helper/Cache",
    "lib/Timeago"
],

function(jQuery, Paths, URI, HostApp, Cache) {

    function Core() {
        this.cache = new Cache();
    }

    Core.prototype.getTemplate = function() {

        if(this.template == "undefined") {
            return jQuery.extend(true, {}, this.template);
        }
        
        var a = document.createElement("a");
        
        var item = document.createElement("li");

        var aside = document.createElement("aside");
        item.appendChild(aside);
        
        var reply_to = a.cloneNode();
        reply_to.className = "reply_to"
        reply_to.innerText = " ";
        reply_to.href = "#";
        aside.appendChild(reply_to);
        
        var repost = a.cloneNode();
        repost.className = "repost";
        repost.innerText = " ";
        repost.href = "#";
        aside.appendChild(repost);

        var remove = a.cloneNode();
        remove.className = "remove";
        remove.innerText = " ";
        remove.href = "#";
        aside.appendChild(remove);
        
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

        head.appendChild(space.cloneNode());

        var reposted_by = document.createElement("span");
        reposted_by.className = "reposted_by";
        reposted_by.style.display = "none";

        var reposted_count = document.createElement("span");
        reposted_count.innerText = "by 0 people";
        reposted_by.appendChild(reposted_count)

        var reposted_list = document.createElement("ul");
        reposted_list.className = "reposted_list";
        reposted_by.appendChild(reposted_list);

        head.appendChild(reposted_by)

        
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
            image: image,
            username: username,
            repost: repost,
            reposted_by: reposted_by,
            message: message,
            ago: ago,
            source: source,
            geo: geo,
            images: images,
            remove: remove
        }

        return jQuery.extend(true, {}, this.template);;
    }

    Core.prototype.getStatusDOMElement = function(status) {

        var _this = this;

        var template = this.getTemplate();

        template.item.id = "post-" + status.id;
        template.item.status = status;

        if (HostApp.stringForKey("entity") == status.entity && typeof status.__repost == "undefined") {
            template.remove.onclick = function() {
                _this.remove(status.id);
                return false;
            }
        } else if (typeof status.__repost != "undefined" && HostApp.stringForKey("entity") == status.__repost.entity) {
            template.remove.onclick = function() {
                _this.remove(status.__repost.id);
                return false;
            }
        } else {
            template.remove.style.display = "none";
        }

        template.reply_to.onclick = function() {

            var mentions = [];
            var status_mentions = status.mentions.slice(0);

            if (typeof status.__repost != "undefined") {
                status_mentions.push({entity:status.__repost.entity});
            }
            for (var i = 0; i < status_mentions.length; i++) {
                var mention = status_mentions[i];
                if(mention.entity != HostApp.stringForKey("entity"))
                    mentions.push(mention);
            }

            _this.replyTo(status.entity, status.id, mentions, (status && status.permissions && !status.permissions.public));
            return false;
        }

        template.repost.onclick = function() {
            $(template.repost).hide();
            _this.repost(status.id, status.entity);
            return false;
        }

        template.username.innerText = status.entity;
        template.username.href = status.entity;
        template.username.title = status.entity;
        template.username.onclick = function() {
            HostApp.showProfileForEntity(status.entity);
            return false;
        }

        template.image.onclick = template.username.onclick;

        var profile_callback = function(p) {

            var basic = p["https://tent.io/types/info/basic/v0.1.0"];

            if (p && basic) {
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

        var p = this.cache.profiles.getItem(status.entity);

        if (p && p != "null") {

            profile_callback(p);

        } else {

            Paths.findProfileURL(status.entity, function(profile_url) {

                if (profile_url) {
                    Paths.getURL(profile_url, "GET", function(resp) {
                        var p = JSON.parse(resp.responseText);
                        if (p && p != "null") {
                            _this.cache.profiles.setItem(status.entity, p);
                            profile_callback(p);
                        }

                    }, null, false); // do not send auth-headers
                }
            });            
        }

        if (status && status.permissions && !status.permissions.public) {
            template.is_private.style.display = '';
        }
        
        var text = "";
        
        if (status.type == "https://tent.io/types/post/photo/v0.1.0") {
            text = status.content.caption;
        } else {
            if (status.content && status.content.text) {
                text = status.content.text;
            }
        }

        text = text.escapeHTML().replace(/\n/g, "<br>");

        var entities = [status.entity];
        status.mentions.map(function (mention) {
            entities.push(mention.entity)
        });

        template.message.innerHTML = this.replaceUsernamesWithLinks(
            this.replaceURLWithHTMLLinks(text, entities, template.message)
        );

        if (status.type == "https://tent.io/types/post/photo/v0.1.0") {

            for (var i = 0; i < status.attachments.length; i++) {
                // closure needed for the callback
                (function() {
                    
                    var attachment = status.attachments[i];

                    var img = new Image();

                    img.className = "photo";
                    template.images.appendChild(img);

                    var callback = function(resp) {
                        img.src = "data:" + attachment.type + ";base64," + resp.responseText;
                    }

                    if (status.entity == HostApp.stringForKey("entity")) {
                        var url = Paths.mkApiRootPath("/posts/" + status.id + "/attachments/" + attachment.name);
                        Paths.getURL(url, "GET", callback, null, null, attachment.type);
                    } else {
                        var url = Paths.mkApiRootPath("/posts/" + encodeURIComponent(status.entity) + "/" + status.id + "/attachments/" + attachment.name);
                        Paths.getURL(url, "GET", callback, null, null, attachment.type);
                    }
                })();
            }
        }

        this.findMentions(template.message, status.mentions);

        for (var i = 0; i < status.mentions.length; i++) {
            var mention = status.mentions[i];
            if (mention.entity == HostApp.stringForKey("entity")) {
                this.template.item.className = "mentioned";
                break;
            }
        }

        var published_at = typeof status.__repost == "undefined" ? status.published_at : status.__repost.published_at;
        var time = document.createElement("abbr");
        time.innerText = this.ISODateString(new Date(published_at * 1000));
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
        if (status.content && status.content.location && (typeof status.content.location.type == "undefined" || status.content.location.type == "Point")) {
            var href = "http://www.openstreetmap.org/?mlat=" + status.content.location.coordinates[0] + "&mlon=" + status.content.location.coordinates[1] + "&zoom=12"
            template.geo.href = href;
            template.geo.style.display = "";
        }

        if (typeof status.__repost != "undefined") {
            template.source.href = status.__repost.app.url;
            template.source.innerHTML = status.__repost.app.name;
            template.source.title = status.__repost.app.url;            
        } else {
            template.source.href = status.app.url;
            template.source.innerHTML = status.app.name;
            template.source.title = status.app.url;
        }

        return template.item;
    }


    Core.prototype.getRepost = function(repost, before_node) {

        var post = document.getElementById("post-" + repost.content.id);

        if (post) {

            if (repost.entity == HostApp.stringForKey("entity")) {
                var remove = $(post).find(".remove");
                remove.show();

                var _this = this;
                remove.get(0).onclick = function(e) {
                    var callback = function() {
                        remove.hide();
                        $(post).find(".repost").show();
                    }

                    _this.remove(repost.id, callback);
                    return false;
                };
            }

            var reposted_count = $(post).find(".reposted_by ul li").length + 1;
            
            var people_person = reposted_count == 1 ? "person" : "people";

            $(post).find(".reposted_by span").html("by " + reposted_count + " " + people_person);
            $(post).find(".reposted_by").show();

            var li = $("<li/>");
            li.attr("id", "post-" + repost.id)
            var a = $("<a/>");
            
            a.attr("href", repost.entity);
            a.attr("title", repost.entity);
            a.html(repost.entity);
            li.append(a);
            $(post).find(".reposted_by ul").append(li);   


            a.click(function(e) {
                HostApp.showProfileForEntity(repost.entity);
                return false;
            });

            var _this = this;
            Paths.findProfileURL(repost.entity, function(profile_url) {
                if (profile_url) {
                    Paths.getURL(profile_url, "GET", function(resp) {
                        if (resp.status >= 200 && resp.status < 400) {
                            var _p = JSON.parse(resp.responseText);
                            _this.cache.profiles.setItem(repost.entity, _p);

                            var basic = _p["https://tent.io/types/info/basic/v0.1.0"];
                            if (basic && basic.name) {
                                a.html(basic.name);
                            }

                        }
                    }, null, false); // do not send auth-headers
                }
            });

        } else {
            var _this = this;
            var callback = function(resp) {
                if (resp.status >= 200 && resp.status < 300 && before_node) {
                    var status = JSON.parse(resp.responseText);
                    status.__repost = repost;
                    var li = _this.getStatusDOMElement(status);
                    before_node.parentNode.insertBefore(li, before_node);
                    _this.getRepost(repost, before_node); // call this recursive because we now have the repost
                }
            }

            Paths.findProfileURL(repost.content.entity, function(profile_url) {
                if (profile_url) {

                    Paths.getURL(profile_url, "GET", function(resp) {

                        var profile = JSON.parse(resp.responseText);
                        var server = profile["https://tent.io/types/info/core/v0.1.0"].servers[0];
                        Paths.getURL(URI(server + "/posts/" + repost.content.id).toString(), "GET", callback, null, false);

                    }, null, false); // do not send auth-headers
                }
            });
        }
    }

    Core.prototype.sendNewMessage = function(content, in_reply_to_status_id, in_reply_to_entity, location, image_data_uri, is_private, callback) {

        if (image_data_uri) {

            this.sendNewMessageWithImage(content, in_reply_to_status_id, in_reply_to_entity, location, image_data_uri, is_private, callback);

        } else {

            var url = URI(Paths.mkApiRootPath("/posts"));

            var http_method = "POST";

            var data = {
                "type": "https://tent.io/types/post/status/v0.1.0",
                "published_at": parseInt(new Date().getTime() / 1000, 10),
                "permissions": {
                    "public": !is_private
                },
                "content": {
                    "text": content,
                },
            };

            if (location) {
                data["content"]["location"] = { "type": "Point", "coordinates": location }
            }

            var mentions = this.parseMentions(content, in_reply_to_status_id, in_reply_to_entity);

            if (mentions.length > 0) {
                data["mentions"] = mentions;
                if (is_private) {
                    var entities = {};
                    for (var i = 0; i < mentions.length; i++) {
                        var entity = mentions[i]["entity"]
                        entities[entity] = true;
                    };

                    data["permissions"]["entities"] = entities;
                }
            }

            Paths.getURL(url.toString(), http_method, callback, JSON.stringify(data));
        }
    }


    Core.prototype.repost = function(id, entity, callback) {
        var url = URI(Paths.mkApiRootPath("/posts"));

        var data = {
            "type": "https://tent.io/types/post/repost/v0.1.0",
            "published_at": parseInt(new Date().getTime() / 1000, 10),
            "permissions": {
                "public": true
            },
            "content": {
                "entity": entity,
                "id": id
            },
            "mentions": [
                {
                    "entity": entity,
                    "post": id
                }
            ]
        };

        Paths.getURL(url.toString(), "POST", callback, JSON.stringify(data));
    }

    Core.prototype.sendNewMessageWithImage = function(content, in_reply_to_status_id, in_reply_to_entity, location, image_data_uri, is_private, callback) {

        var url = URI(Paths.mkApiRootPath("/posts"));

        var data = {
            "type": "https://tent.io/types/post/photo/v0.1.0",
            "published_at": parseInt(new Date().getTime() / 1000, 10),
            "permissions": {
                "public": !is_private
            },
            "content": {
                "caption": content,
            },
        };

        if (location) {
            data["content"]["location"] = { "type": "Point", "coordinates": location }
        }

        var mentions = this.parseMentions(content, in_reply_to_status_id, in_reply_to_entity);
        if (mentions.length > 0) {
            data["mentions"] = mentions;
            if (is_private) {
                var entities = {};
                for (var i = 0; i < mentions.length; i++) {
                    var entity = mentions[i]["entity"]
                    entities[entity] = true;
                };

                data["permissions"]["entities"] = entities;
            }
        }

        var data_string = JSON.stringify(data);

        var boundary = "TentAttachment----------TentAttachment";
        var post = "--" + boundary + "\r\n";

        post += 'Content-Disposition: form-data; name="post"; filename="post.json"\r\n';
        post += 'Content-Length: ' + data_string.length + '\r\n';
        post += 'Content-Type: application/vnd.tent.v0+json\r\n';
        post += 'Content-Transfer-Encoding: binary\r\n\r\n';
        post += data_string;

        post += "\r\n--" + boundary + "\r\n";

        var blob_string = image_data_uri.split(',')[1];
        var mime_type = image_data_uri.split(',')[0].split(':')[1].split(';')[0];
        var ext = "png";
        if (mime_type == "image/jpeg") {
            ext = "jpeg";
        } else if (mime_type == "image/gif") {
            ext = "gif";
        }


        post += 'Content-Disposition: form-data; name="photos[0]"; filename="photo.' + ext + '"\r\n';
        post += 'Content-Length: ' + blob_string.length + "\r\n";
        post += 'Content-Type: ' + mime_type + "\r\n";
        post += 'Content-Transfer-Encoding: base64\r\n\r\n';
        post += blob_string;
        post += "\r\n--" + boundary + "--\r\n";

        var newCallback = function(resp) {
            if (resp.status == 403) {
                var err = JSON.parse(resp.responseText);
                HostApp.alertTitleWithMessage(resp.statusText, err.error);
            }
            callback(resp);
        }

        Paths.postMultipart(url.toString(), newCallback, post, boundary);
    }

    Core.prototype.remove = function(id, callback) {

        if (confirm("Really delete this post?")) {
            var url = URI(Paths.mkApiRootPath("/posts/" + id));
            Paths.getURL(url.toString(), "DELETE", callback);
        }
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
        
        var res = text.match(/(\^[\w:/.]+(?:[\w]))/ig);

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

                    if (profile) {
                        var name = mention.text;
                        if (basic && basic.name) {
                            name = basic.name;
                        }

                        var new_text = node.innerHTML.replace(
                            mention.text, 
                            "<a href='" + mention.entity + "' class='name' title='" + mention.entity + "'>"
                            + name
                            + "</a>"
                        );

                        // adding show profile on click
                        node.innerHTML = new_text;
                        $(node).find("a.name").click(function(e) {
                            HostApp.showProfileForEntity(e.target.title);
                            return false;
                        });

                        // adding comma between names when there is only
                        // a space in between.
                        var names = $(node).find("a.name");
                        names.each(function(i) {
                            if(this.nextSibling && $(this.nextSibling.nextSibling).hasClass("name") && this.nextSibling.nodeValue == " " ) {
                                $(this).after(",")
                            }
                        });
                    }
                }

                var p = _this.cache.profiles.getItem(mention.entity);
                if (p) {

                    profile(p);

                } else {

                    Paths.findProfileURL(mention.entity, function(profile_url) {
                        if (profile_url) {
                            Paths.getURL(profile_url, "GET", function(resp) {
                                if (resp.status >= 200 && resp.status < 400) {
                                    var p = JSON.parse(resp.responseText);
                                    _this.cache.profiles.setItem(mention.entity, p);
                                    profile(p)                                    
                                }
                            }, null, false); // do not send auth-headers
                        }
                    });
                }

            })(mention);
        }
    }

    Core.prototype.parseMentions = function(text, post_id, entity) {

        var mentions = [];
        
        if (post_id && entity && post_id != "(null)" && entity != "(null)") {
            mentions.push({
                post: post_id,
                entity: entity
            })
        }
        
        var res = text.match(/(\^[\w:/]+\.[\w:/.]+(?:[\w]))/ig);
       
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

    Core.prototype.replyTo = function(entity, status_id, mentions, is_private) {        

        var string = "^" + entity.replace("https://", "") + " ";
        for (var i = 0; i < mentions.length; i++) {
          var e = mentions[i].entity.replace("https://", "");
          if(string.indexOf(e) == -1) string += "^" + e + " ";
        }

        HostApp.openNewMessageWidow(entity, status_id, string, is_private);
    }

    Core.prototype.postDeleted = function(post_id, entity) {
        var li = document.getElementById("post-" + post_id);
        if (li) {
            if (li.parentNode == this.body) {
                this.body.removeChild(li);
            } else if($(li).parent().hasClass("reposted_list")) { // if it is a repost we are removing
                var ul = $(li).parent();
                ul.get(0).removeChild(li);
                if (ul.find("li").length == 0) {
                    ul.parent(".reposted_by").hide();
                } else {
                    var reposted_by = ul.parent(".reposted_by");
                    var reposted_count = reposted_by.find("ul li").length;
            
                    var people_person = reposted_count == 1 ? "person" : "people";

                    reposted_by.find("span").html("by " + reposted_count + " " + people_person);
                }
            }
            
        }
    };

    return Core;

});
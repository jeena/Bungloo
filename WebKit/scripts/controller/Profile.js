define([
    "helper/HostApp",
    "helper/Core",
    "helper/APICalls",
    "lib/URI"
],

function(HostApp, Core, APICalls, URI) {


    function Profile() {

        Core.call(this);

        this.action = "profile";

        this.posts_limit = 25;

        this.container = document.createElement("div");
        this.container.className = this.action;
        document.getElementById("content").appendChild(this.container);

        this.initProfileTemplate();
        this.hide();

        var _this = this;
        setTimeout(function() { _this.showProfileForEntity() }, 500); // Load users profile on start
    }

    Profile.prototype = Object.create(Core.prototype);
    

    Profile.prototype.show = function() {
        Core.prototype.show.call(this, this.container);
    }

    Profile.prototype.hide = function() {
        Core.prototype.hide.call(this, this.container);
    }

    Profile.prototype.logout = function() {
        this.container = "";
    }

    Profile.prototype.showList = function(list) {
        $(this.body).hide();
        $(this.followingsBody).hide();
        $(this.followersBody).hide();
        $(list).show();
    };

    Profile.prototype.showProfileForEntity = function(entity) {

        if (!entity) {
            entity = HostApp.stringForKey("entity");
        };

        this.clear();
        this.entity = entity;
        this.following = null;
        this.following_id = null;
        this.profile_template.entity.innerHTML = this.entity;
        this.profile_template.entity.href = this.entity;

        this.getProfile();
        this.getFollowing();
    }

    Profile.prototype.initProfileTemplate = function() {

        var _this = this;

        var header = document.createElement("header");
        header.className = "profile";

        this.container.appendChild(header);

        this.profile_template = {
            avatar: document.createElement("img"),
            name: document.createElement("h1"),
            entity: document.createElement("a"),
            bio: document.createElement("p"),
            relationships: document.createElement("td"),
            posts: document.createElement("a"),
            following: document.createElement("a"),
            followed: document.createElement("a"),
            birthdate: document.createElement("td"),
            location: document.createElement("td"),
            gender: document.createElement("td"),
            url: document.createElement("a"),
            following_button: document.createElement("button"),
            mention_button: document.createElement("button")
        };

        header.appendChild(this.profile_template.avatar);
        this.profile_template.avatar.src = "img/default-avatar.png";

        var div = document.createElement("div");
        header.appendChild(div);

        this.profile_template.following_button.onclick = function(e) {
            _this.toggleFollow()
        }
        div.appendChild(this.profile_template.following_button);

        this.profile_template.mention_button.onclick = function() {
            var e = _this.entity;
            if (e.startsWith("https://")) {
                e = e.substr(8, e.length);
            }
            HostApp.openNewMessageWidow(null, null, "^" + e + " ", false);
        }
        div.appendChild(this.profile_template.mention_button);
        this.profile_template.mention_button.innerHTML = "Mention";

        div.appendChild(this.profile_template.name);

        var p = document.createElement("p");
        p.appendChild(this.profile_template.entity);
        div.appendChild(p);

        div.appendChild(this.profile_template.bio);

        var table = document.createElement("table");
        div.appendChild(table);

        function mkLi(name, template) {
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            tr.style.display = "none";
            th.innerText = name + ": ";
            tr.appendChild(th);
            tr.appendChild(template);
            table.appendChild(tr);
        }

        mkLi("Birth date", this.profile_template.birthdate);
        mkLi("Location", this.profile_template.location);
        mkLi("Gender", this.profile_template.gender);

        var td = document.createElement("td");
        td.appendChild(this.profile_template.url);
        mkLi("Homepage", td);

        mkLi("Relationships", this.profile_template.relationships);

        td = document.createElement("td");
        td.appendChild(this.profile_template.posts);
        this.profile_template.posts.href = "#";
        this.profile_template.posts.onclick = function() { _this.showPosts(); return false; };
        mkLi("Posts", td);

        td = document.createElement("td");
        td.appendChild(this.profile_template.following);
        this.profile_template.following.href = "#";
        this.profile_template.following.onclick = function() { _this.showFollowings(); return false; };
        mkLi("Following", td);

        td = document.createElement("td");
        td.appendChild(this.profile_template.followed);
        this.profile_template.followed.href = "#";
        this.profile_template.followed.onclick = function() { _this.showFollowers(); return false; };
        mkLi("Followed by", td);


        this.body = document.createElement("ol");
        this.body.className = this.action;
        this.container.appendChild(this.body);

        this.followingsBody = document.createElement("ol");
        this.followingsBody.className = this.action + " followings";
        this.container.appendChild(this.followingsBody);

        this.followersBody = document.createElement("ol");
        this.followersBody.className = this.action + " folloewds";
        this.container.appendChild(this.followersBody);

    }

    Profile.prototype.clear = function() {

        this.server = null;
        this.before = {id: null, entity: null, loading: false};


        this.profile_template.avatar.src = "img/default-avatar.png";

        this.relationships = {
            following_you: false,
            followed_by_you: false,
            it_is_you: false
        }

        this.profile_template.name.innerText = "";
        this.profile_template.entity.innerText = "";
        this.profile_template.bio.innerText = "";
        this.profile_template.relationships.innerText = "";
        this.profile_template.posts.innerText = "";
        this.profile_template.following.innerText = "";
        this.profile_template.followed.innerText = "";
        this.profile_template.birthdate.innerText = "";
        this.profile_template.location.innerText = "";
        this.profile_template.gender.innerText = "";
        this.profile_template.url.innerText = "";
        this.profile_template.url.href = "";

        this.profile_template.posts.parentNode.parentNode.style.display = "none";
        this.profile_template.following.parentNode.parentNode.style.display = "none";
        this.profile_template.followed.parentNode.parentNode.style.display = "none";
        this.profile_template.birthdate.parentNode.style.display = "none";
        this.profile_template.location.parentNode.style.display = "none";
        this.profile_template.gender.parentNode.style.display = "none";
        this.profile_template.url.parentNode.parentNode.style.display = "none";

        this.profile_template.following_button.style.display = "";
        this.setFollowingButton(false);

        this.body.innerHTML = "";
        this.followingsBody.innerHTML = "";
        this.followersBody.innerHTML = "";

        this.showList(this.body);
    };

    Profile.prototype.getProfile = function() {

        var _this = this;

        if (HostApp.stringForKey("entity") == this.entity) {
            this.relationships.it_is_you = true;
            this.profile_template.following_button.style.display = "none";
        }

        var profile = this.cache.profiles.getItem(this.entity);

        if (profile && profile != "null") {

            this.showProfile(profile);
            this.profile = profile;

        } else {
            var url = HostApp.serverUrl("posts_feed") + "?types=" + encodeURIComponent("https://tent.io/types/meta/v0") + "&entities=" + encodeURIComponent(this.entity)
            debug(url)
            APICalls.get(url, {
                callback: function(resp) {
                    profile = JSON.parse(resp.responseText);
                    _this.showProfile(profile);
                    _this.profile = profile;
            }});
        }
    }

    Profile.prototype.getFollowing = function() {
        if(this.entity != HostApp.stringForKey("entity")) {
            var url = APICalls.mkApiRootPath("/followings") + "/" + encodeURIComponent(this.entity);
            var _this = this;
            APICalls.http_call(url, "GET", function(resp) {
                if (resp.status >= 200 && resp.status < 400) {
                    var following = JSON.parse(resp.responseText);
                    _this.following_id = following.id
                    _this.setFollowingButton(true);
                } else {
                    _this.setFollowingButton(false);
                    _this.following_id = null;
                }
            })
        } else {
            this.setFollowingButton(false);
            this.following_id = null;
        }
    }

    Profile.prototype.showProfile = function(profile) {

        debug(profile)
        return

        var basic = profile["https://tent.io/types/info/basic/v0.1.0"];

        if (profile && basic) {

            if(basic.avatar_url) {
                this.profile_template.avatar.onerror = function() { this.profile_template.avatar.src = 'img/default-avatar.png' };
                this.profile_template.avatar.src = basic.avatar_url;
            }

            this.populate(this.profile_template.name, basic.name);
            this.populate(this.profile_template.birthdate, basic.birthdate);
            this.populate(this.profile_template.location, basic.location);
            this.populate(this.profile_template.gender, basic.gender);
            this.populate(this.profile_template.bio, basic.bio);

            if(basic.website_url) {

                var url = basic.website_url;
                this.profile_template.url.innerText = url;
                this.profile_template.url.parentNode.parentNode.style.display = "";

                if (!url.startsWith("http")) {
                    url = "http://" + url;
                }

                this.profile_template.url.href = url;
            }
        }

        if (profile) {
            this.server = profile["https://tent.io/types/info/core/v0.1.0"]["servers"][0];
            this.getMeta(this.server);
            this.getStatuses(this.server);
        }
    }

    Profile.prototype.populate = function(t, v) {
        if (v) {
            t.innerText = v;
            t.parentNode.style.display = "";
            t.parentNode.parentNode.style.display = "";
        }
    }

    Profile.prototype.getMeta = function(root_url) {

        var _this = this;
        APICalls.http_call(URI(root_url + "/followings/count").toString(), "GET", function(resp) {

            _this.populate(_this.profile_template.following, resp.responseText);
        }, null, false);

        APICalls.http_call(URI(root_url + "/followers/count").toString(), "GET", function(resp) {

            _this.populate(_this.profile_template.followed, resp.responseText);
        }, null, false);

        if (this.entity != HostApp.stringForKey("entity")) {
            APICalls.http_call(URI(root_url + "/followers/" + encodeURIComponent(HostApp.stringForKey("entity"))).toString(), "GET", function(resp) {
                if (resp.status == 200) {
                    _this.relationships.following_you = true;
                }
                _this.setRelationships();

            }, null, false);

            APICalls.http_call(URI(APICalls.mkApiRootPath("/followings/" + encodeURIComponent(this.entity))), "GET", function(resp) {
                if (resp.status == 200) {
                    _this.relationships.followed_by_you = true;
                }
                _this.setRelationships();
            });

        } else {
            this.setRelationships();
        }

        var url = URI(root_url + "/posts/count");
        var post_types = [
            "https://tent.io/types/post/repost/v0.1.0",
            "https://tent.io/types/post/status/v0.1.0",
            "https://tent.io/types/post/photo/v0.1.0"
        ];
        url.addSearch("post_types", post_types.join(","));

        APICalls.http_call(url.toString(), "GET", function(resp) {

            _this.populate(_this.profile_template.posts, resp.responseText);
        }, null, false);
    }

    Profile.prototype.setRelationships = function() {
        var relation = "none";
        if (this.relationships.it_is_you) {
            relation = "it's you";
        } else {
            if (this.relationships.following_you && !this.relationships.followed_by_you) {
                relation = "is following you";
            } else if (this.relationships.following_you && this.relationships.followed_by_you) {
                relation = "you both follow each other";
            } else if (!this.relationships.following_you && this.relationships.followed_by_you) {
                relation = "being followed by you";
            }
        }
        this.populate(this.profile_template.relationships, relation);
    }


    Profile.prototype.getStatuses = function(root_url, add_search, append) {
        var _this = this;

        add_search = add_search || {};

        var url = URI(root_url + "/posts");
        url.addSearch("limit", this.posts_limit);

        var post_types = [
            "https://tent.io/types/post/repost/v0.1.0",
            "https://tent.io/types/post/status/v0.1.0",
            "https://tent.io/types/post/photo/v0.1.0"
        ];
        url.addSearch("post_types", post_types.join(","));

        for(var key in add_search) {
            url.addSearch(key, add_search[key]);
        }

        APICalls.http_call(url.toString(), "GET", function(resp) {

            var statuses = JSON.parse(resp.responseText);

            _this.newStatus(statuses, append);

        }, null, false);
    }


    Profile.prototype.newStatus = function(statuses, append) {

        if(statuses != null && statuses.length > 0) {

            this.before.loading = false;

            if (append) statuses = statuses.reverse();

            for(var i = statuses.length-1, c=0; i>=c; --i) {

                var status = statuses[i];

                if (status.type == "https://tent.io/types/post/status/v0.1.0" || status.type == "https://tent.io/types/post/photo/v0.1.0") {

                    var new_node = this.getStatusDOMElement(status);

                    if(!append && this.body.childNodes.length > 0) {

                        if(this.body.childNodes.length > this.max_length) {

                            this.body.removeChild(this.body.lastChild);
                        }

                        this.body.insertBefore(new_node, this.body.firstChild);

                    } else {

                        this.body.appendChild(new_node);
                    }

                } else if (status.type == "https://tent.io/types/post/delete/v0.1.0") {

                    var li = document.getElementById("post-" + status.content.id + "-" + this.action);
                    if (li) {
                        this.body.removeChild(li);
                    }
                } else if (status.type == "https://tent.io/types/post/repost/v0.1.0") {

                    this.getRepost(status, this.body.firstChild);
                }

            }
        }
    }

    Profile.prototype.getMoreStatusPosts = function() {
        if (!this.before.loading) {
            this.before.loading = true;
            var add_search = {
                "before_id": this.body.lastChild.status.id,
                "before_id_entity": this.body.lastChild.status.entity
            }
            this.getStatuses(this.server, add_search, true);            
        }
    }

    Profile.prototype.mention = function() {

    }

    Profile.prototype.setFollowingButton = function(following) {

        this.following = following;

        if (following) {
            this.profile_template.following_button.className = "following";
            this.profile_template.following_button.innerText = "Unfollow";
        } else {
            this.profile_template.following_button.className = "";
            this.profile_template.following_button.innerText = "Follow";
        }
    }

    Profile.prototype.toggleFollow = function() {

        var _this = this;

        if (this.following_id) {

            this.setFollowingButton(false);
            var url = APICalls.mkApiRootPath("/followings/") + this.following_id;
            APICalls.http_call(url, "DELETE", function(resp) {
                if (resp.status >= 200 && resp.status < 300) {
                    _this.setFollowingButton(false);
                    _this.following_id = null;
                } else {
                    _this.setFollowingButton(true);
                }
            });

        } else {

            this.setFollowingButton(true);
            var url = URI(APICalls.mkApiRootPath("/followings"));
            var data = JSON.stringify({"entity": this.entity });
            
            APICalls.http_call(url.toString(), "POST", function(resp) {
                if (resp.status >= 200 && resp.status < 300) {
                    _this.following_id = JSON.parse(resp.responseText).id
                    _this.setFollowingButton(true);
                } else {
                    _this.setFollowingButton(false);
                }
            }, data);
        }
    }

    Profile.prototype.showPosts = function() {
        this.showList(this.body);
    }

    Profile.prototype.showFollowings = function() {

        this.showList(this.followingsBody);
        this.followingsBody.innerHTML = "";

        var _this = this;
        var callback = function(resp) {
            var followings = JSON.parse(resp.responseText);
            for (var i = 0; i < followings.length; i++) {
                var li = _this.getDOMSmallProfile(followings[i]);
                _this.followingsBody.appendChild(li);
            }
        }

        var url = URI(this.server + "/followings");
        url.addSearch("limit", 200);
        APICalls.http_call(url.toString(), "GET", callback, null, false);
    }

    Profile.prototype.showFollowers = function() {

        this.showList(this.followersBody);
        this.followersBody.innerHTML = "";

        var _this = this;
        var callback = function(resp) {
            var followers = JSON.parse(resp.responseText);
            for (var i = 0; i < followers.length; i++) {
                var li = _this.getDOMSmallProfile(followers[i]);
                _this.followersBody.appendChild(li);
            }
        }

        var url = URI(this.server + "/followers");
        url.addSearch("limit", 200);
        APICalls.http_call(url.toString(), "GET", callback, null, false);
    }

    Profile.prototype.getDOMSmallProfile = function(profile) {

        var li = document.createElement("li");

        var image = document.createElement("img");
        image.title = profile.entity;
        image.className = "image";
        image.src = 'img/default-avatar.png';
        li.appendChild(image);
        image.onclick = function(e) {
            HostApp.showProfileForEntity(e.target.title);
            return false;
        }

        var div = document.createElement("div");
        div.className = "data"

        var h1 = document.createElement("h1");
        var username = document.createElement("a");
        username.title = profile.entity;
        username.className = "name";
        username.href = profile.entity;
        username.onclick = function(e) {
            HostApp.showProfileForEntity(profile.entity);
            return false;
        }

        h1.appendChild(username)
        div.appendChild(h1);
        li.appendChild(div);

        var p = document.createElement("p");
        p.className = "message";

        var entity_tag = document.createElement("a");
        entity_tag.innerText = profile.entity;
        entity_tag.href = profile.entity;
        entity_tag.title = profile.entity;

        var new_line = document.createElement("br");
        var follows_since = document.createTextNode("follows since ");
        var follows_since_time = document.createElement("span");
        follows_since_time.innerText = this.ISODateString(new Date(profile.created_at * 1000));
        follows_since_time.title = follows_since_time.innerText;
        follows_since_time.className = "timeago";
        jQuery(follows_since_time).timeago();

        p.appendChild(entity_tag);
        p.appendChild(new_line);
        p.appendChild(follows_since);
        p.appendChild(follows_since_time);
        div.appendChild(p);

        var profile_callback = function(p) {

            var basic = p["https://tent.io/types/info/basic/v0.1.0"];

            if (p && basic) {
                if(basic.name) {
                    username.title = username.innerText;
                    username.innerText = basic.name;
                }
                if(basic.avatar_url) {
                    image.onerror = function() { image.src = 'img/default-avatar.png'; };
                    image.src = basic.avatar_url;
                }
            }

        }

        var p = this.cache.profiles.getItem(profile.entity);

        if (p && p != "null") {

            profile_callback(p);

        } else {

            var _this = this;
            APICalls.findProfileURL(profile.entity, function(profile_url) {

                if (profile_url) {
                    APICalls.http_call(profile_url, "GET", function(resp) {
                        var p = JSON.parse(resp.responseText);
                        if (p && p != "null") {
                            _this.cache.profiles.setItem(profile.entity, p);
                            profile_callback(p);
                        }

                    }, null, false); // do not send auth-headers
                }
            });
        }

        return li;
    }


    return Profile;

});

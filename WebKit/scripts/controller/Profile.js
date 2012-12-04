define([
    "helper/HostApp",
    "helper/Core",
    "helper/Paths",
    "lib/URI"
],

function(HostApp, Core, Paths, URI) {


    function Profile() {

        Core.call(this);

        this.action = "profile";

        this.initProfileTemplate();
    }

    Profile.prototype = Object.create(Core.prototype);

    Profile.prototype.showProfileForEntity = function(entity) {

        this.clear();
        this.entity = entity;
        this.profile_template.entity.innerHTML = this.entity;
        this.profile_template.entity.href = this.entity;

        this.setFollowingButton(!!this.followings.followings[this.entity]);

        this.getProfile();
    }

    Profile.prototype.initProfileTemplate = function() {

        var _this = this;

        var header = document.createElement("header");
        header.className = "profile"
        document.body.appendChild(header);

        this.profile_template = {
            avatar: document.createElement("img"),
            name: document.createElement("h1"),
            entity: document.createElement("a"),
            bio: document.createElement("p"),
            posts: document.createElement("td"),
            following: document.createElement("td"),
            followed: document.createElement("td"),
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
            HostApp.openNewMessageWidow(null, null, "^" + e + " ");
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

        mkLi("Posts", this.profile_template.posts);
        mkLi("Following", this.profile_template.following);
        mkLi("Followed by", this.profile_template.followed);


        this.body = document.createElement("ol");
        this.body.className = this.action;
        document.body.appendChild(this.body);
    }

    Profile.prototype.clear = function() {

        this.profile_template.avatar.src = "img/default-avatar.png";

        this.profile_template.name.innerText = "";
        this.profile_template.entity.innerText = "";
        this.profile_template.bio.innerText = "";
        this.profile_template.posts.innerText = "";
        this.profile_template.following.innerText = "";
        this.profile_template.followed.innerText = "";
        this.profile_template.birthdate.innerText = "";
        this.profile_template.location.innerText = "";
        this.profile_template.gender.innerText = "";
        this.profile_template.url.innerText = "";
        this.profile_template.url.href = "";

        this.profile_template.posts.parentNode.style.display = "none";
        this.profile_template.following.parentNode.style.display = "none";
        this.profile_template.followed.parentNode.style.display = "none";
        this.profile_template.birthdate.parentNode.style.display = "none";
        this.profile_template.location.parentNode.style.display = "none";
        this.profile_template.gender.parentNode.style.display = "none";
        this.profile_template.url.parentNode.parentNode.style.display = "none";

        this.profile_template.following_button.style.display = "";
        this.setFollowingButton(false);

        this.body.innerHTML = "";
    };

    Profile.prototype.getProfile = function() {

        var _this = this;

        if (HostApp.stringForKey("entity") == this.entity) {
            this.profile_template.following_button.style.display = "none";
        }

        Paths.findProfileURL(this.entity, function(profile_url) {

            if (profile_url) {

                Paths.getURL(profile_url, "GET", function(resp) {

                    _this.showProfile(JSON.parse(resp.responseText));

                }, null, false); // do not send auth-headers
            }
        });
    }

    Profile.prototype.showProfile = function(profile) {

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
            
            if(basic.url) {

                var url = basic.url;
                this.profile_template.url.innerText = url;
                this.profile_template.url.parentNode.parentNode.style.display = "";

                if (!url.startsWith("http")) {
                    url = "http://" + url;
                }

                this.profile_template.url.href = url;
            }
        }

        if (profile) {
            var server = profile["https://tent.io/types/info/core/v0.1.0"]["servers"][0];
            this.getMeta(server);
            this.getStatuses(server);
        }
    }

    Profile.prototype.populate = function(t, v) {
        if (v) {
            t.innerText = v;
            t.parentNode.style.display = "";
        }
    }

    Profile.prototype.getMeta = function(root_url) {

        var _this = this;
        Paths.getURL(URI(root_url + "/followings/count").toString(), "GET", function(resp) {

            _this.populate(_this.profile_template.following, resp.responseText);
        }, null, false);

        Paths.getURL(URI(root_url + "/followers/count").toString(), "GET", function(resp) {

            _this.populate(_this.profile_template.followed, resp.responseText);
        }, null, false);

        Paths.getURL(URI(root_url + "/posts/count").toString(), "GET", function(resp) {

            _this.populate(_this.profile_template.posts, resp.responseText);
        }, null, false);
    }


    Profile.prototype.getStatuses = function(root_url) {
        var _this = this;

        var url = URI(root_url + "/posts");
        url.addSearch("limit", 20);

        var post_types = [
            "https://tent.io/types/post/repost/v0.1.0",
            "https://tent.io/types/post/status/v0.1.0",
            "https://tent.io/types/post/delete/v0.1.0",
            //"https://tent.io/types/post/photo/v0.1.0"
        ];
        url.addSearch("post_types", post_types.join(","));

        Paths.getURL(url.toString(), "GET", function(resp) {

            var statuses = JSON.parse(resp.responseText);

            _this.newStatus(statuses);

        }, null, false);
    }

    Profile.prototype.newStatus = function(statuses) {
        if(statuses != null && statuses.length > 0) {
            for(var i = statuses.length-1, c=0; i>=c; --i) {

                var status = statuses[i];
                this.since_id = status.id;
                this.since_id_entity = status.entity;

                if (status.type == "https://tent.io/types/post/status/v0.1.0" || status.type == "https://tent.io/types/post/photo/v0.1.0") {

                    var new_node = this.getStatusDOMElement(status);

                    if(this.body.childNodes.length > 0) {

                        if(this.body.childNodes.length > this.max_length) {

                            this.body.removeChild(this.body.lastChild);
                        }

                        this.body.insertBefore(new_node, this.body.firstChild);

                    } else {

                        this.body.appendChild(new_node);
                    }

                } else if (status.type == "https://tent.io/types/post/delete/v0.1.0") {

                    var li = document.getElementById("post-" + status.content.id);
                    if (li) {
                        this.body.removeChild(li);
                    }
                } else if (status.type == "https://tent.io/types/post/repost/v0.1.0") {

                    this.getRepost(status, this.body.firstChild);
                }

            }
        }
    }

    Profile.prototype.mention = function() {

    }

    Profile.prototype.setFollowingButton = function(following) {
        
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
        var callback = function(resp) { _this.followings.getAllFollowings(); debug(resp.responseText) };

        if (this.followings.followings[this.entity]) {

            var url = URI(Paths.mkApiRootPath("/followings/" + this.followings.followings[this.entity].id));
            Paths.getURL(url.toString(), "DELETE", callback);
            this.setFollowingButton(false);
            delete this.followings.followings[this.entity];

        } else {

            var url = URI(Paths.mkApiRootPath("/followings"));
            var data = JSON.stringify({"entity": this.entity });
            Paths.getURL(url.toString(), "POST", callback, data);
            this.setFollowingButton(true);
        }
    }

    return Profile;

});
define([
    "helper/HostApp",
    "helper/APICalls",
],

function(HostApp, APICalls) {


    function Sidebar() {

        this.body = document.createElement("ul");
        this.body.class = "sidebar";

        var _this = this;

        this.menu = {};

        this.menu.user = this.createItem("User", function() { _this.onEntity(); return false; }, "img/sidebar/user.png", "img/sidebar/user.png");
        this.menu.timeline = this.createItem("Timeline", function() { _this.onTimeline(); return false; }, "img/sidebar/timeline.png", "img/sidebar/timeline_active.png", true);
        this.menu.mentions = this.createItem("Mentions", function() { _this.onMentions(); return false; }, "img/sidebar/mentions.png", "img/sidebar/mentions_active.png");        
        this.menu.conversation = this.createItem("Conversation", function() { _this.onConversation(); return false; }, "img/sidebar/conversation.png", "img/sidebar/conversation_active.png");
        this.menu.entityProfile = this.createItem("Profile", function() { _this.onEntityProfile(); return false; }, "img/sidebar/profile.png", "img/sidebar/profile_active.png");
        this.menu.search = this.createItem("Search", function() { _this.onSearch(); return false; }, "img/sidebar/search.png", "img/sidebar/search_active.png")

        this.body.appendChild(this.menu.user);
        this.body.appendChild(this.menu.timeline);
        this.body.appendChild(this.menu.mentions);
        this.body.appendChild(this.menu.conversation);
        this.body.appendChild(this.menu.entityProfile);
        this.body.appendChild(this.menu.search);

        this.unreadMentionsSpan = document.createElement("span");
        this.unreadMentionsSpan.className = "unread_mentions";
        this.menu.mentions.getElementsByTagName("a")[0].appendChild(this.unreadMentionsSpan);
        this.setUnreadMentions(0);

        this.menu.conversation.getElementsByTagName("a")[0].ondblclick = function() {
            var postId = bungloo.conversation.current_post_id;
            var entity = bungloo.conversation.current_entity;
            if (postId && entity) {
                HostApp.showConversationViewForPostIdandEntity(postId, entity);
            }
        }

        document.getElementById("sidebar").appendChild(this.body);

        // initial seting of the <body> class
        document.body.className = "body-timeline";
        document.body.id = "with-sidebar";

        this.setEntityAvatar();
        this.setOnScroll();
    }

    Sidebar.prototype.createItem = function(name, callback, src_inactive, src_active, active) {

        var li = document.createElement("li");
        li.className = "sidebar-" + name.toLowerCase();
        li.active = false;
        li.title = name;
        li.name = name;
        
        var a = document.createElement("a");
        a.href = "#";
        a.onclick = callback;

        var img = document.createElement("img");
        img.src = active ? src_active : src_inactive;
        img.src_inactive = src_inactive;
        img.src_active = src_active;
        img.alt = name;

        a.appendChild(img);
        li.appendChild(a);

        return li;
    }

    Sidebar.prototype.setEntityAvatar = function() {

        var entity = HostApp.stringForKey("entity");
        this.menu.user.title = entity;

        var avatar = this.menu.user.getElementsByTagName("img")[0];
        var _this = this;

        var url = HostApp.serverUrl("posts_feed") + "?types=" + encodeURIComponent("https://tent.io/types/meta/v0") + "&entities=" + encodeURIComponent(entity);
        APICalls.get(url, { callback: function(resp) {
            var profiles = JSON.parse(resp.responseText);

            if(profiles.posts.length < 1) return;
            var profile = profiles.posts[0];
            bungloo.cache.profiles[entity] = profile;

            // Find and apply avatar
            if(profile.attachments) {

                var digest = null;
                for (var i = 0; i < profile.attachments.length; i++) {
                    var attachment = profile.attachments[i];
                    if(attachment.category == "avatar") {
                        digest = attachment.digest;
                        break;
                    }
                }

                if(digest) {
                    var _this = this;
                    avatar.onerror = function() { avatar.src = 'img/default-avatar.png' };
                    var avatar_url = profile.content.servers[0].urls.attachment.replace(/\{entity\}/, encodeURIComponent(profile.entity));
                    avatar.src = avatar_url.replace(/\{digest\}/, digest);
                    avatar.src_inactive = avatar.src;
                    avatar.src_active = avatar.src;
                }
            }
        }});

    }

    Sidebar.prototype.removeEntityAvatar = function() {
        var img = this.menu.user.getElementsByTagName("img")[0];
        img.src = "img/sidebar/user.png";
        img.src_inactive = img.src;
        img.src_active = img.src;
    }

    Sidebar.prototype.showContentFor = function(active_part, active_li) {
        
        // Show active content
        var parts = [
            bungloo.timeline,
            bungloo.mentions,
            bungloo.conversation,
            bungloo.entityProfile,
            bungloo.search
        ];

        for (var i = 0; i < parts.length; i++) {
            if (parts[i] != active_part && parts[i] != null) {
                parts[i].hide();
            }
        }

        active_part.show();
        this.active_view = active_part;

        // Replace <body> class
        document.body.className = "body-" + active_li.className.split("-")[1];

        // Show active icon
        for(var li in this.menu) {
            if (this.menu[li] != active_part) {
                var img = this.menu[li].getElementsByTagName("img")[0];
                img.src = img.src_inactive;
            }
        }

        var img = active_li.getElementsByTagName("img")[0];
        img.src = img.src_active;
    }

    Sidebar.prototype.showContentForNext = function() {

        var parts = [
            "timeline",
            "mentions",
            "conversation",
            "entityProfile",
            "search"
        ];

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var img = this.menu[part].getElementsByTagName("img")[0];
            if (img.src.endsWith(img.src_active)) {
                var next = parts[(i+1)%parts.length];
                this.showContentFor(bungloo[next], this.menu[next]);
                return;
            }
        }
    }

    Sidebar.prototype.showContentForTimeline = function() {
        this.showContentFor(bungloo.timeline, this.menu.timeline);
    }

    // runs get more posts when scrolling down and
    // it is possible for the active view
    Sidebar.prototype.setOnScroll = function() {
        var _this = this;
        window.onscroll = function() {
            if (document.body.scrollHeight <= (document.body.scrollTop + window.outerHeight)) {
                if (typeof _this.active_view["getMoreStatusPosts"] != "undefined") {
                    _this.active_view.getMoreStatusPosts();
                }
            }
        }
    }

    Sidebar.prototype.setUnreadMentions = function(count) {
        this.unreadMentionsSpan.innerHTML = count == 0 ? "" : count;
        if (count > 0) {
            $(this.unreadMentionsSpan).show();
        } else {
            $(this.unreadMentionsSpan).hide();
        }
    }

    Sidebar.prototype.onEntity = function() {
        bungloo.entityProfile.showProfileForEntity();
        this.onEntityProfile();
    }

    Sidebar.prototype.onTimeline = function() {
        this.showContentFor(bungloo.timeline, this.menu.timeline);
    }

    Sidebar.prototype.onMentions = function() {
        this.showContentFor(bungloo.mentions, this.menu.mentions);
        bungloo.mentions.setAllMentionsRead();
    }

    Sidebar.prototype.onConversation = function() {
        this.showContentFor(bungloo.conversation, this.menu.conversation);
    }

    Sidebar.prototype.onEntityProfile = function() {
        this.showContentFor(bungloo.entityProfile, this.menu.entityProfile);
    }

    Sidebar.prototype.onSearch = function() {
        this.showContentFor(bungloo.search, this.menu.search);
    }

    Sidebar.prototype.logout = function() {
        this.removeEntityAvatar();
        bungloo.timeline.logout();
        bungloo.mentions.logout();
        bungloo.conversation.logout();
        bungloo.entityProfile.logout();
        bungloo.search.logout();

        document.getElementById("sidebar").innerHTML = "";
        document.getElementById("content").innerHTML = "";
    }

    return Sidebar;

});
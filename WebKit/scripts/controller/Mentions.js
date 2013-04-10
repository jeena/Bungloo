define([
    "helper/HostApp",
    "controller/Timeline",
    "lib/URI",
    "helper/Paths",
    "helper/Core"
],

function(HostApp, Timeline, URI, Paths, Core) {


    function Mentions() {

        this.is_not_init = false;
        this.unread_mentions = 0;

        Timeline.call(this);

        this.action = "mentions";
        this.container.className = this.action;
        
        this.hide();
    }

    Mentions.prototype = Object.create(Timeline.prototype);

    Mentions.prototype.show = function() {
        Core.prototype.show.call(this, this.container);
    }

    Mentions.prototype.hide = function() {
        Core.prototype.hide.call(this, this.container);
    }


    Mentions.prototype.newStatus = function(statuses, append) {

        Timeline.prototype.newStatus.call(this, statuses, append);

        if(this.is_not_init) {

            for (var i = 0; i < statuses.length; i++) {
                var status = statuses[i];

                var name;
                var profile = this.cache.profiles.getItem(status.entity);
                if(profile) {
                    name = profile["https://tent.io/types/info/basic/v0.1.0"].name;
                }

                HostApp.notificateUserAboutMention(status.content.text, name || status.entity, status.id, status.entity);
            };
        }

        this.is_not_init = true;
    }

    Mentions.prototype.getNewData = function(add_to_search, append) {

        add_to_search = add_to_search || {};

        if (!add_to_search["mentioned_entity"]) {
            add_to_search["mentioned_entity"] = HostApp.stringForKey("entity");
        }

        Timeline.prototype.getNewData.call(this, add_to_search, append);

        this.getLatestMentionRead();
    }

    Mentions.prototype.mentionRead = function(id, entity) {
        if (this.unread_mentions > 0) {
            this.unread_mentions--;
            HostApp.unreadMentions(this.unread_mentions);
        }
    }

    Mentions.prototype.setAllMentionsRead = function() {
        this.unread_mentions = 0;
        HostApp.unreadMentions(this.unread_mentions);
        this.updateLatestMentionRead();
    }

    Mentions.prototype.updateLatestMentionRead = function() {
        var status = this.body.firstChild.status;

        if (status && status.type == "https://tent.io/types/post/status/v0.1.0") {

            var url = URI(Paths.mkApiRootPath("/profile/" + encodeURIComponent("https://tent.io/types/info/cursor/v0.1.0")));
            var body = {
                "https://tent.io/types/info/cursor/v0.1.0": {
                    "mentions": {
                        "https://tent.io/types/post/status/v0.1.0": {
                            "post_id": status.id,
                            "post_entity": status.entity
                        }
                    }
                }
            }

            var callback = function(resp) {
                //debug(resp)
            }

            Paths.getURL(url.toString(), "PUT", callback, JSON.stringify(body));
        }
    }


    Mentions.prototype.getLatestMentionRead = function() {

        var cursor_url = URI(Paths.mkApiRootPath("/profile/" + encodeURIComponent("https://tent.io/types/info/cursor/v0.1.0")));

        Paths.getURL(cursor_url.toString(), "GET", function(resp) {

            var url = URI(Paths.mkApiRootPath("/posts/count"));
            var post_types = [
                "https://tent.io/types/post/status/v0.1.0",
            ];
            url.addSearch("post_types", post_types.join(","));
            url.addSearch("mentioned_entity", HostApp.stringForKey("entity"));


            try { // don't crash when there is no cursor yet
                var body = JSON.parse(resp.responseText);
                var cursor = body["https://tent.io/types/info/cursor/v0.1.0"]["mentions"]["https://tent.io/types/post/status/v0.1.0"];
                url.addSearch("since_id", cursor.post_id);
                url.addSearch("since_id_entity", cursor.post_entity);
            } catch(e) { }

            var callback = function(resp) {
                this.unread_mentions = parseInt(resp.responseText, 10);
                HostApp.unreadMentions(this.unread_mentions);
            }

            Paths.getURL(url.toString(), "GET", callback); // FIXME: error callback
        });
    }


    return Mentions;

});
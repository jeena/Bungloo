define([
    "helper/HostApp",
    "controller/Timeline",
    "helper/Cache"
],

function(HostApp, Timeline, Cache) {


    function Mentions() {

        this.is_not_init = false;
        this.unread_mentions = 0;

        Timeline.call(this);

        this.action = "mentions";
        this.body.className = this.action;

    }

    Mentions.prototype = Object.create(Timeline.prototype);

    Mentions.prototype.newStatus = function(statuses) {

        Timeline.prototype.newStatus.call(this, statuses);

        if(this.is_not_init) {

            this.unread_mentions += statuses.length;
            HostApp.unreadMentions(this.unread_mentions);

            for (var i = 0; i < statuses.length; i++) {
                var status = statuses[i];
                
                var name;
                var profile = JSON.parse(Cache.profiles.getItem(status.entity));
                if(profile) {
                    name = profile["https://tent.io/types/info/basic/v0.1.0"].name;
                }
                
                HostApp.notificateUserAboutMention(status.content.text, name || status.entity, status.id, status.entity);
            };
        }

        this.is_not_init = true;
    }

    Mentions.prototype.getNewData = function(add_to_search) {

        add_to_search = add_to_search || {};

        if (!add_to_search["mentioned_entity"]) {
            add_to_search["mentioned_entity"] = HostApp.stringForKey("entity");            
        }

        Timeline.prototype.getNewData.call(this, add_to_search);
    }

    Mentions.prototype.mentionRead = function(id, entity) {
        if (this.unread_mentions > 0) {
            this.unread_mentions--;
            HostApp.unreadMentions(this.unread_mentions);
        }
    }


    return Mentions;

});
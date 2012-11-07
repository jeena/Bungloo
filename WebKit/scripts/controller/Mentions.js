define([
    "helper/HostApp",
    "controller/Timeline"
],

function(HostApp, Timeline) {


    function Mentions() {

        this.is_not_init = false;
        this.unread_mentions = 0;

        Timeline.call(this);

        this.action = "mentions";
        this.body.className = this.action;
    }

    Mentions.prototype = Object.create(Timeline.prototype);

    Mentions.prototype.newStatus = function(status) {

        Timeline.prototype.newStatus.call(this, status);

        if(this.is_not_init) {
            this.unread_mentions += status.length;
            HostApp.unreadMentions(this.unread_mentions);
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

    return Mentions;

});
define([
    "helper/Core",
    "helper/Paths",
    "helper/HostApp",
    "lib/URI"
],

function(Core, Paths, HostApp, URI) {

    function Timeline() {

        Core.call(this);

        this.action = "timeline";
        this.reload_blocked = false;

        this.max_length = 25;
        this.timeout = 10 * 1000; // every 10 seconds
        this.since_id = null;
        this.since_id_entity = null;
        this.since_time = 0;

        this.before = {id: null, entity: null, loading: false};

        this.container = document.createElement("div");
        this.container.className = this.action;
        this.body = document.createElement("ol");
        this.container.appendChild(this.body)
        document.getElementById("content").appendChild(this.container);

        var _this = this;
        this.reloadIntervall = setInterval(function() { _this.getNewData() }, this.timeout);

        this.getNewData();
    }

    Timeline.prototype = Object.create(Core.prototype);

    Timeline.prototype.show = function() {
        Core.prototype.show.call(this, this.container);
    }

    Timeline.prototype.hide = function() {
        Core.prototype.hide.call(this, this.container);
    }
    

    Timeline.prototype.newStatus = function(statuses, append) {

        if(statuses != null && statuses.length > 0) {

            this.before.loading = false;

            if (append) statuses = statuses.reverse();

            for(var i = statuses.length-1, c=0; i>=c; --i) {

                var status = statuses[i];
                if(!append) {
                    this.since_id = status.id;
                    this.since_id_entity = status.entity;                    
                }

                if (status.type == "https://tent.io/types/post/status/v0.1.0" || status.type == "https://tent.io/types/post/photo/v0.1.0") {

                    var new_node = this.getStatusDOMElement(status);

                    if (!document.getElementById(new_node.id)) {
                        if(!append && this.body.childNodes.length > 0) {

                            if(this.body.childNodes.length > this.max_length) {

                                this.body.removeChild(this.body.lastChild);
                            }

                            this.body.insertBefore(new_node, this.body.firstChild);

                        } else {

                            this.body.appendChild(new_node);
                        }
                    }

                } else if (status.type == "https://tent.io/types/post/delete/v0.1.0") {

                    HostApp.notificateViewsAboutDeletedPost(status.content.id, status.entity);

                } else if (status.type == "https://tent.io/types/post/repost/v0.1.0") {

                    this.getRepost(status, append ? this.body.lastChild : this.body.firstChild, append);
                }

            }
        }
    }

    Timeline.prototype.getNewData = function(add_to_search, append) {

        add_to_search = add_to_search || {};

        var those = this;
        var url = URI(Paths.mkApiRootPath("/posts"));

        var post_types = [
            "https://tent.io/types/post/repost/v0.1.0",
            "https://tent.io/types/post/status/v0.1.0",
            "https://tent.io/types/post/delete/v0.1.0",
            "https://tent.io/types/post/photo/v0.1.0"
        ];
        url.addSearch("post_types", post_types.join(","));
        //url.addSearch("sort_by", "published_at");
        url.addSearch("limit", this.max_length);

        if(this.since_id  && !append) {
            url.addSearch("since_id", this.since_id);
            url.addSearch("since_id_entity", this.since_id_entity);
        }

        for (key in add_to_search) {
            url.addSearch(key, add_to_search[key]);
        }

        var http_method = "GET";
        var callback = function(resp) {

            those.reload_blocked = false;

            try {

                var json = JSON.parse(resp.responseText);
                those.newStatus(json, append);

            } catch (e) {
                console.error(url + " JSON parse error");
                throw e;
            }
        }

        var data = null;

        if (HostApp.stringForKey("user_access_token")) {

            if (!this.reload_blocked) {
                this.reload_blocked = true;
                Paths.getURL(url.toString(), http_method, callback, data); // FIXME: error callback
            }
        }
    }

    Timeline.prototype.getMoreStatusPosts = function() {
        if (!this.before.loading) {
            this.before.loading = true;
            var add_search = {
                "before_id": this.body.lastChild.status.id,
                "before_id_entity": this.body.lastChild.status.entity
            }

            this.getNewData(add_search, true);            
        }
    }

    Timeline.prototype.sendNewMessage = function(content, in_reply_to_status_id, in_reply_to_entity, location, image_data_uri, is_private) {
        var _this = this;
        var callback = function(data) { _this.getNewData(); }
        Core.prototype.sendNewMessage.call(this, content, in_reply_to_status_id, in_reply_to_entity, location, image_data_uri, is_private, callback);
    }

    Timeline.prototype.remove = function(id, callback, type) {
        var _this = this;
        var new_callback = function(data) {
            if(callback) callback(data);
            _this.getNewData();
        }
        Core.prototype.remove.call(this, id, new_callback, type);
    }

    Timeline.prototype.repost = function(id, entity, callback) {
        var _this = this;
        if (!callback) {
            callback = function(data) { _this.getNewData(); }
        }
        Core.prototype.repost.call(this, id, entity, callback);
    }

    Timeline.prototype.logout = function() {
        clearInterval(this.reloadIntervall);
        Core.prototype.logout.call(this);
    }

    return Timeline;

});
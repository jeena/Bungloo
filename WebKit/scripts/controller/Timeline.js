define([
    "helper/Core",
    "helper/APICalls",
    "helper/HostApp",
    "lib/URI"
],

function(Core, APICalls, HostApp, URI) {

    function Timeline() {

        Core.call(this);

        this.action = "timeline";
        this.reload_blocked = false;

        this.posts_limit = 50;
        this.max_length = 200;
        this.timeout = 10 * 1000; // every 10 seconds
        this.since_id = null;
        this.since_id_entity = null;
        this.since_time = null;

        this.pages = {};
        this.next = null;

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
    
    Timeline.prototype.newStatus = function(_statuses, append) {

        for (var entity in _statuses.profiles) {
            if (_statuses.profiles[entity] != null) {
                bungloo.cache.profiles[entity] = _statuses.profiles[entity];
            } else {
                bungloo.cache.profiles[entity] = {};
            }
        }

        this.pages = _statuses.pages;
        if(_statuses.pages.next) this.next = _statuses.pages.next;
        
        statuses = _statuses.posts;

        this.before.loading = false;

        if(statuses != null && statuses.length > 0) {

            if (append) statuses = statuses.reverse();

            for(var i = statuses.length-1, c=0; i>=c; --i) {

                var status = statuses[i];
                if(!append) {
                    this.since_id = status.id;
                    this.since_id_entity = status.entity;
                    //this.since_time = status.received_at;
                    this.since_time = status.version.received_at;
                }

                if (status.type.startsWith("https://tent.io/types/status/v0#")) {

                    var new_node = this.getStatusDOMElement(status, _statuses.refs);
                    var old_node = document.getElementById(new_node.id);
                    
                    if (!old_node) {
                        if(!append && this.body.childNodes.length > 0) {

                            if(this.body.childNodes.length > this.max_length) {

                                this.body.removeChild(this.body.lastChild);
                            }

                            this.body.insertBefore(new_node, this.body.firstChild);

                        } else {

                            this.body.appendChild(new_node);
                        }
                    } else {
                        debug(new_node.id);
                        old_node.parentNode.replaceChild(new_node, old_node);
                    }

                } else if (status.type == "https://tent.io/types/delete/v0#") {

                    HostApp.notificateViewsAboutDeletedPost(status.refs[0].post, status.entity);

                } else if (status.type.startsWith("https://tent.io/types/repost/v0#")) {
                    
                    this.getRepost(status, append ? this.body.lastChild : this.body.firstChild, append);

                }

            }
        }
    }

    Timeline.prototype.getNewData = function(add_to_search, append, query) {

        add_to_search = add_to_search || {};

        var those = this;
        var url = HostApp.serverUrl("posts_feed");

        if(!query) {

            var uri = URI(url);

            var post_types = [
                "https://tent.io/types/status/v0#",
                "https://tent.io/types/status/v0#reply",
                "https://tent.io/types/repost/v0#https://tent.io/types/status/v0",
                "https://tent.io/types/delete/v0#",
                //"https://tent.io/types/post/photo/v0.1.0"
            ];
            uri.addSearch("types", post_types.join(","));
            //uri.addSearch("sort_by", "published_at");
            uri.addSearch("limit", this.posts_limit);
            uri.addSearch("max_refs", 20);
            uri.addSearch("profiles", "entity");
            uri.addSearch("sort_by", "version.received_at");

            if(this.since_time) {
                uri.addSearch("since", this.since_time);
            }

            for (key in add_to_search) {
                uri.addSearch(key, add_to_search[key]);
            }

            url = uri.toString();

        } else {
            url += query;
        }

        if (HostApp.stringForKey("user_access_token")) {

            if (!this.reload_blocked) {
                this.reload_blocked = true;

                APICalls.get(url, { callback: function(resp) {
                    // FIXME this is getting data when it shouldn't debug(resp.responseText)

                    those.reload_blocked = false;

                    try {
                        var json = JSON.parse(resp.responseText);
                        those.newStatus(json, append);

                    } catch (e) {
                        console.error(url + " JSON parse error");
                        throw e;
                    }
                } });
            }
        }
    }

    Timeline.prototype.getMoreStatusPosts = function() {
        if (!this.before.loading) {
            if (this.next) {
                this.before.loading = true;
                this.getNewData({}, true, this.next);
            }
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
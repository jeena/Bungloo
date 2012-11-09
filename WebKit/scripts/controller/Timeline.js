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

        this.max_length = 200;
        this.timeout = 10 * 1000; // every 10 seconds
        this.since_id = null;
        this.since_id_entity = null;
        this.since_time = 0;

        this.body = document.createElement("ol");
        this.body.className = this.action;
        document.body.appendChild(this.body);

        var _this = this;
        this.reloadIntervall = setInterval(function() { _this.getNewData() }, this.timeout);

        this.getNewData();
    }

    Timeline.prototype = Object.create(Core.prototype);


    Timeline.prototype.newStatus = function(statuses) {

        if(statuses != null && statuses.length > 0) {
            for(var i = statuses.length-1, c=0; i>=c; --i) {

                var status = statuses[i];
                this.since_id = status.id;
                this.since_id_entity = status.entity;

                if(this.body.childNodes.length > 0) {
                    if(this.body.childNodes.length > this.max_length) {
                        this.body.removeChild(this.body.lastChild);
                    }
                    this.body.insertBefore(this.getStatusDOMElement(status), this.body.firstChild);
                } else {
                    this.body.appendChild(this.getStatusDOMElement(status));
                }
            }
        }
    }

    Timeline.prototype.getNewData = function(add_to_search) {

        add_to_search = add_to_search || {};

        var those = this;
        var url = URI(Paths.mkApiRootPath("/posts"));
        url.addSearch("post_types", "https://tent.io/types/post/status/v0.1.0");
        url.addSearch("limit", this.max_length);
        if(this.since_id) {
            url.addSearch("since_id", this.since_id);
            url.addSearch("since_id_entity", this.since_id_entity);
        }

        for (key in add_to_search) {
            url.addSearch(key, add_to_search[key]);
        }

        var http_method = "GET";
        var callback = function(resp) {

            try {
                var json = JSON.parse(resp.responseText)
            } catch (e) {
                //alert(resp.responseText);
                alert(url + " JSON parse error");
                throw e;
            }

            those.newStatus(json);
        }

        var data = null;

        if (HostApp.stringForKey("user_access_token")) {
            Paths.getURL(url.toString(), http_method, callback, data); // FIXME: error callback        
        }
    }

    Timeline.prototype.sendNewMessage = function(content, in_reply_to_status_id, in_reply_to_entity) {
        var _this = this;
        var callback = function(data) { _this.getNewData(); }
        Core.prototype.sendNewMessage.call(this, content, in_reply_to_status_id, in_reply_to_entity, callback);
    }

    Timeline.prototype.foo = function(a) {
        return a;
    }

    return Timeline;

});
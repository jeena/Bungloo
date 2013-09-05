define([
    "helper/HostApp",
    "helper/Core",
    "helper/APICalls",
    "lib/URI"
],

function(HostApp, Core, APICalls, URI) {


    function Conversation(standalone) {

        Core.call(this);
        
        this.standalone = standalone;

        this.action = "conversation";

        this.container = document.createElement("div");
        this.container.className = this.action;
        this.body = document.createElement("ol");
        this.container.appendChild(this.body)

        document.getElementById("content").appendChild(this.container);
        if(!this.standalone) this.hide();

        // Stop loading if ESC is pressed
        this.stopLoading = false;
        var _this = this;
        $(document).keydown(function(e) {
            if (e.keyCode == 27) { // Esc
                _this.stopLoading = true;
            }
        });
    }

    Conversation.prototype = Object.create(Core.prototype);

    Conversation.prototype.show = function() {
        Core.prototype.show.call(this, this.container);
    }

    Conversation.prototype.hide = function() {
        Core.prototype.hide.call(this, this.container);
    }
    

    Conversation.addStatus = function(status) {

        this.body.appendChild(this.getStatusDOMElement(status));
    }


    Conversation.prototype.showStatus = function(id, entity) {

        this.body.innerHTML = "";
        this.current_post_id = id;
        this.current_entity = entity;
        this.append(id, entity);
    }

    // Hack for OS X
    Conversation.prototype.showStatusFromController = function() {
        this.showStatus(conversationViewController.postId, conversationViewController.entity);
    }

    Conversation.prototype.append = function(id, entity, node, add_after) {

        if(this.stopLoading) return;

        var _this = this;

        var callback = function(resp) {

            var _statuses = JSON.parse(resp.responseText);

            for (var entity in _statuses.profiles) {
                if (_statuses.profiles[entity] != null) {
                    bungloo.cache.profiles[entity] = _statuses.profiles[entity];
                } else {
                    bungloo.cache.profiles[entity] = {};
                }
            }

            var status = _statuses.post;

            var dom_element = _this.getStatusDOMElement(status);

            if (node) {
                if(add_after) {
                    node.parentNode.insertBefore(dom_element, node.nextSibling);
                } else {
                    node.parentNode.insertBefore(dom_element, node);
                }

            } else {
                dom_element.className = "highlight";
                _this.body.appendChild(dom_element);
            }

            // child posts
            _this.appendMentioned(id, entity, dom_element);
            
            // parent posts
            if(status.mentions) {
                for (var i = 0; i < status.mentions.length; i++) {
                    var mention = status.mentions[i];
                    if(mention.post) {
                        // don't load if it is already there
                        if(!document.getElementById("post-" + mention.post + "-" + _this.action)) {
                            _this.append(mention.post, mention.entity, dom_element);
                        }
                    }
                }
            }
        }

        var url = HostApp.serverUrl("post")
            .replace(/\{entity\}/, encodeURIComponent(entity))
            .replace(/\{post\}/, id)
            + "?profiles=entity";

        APICalls.get(url, { callback: callback });
    }

    Conversation.prototype.appendMentioned = function(id, entity, node) {

        var _this = this;
        var callback = function(resp) {

            var statuses = JSON.parse(resp.responseText).mentions;

            for (var i = 0; i < statuses.length; i++) {

                var status = statuses[i];

                // don't load if it is already there
                var not_already_there = !document.getElementById("post-" + status.post + "-" + _this.action);
                if(not_already_there && status.type.startsWith("https://tent.io/types/status/v0")) {
                    _this.append(status.post, status.entity ,node, true);
                }
            }
        }

        var url = HostApp.serverUrl("post")
            .replace(/\{entity\}/, encodeURIComponent(entity))
            .replace(/\{post\}/, id);

        APICalls.get(url, {
            callback: callback,
            accept: "application/vnd.tent.post-mentions.v0+json"
        });

    }

    return Conversation;

});
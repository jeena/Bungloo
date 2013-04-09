define([
    "helper/HostApp",
    "helper/Core",
    "helper/Paths",
    "lib/URI"
],

function(HostApp, Core, Paths, URI) {


    function Search() {

        Core.call(this);

        this.action = "search";

        this.container = document.createElement("div");
        this.container.className = this.action;
        document.getElementById("content").appendChild(this.container);

        this.body = document.createElement("ol");
        
        this.form = document.createElement("form");
        this.form.className = this.action;
        this.input = document.createElement("input");
        this.input.type = "search";
        this.input.placeholder = "Search";
        this.form.appendChild(this.input);

        var _this = this;
        this.form.onsubmit = function() { _this.doSearch(_this.input.value); return false; };
        this.form.action = "#";

        this.container.appendChild(this.form);
        this.container.appendChild(this.body);

        this.hide();
    }

    Search.prototype = Object.create(Core.prototype);


    Search.prototype.show = function() {
        Core.prototype.show.call(this, this.container);
        this.input.focus();
    }

    Search.prototype.hide = function() {
        Core.prototype.hide.call(this, this.container);
    }

    Search.prototype.doSearch = function(query) {

        this.body.innerHTML = ""; // remove old results
        
        if (query == "") return;
        this.input.value = query;

        var endpoint = "https://skate.io/api/search";
        var api_key = "15cbec6445887eff3408";

        var url = URI(endpoint);
        url.addSearch("api_key", api_key);
        url.addSearch("text", query);

        var _this = this;

        Paths.getURL(url.toString(), "GET", function(resp) {

            var results = JSON.parse(resp.responseText).results;
            var statuses = [];
            for (var i = 0; i < results.length; i++) {
                var result = results[i].source;
                var status = {
                    entity: result.entity,
                    content: {
                        text: result.content
                    },
                    published_at: result.published_at,
                    id: result.public_id,
                    type: result.post_type,
                    version: result.post_version,
                    app: {
                        url: "http://skate.io",
                        name: "skate.io"
                    },
                    mentions: []
                }

                statuses.push(status);
            }

            for(var i = 0; i < statuses.length; i++) {
                var status = statuses[i];
                if (status.type == "https://tent.io/types/post/status/v0.1.0") {

                    var new_node = _this.getStatusDOMElement(status);
                    _this.body.appendChild(new_node);
                }
            }

        }, null, false);
    }

    Search.prototype.searchFor = function(query) {
        this.doSearch(query);
        bungloo.sidebar.onSearch();
    }

    return Search;

});
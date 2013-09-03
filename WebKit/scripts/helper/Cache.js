define([
    "lib/URI",
    "helper/CacheStorage",
    "require"
],

function(URI, CacheStorage, require) {

    function Cache() {
        this.timeout = 2 * 60 * 1000;
        this.followings_before_id = null;
        this.intervall = null;

        //this.clear()

        this.followings = new CacheStorage("followings");
        this.profiles = new CacheStorage("profiles");
        this.profile_urls = new CacheStorage("profile_urls");
    }

    Cache.prototype.clear = function() {
        localStorage.clear();
    }

    Cache.prototype.getFollowings = function() {
        var _this = this;
        function callback(resp) {

            var fs = JSON.parse(resp.responseText)

            if (fs.length < 1) return;

            for (var i = 0; i < fs.length; i++) {

                var following = fs[i];
                this.followings_before_id = following.id;

                _this.followings.setItem(following.entity, following)
                _this.profiles.setItem(following.entity, following);
            }
        }

        var url = URI(require("helper/APICalls").mkApiRootPath("/followings"));
        if (this.followings_before_id) {
            url.addSearch("before_id", this.followings_before_id);
        }

        require("helper/APICalls").getURL(url, "GET", callback);
    }

    Cache.prototype.periodicallyGetFollowings = function() {
        this.getFollowings();
        this.intervall = setInterval(this.getFollowings, this.timeout);
    }

    Cache.prototype.stopGettingFollowings = function() {
        clearTimeout(this.intervall);
    }

    return Cache;

});
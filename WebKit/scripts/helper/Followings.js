define([
    "helper/Paths",
    "lib/URI"
],

function(Paths, URI) {

    function Followings() {

        this.timeout = 2 * 60 * 1000;
        this.followings = {};
        this.before_id = null;

        var _this = this;
        this.intervall = setInterval(function() { _this.getAllFollowings(); }, this.timeout);

        this.getAllFollowings();
    }

    Followings.prototype.getAllFollowings = function() {

        var _this = this;

        var callback = function(resp) {

            var fs = JSON.parse(resp.responseText)

            if (fs.length < 1) return;

            for (var i = 0; i < fs.length; i++) {

                var following = fs[i];
                _this.before_id = following.id;
                _this.followings[following.entity] = following;
            }
        }

        var url = URI(Paths.mkApiRootPath("/followings"));
        if (this.before_id) {
            url.addSearch("before_id", this.before_id);
        }

        Paths.getURL(url, "GET", callback);
    }

    return Followings;

});
define([
    "helper/Paths",
    "lib/URI",
    "helper/CacheStorage"
],

function(Paths, URI, CacheStorage) {

    var Cache = {};

    var timeout = 2 * 60 * 1000;
    var followings_before_id = null;

    Cache.followings = new CacheStorage("followings");
    Cache.profiles = new CacheStorage("profiles");
    Cache.profile_urls = new CacheStorage("profile_urls");


    Cache.getFollowings = function() {
        function callback(resp) {

            var fs = JSON.parse(resp.responseText)

            if (fs.length < 1) return;

            for (var i = 0; i < fs.length; i++) {

                var following = fs[i];
                followings_before_id = following.id;

                Cache.followings.setItem(following.entity, following)
                Cache.profiles.setItem(following.entity, following);
            }
        }

        var u = Paths.mkApiRootPath("/followings");

        var url = URI(u);
        if (followings_before_id) {
            url.addSearch("before_id", followings_before_id);
        }

        Paths.getURL(url, "GET", callback);
    }
    
    // setTimeout(function(){ Cache.getAllFollowings() }, timeout);

    return Cache;

});
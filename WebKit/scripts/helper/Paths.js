define([
    "jquery",
    "helper/HostApp",
    "helper/Hmac",
    "helper/Cache"
],

function(jQuery, HostApp, Hmac, Cache) {
    var Paths = {};

    Paths.cache = new Cache();

    Paths.getUrlVars = function(url) {
        var vars = [], hash;
        if(url.indexOf("#") > -1) url = url.slice(0, url.indexOf("#"));
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
        }
        return vars;
    }

    Paths.getURL = function(url, http_method, callback, data, auth_header, accepts) {

        accepts = accepts || "application/vnd.tent.v0+json";

        jQuery.ajax({

            beforeSend: function(xhr) {

                xhr.setRequestHeader("Accept", accepts);

                if (data) xhr.setRequestHeader("Content-Length", data.length);

                if (auth_header) { // if is_set? auth_header

                    xhr.setRequestHeader("Authorization", auth_header);

                } else {

                    var user_access_token = HostApp.stringForKey("user_access_token");

                    if (auth_header !== false && typeof user_access_token != "undefined") {

                        auth_header = Hmac.makeAuthHeader(
                            url, 
                            http_method, 
                            HostApp.secret(),
                            user_access_token
                        );
                        xhr.setRequestHeader("Authorization", auth_header);
                    }                
                }
            },
            url: url,
            contentType: "application/vnd.tent.v0+json",
            type: http_method,
            complete: callback,
            data: data,
            processData: false,
            error: function(xhr, ajaxOptions, thrownError) {
                console.error("getURL (" + xhr.status + ")" + xhr.statusText + " " + http_method + " (" + url + "): '" + xhr.responseText + "'");
            }
        });
    }

    Paths.postMultipart = function(url, callback, data, boundary, accepts) {

        accepts = accepts || "application/vnd.tent.v0+json";

        jQuery.ajax({

            beforeSend: function(xhr) {
                xhr.setRequestHeader("Accept", accepts);

                if (data) xhr.setRequestHeader("Content-Length", data.length);

                var user_access_token = HostApp.stringForKey("user_access_token");

                if (user_access_token) {

                    auth_header = Hmac.makeAuthHeader(
                        url, 
                        "POST", 
                        HostApp.secret(),
                        user_access_token
                    );

                    xhr.setRequestHeader("Authorization", auth_header);
                }                
            },
            url: url,
            contentType: "multipart/form-data;boundary=" + boundary,
            type: "POST",
            complete: callback,
            data: data,
            processData: false,
            error: function(xhr, ajaxOptions, thrownError) {
                console.error("postMultipart " + xhr.statusText + " (" + url + "): '" + xhr.responseText + "'");
            }
        });
    }

    Paths.findProfileURL = function(entity, callback, errorCallback) {

        var profile_url = Paths.cache.profile_urls.getItem(entity);

        if (profile_url && profile_url != "null") {

            callback(profile_url);

        } else {

            jQuery.ajax({
                url: entity,
                type: "HEAD",
                complete: function(resp) {
                    if(resp) {
                        var headers = resp.getAllResponseHeaders();

                        var profile_urls = Paths.parseHeaderForProfiles(headers);
                        var profile_url = null;
                        if(profile_urls.length > 0) {
                            var profile_url = profile_urls[0];
                            if (!profile_url.startsWith("http")) {
                                profile_url = entity + "/profile";
                            }
                        }

                        if (profile_url) {
                            Paths.cache.profile_urls.setItem(entity, profile_url);
                            callback(profile_url);
                        } else {
                            if(errorCallback) errorCallback(entity + " has no profile URL");
                        }
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    console.error("findProfileURL " + xhr.statusText + " (" + entity + "): " + xhr.responseText);
                    if (errorCallback) errorCallback(xhr.statusText + " - " + xhr.responseText)
                }
            });
        }
    }

    Paths.mkApiRootPath = function(path) {

        var api_root = HostApp.stringForKey("api_root");

        if((api_root.substring(api_root.length - 1, api_root.length) != "/") && (path.substring(0, 1) != "/")) {
            api_root += "/";
        } else if((api_root.substring(api_root.length - 1, api_root.length) == "/") && (path.substring(0, 1) == "/")) {
            api_root = api_root.substring(0, api_root.length -1);
        }
        return api_root + path;
    }

    Paths.parseHeaderForProfiles = function(header_string) {
        var headers = header_string.split(/\n/);
        var links = [];
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            if (header.match(/^Link:(.*)/i)) {
                links.push(header.replace(/\r/, "").substr(5).trim());
            }
        }

        var items = [];
        for (var i = 0; i < links.length; i++) {
            items = items.concat(links[i].split(","));
        }
        var profiles = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.match(/https:\/\/tent.io\/rels\/profile/i)) {
                var n = item.match(/<([^>]*)>/);
                if (n) {
                    profiles.push(n[1]);
                }
            }
        }

        return profiles;
    }

    return Paths;
});
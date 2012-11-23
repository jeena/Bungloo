define([
    "jquery",
    "helper/HostApp",
    "helper/Hmac"
],

function(jQuery, HostApp, Hmac) {
    var Paths = {};

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

    Paths.getURL = function(url, http_method, callback, data, auth_header) {

        jQuery.ajax({

            beforeSend: function(xhr) {
                if (data) xhr.setRequestHeader("Content-Length", data.length);

                if (auth_header) { // if is_set? auth_header

                    xhr.setRequestHeader("Authorization", auth_header);

                } else {

                    var user_access_token = HostApp.stringForKey("user_access_token");

                    if (auth_header !== false && user_access_token) {

                        auth_header = Hmac.makeAuthHeader(
                            url, 
                            http_method, 
                            //HostApp.stringForKey("user_mac_key"),
                            HostApp.secret(),
                            user_access_token
                        );
                        xhr.setRequestHeader("Authorization", auth_header);
                    }                
                }
            },
            url: url,
            accepts: "application/vnd.tent.v0+json",
            contentType: "application/vnd.tent.v0+json",
            type: http_method,
            complete: callback,
            data: data,
            processData: false,
            error: function(xhr, ajaxOptions, thrownError) {
                console.error("getURL " + xhr.statusText + " " + http_method + " (" + url + "): '" + xhr.responseText + "'");
            }
        });
    }

    Paths.postMultipart = function(url, callback, data, boundary) {
        debug(url)
        debug(data)

        jQuery.ajax({

            beforeSend: function(xhr) {
   
                if (data) xhr.setRequestHeader("Content-Length", data.length);
                debug("Content-Length: " + data.length);

                var user_access_token = HostApp.stringForKey("user_access_token");

                if (user_access_token) {

                    auth_header = Hmac.makeAuthHeader(
                        url, 
                        "POST", 
                        HostApp.stringForKey("user_mac_key"), 
                        user_access_token
                    );
                    debug(auth_header)
                    xhr.setRequestHeader("Authorization", auth_header);
                }                
            },
            url: url,
            accepts: "application/vnd.tent.v0+json",
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
        
        jQuery.ajax({
            url: entity,
            type: "HEAD",
            complete: function(resp) {
                if(resp) {
                    var headers = resp.getAllResponseHeaders();
                    var regex = /Link: <([^>]*)>; rel="https:\/\/tent.io\/rels\/profile"/; // FIXME: parse it!
                    var ret = headers.match(regex);
                    var profile_url = null;
                    if(ret && ret.length > 1) {
                        var profile_url = ret[1];
                        if (profile_url == "/profile") {
                            profile_url = entity + "/profile";
                        }
                    }

                    if (profile_url) {
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

    Paths.mkApiRootPath = function(path) {
        var api_root = HostApp.stringForKey("api_root");
        if((api_root.substring(api_root.length - 1, api_root.length) != "/") && (path.substring(0, 1) != "/")) {
            api_root += "/";
        } else if((api_root.substring(api_root.length - 1, api_root.length) == "/") && (path.substring(0, 1) == "/")) {
            api_root = api_root.substring(0, api_root.length -1);
        }
        return api_root + path;
    }

    return Paths;
});
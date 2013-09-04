define([
    "jquery",
    "helper/HostApp",
    "helper/Hmac",
    "helper/Cache"
],

function(jQuery, HostApp, Hmac, Cache) {
    var APICalls = {};

    APICalls.cache = new Cache();

    APICalls.getUrlVars = function(url) {
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

    APICalls.http_call = function(options) {

        if (typeof options === "string") {
            console.error(options + " not implemented yet")
            return;
        }

        var content_type = null;

        if((options.http_method == "POST" || options.http_method == "PUT") && !options.content_type) {
            console.error("No content type for " + options.url);
            return;

        } else {
            if(options.content_type == "application/json") {
                content_type = "application/json";
            } else if(options.content_type) {
                content_type = "application/vnd.tent.post.v0+json; charset=UTF-8; type=\"" + options.content_type + "\"";
            }
        }

        var settings = {
            beforeSend: function(xhr) {
                if (options.data) xhr.setRequestHeader("Content-Length", options.data.length);

                if (options.accept) xhr.setRequestHeader("Accept", options.accept);
                else xhr.setRequestHeader("Accept", "application/vnd.tent.post.v0+json");

                var user_access_token = HostApp.stringForKey("user_access_token");
                if (!options.auth_header && !options.no_auth && user_access_token) {
                    var auth_header = Hmac.makeHawkAuthHeader(
                        options.url,
                        options.http_method,
                        user_access_token,
                        HostApp.secret()//,
                        //HostApp.stringForKey("app_id")
                    );
                    xhr.setRequestHeader("Authorization", auth_header);
                } else if(options.auth_header) {
                    xhr.setRequestHeader("Authorization", options.auth_header);
                } else if(!options.no_auth) {
                    console.error("No user_access_token yet - " + options.url);
                }
                xhr.setRequestHeader("Cache-Control", "no-proxy");
            },
            url: options.url,
            contentType: content_type,
            type: options.http_method,
            complete: options.callback,
            data: options.data,
            processData: false,
            error: function(xhr, ajaxOptions, thrownError) {
                console.error("HTTP CALL (" + xhr.status + ") " + xhr.statusText + " " + options.http_method + " URL(" + options.url + "): '" + xhr.responseText + "'");
            }
        };

        jQuery.ajax(settings);
    }

    APICalls.head = function(url, options) {
        var settings = {
            url: url,
            http_method: "HEAD",
        };

        for (var key in options) {
            settings[key] = options[key];
        }

        APICalls.http_call(settings);
    }    

    APICalls.get = function(url, options) {
        var settings = {
            url: url,
            http_method: "GET",
        };

        for (var key in options) {
            settings[key] = options[key];
        }

        APICalls.http_call(settings);
    }

    APICalls.post = function(url, data, options) {
        var settings = {
            url: url,
            http_method: "POST",
            data: data
        };

        for (var key in options) {
            settings[key] = options[key];
        }

        APICalls.http_call(settings);
    }

    APICalls.delete = function(url, options) {
        var settings = {
            url: url,
            http_method: "DELETE"
        };

        for (var key in options) {
            settings[key] = options[key];
        }

        APICalls.http_call(settings);
    }

    APICalls.put = function(url, data, options) {
        var settings = {
            url: url,
            http_method: "PUT",
            data: data
        };

        for (var key in options) {
            settings[key] = options[key];
        }

        APICalls.http_call(settings);
    }


    APICalls.postMultipart = function(url, callback, data, boundary, accepts) {

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
                console.error("postMultipart (" + xhr.status + ")" + xhr.statusText + " (" + url + "): '" + xhr.responseText + "'");
            }
        });
    }

    APICalls.findProfileURL = function(entity, callback, errorCallback) {
        var profile_url = APICalls.cache.profile_urls.getItem(entity);

        if (profile_url && profile_url != "null") {

            callback(profile_url);

        } else {

            jQuery.ajax({
                url: entity,
                type: "HEAD",
                complete: function(resp) {
                    if(resp) {
                        var headers = resp.getAllResponseHeaders();

                        var profile_urls = APICalls.parseHeaderForProfiles(headers);
                        var profile_url = null;
                        if(profile_urls.length > 0) {
                            var profile_url = profile_urls[0];
                            if (!profile_url.startsWith("http")) {
                                profile_url = entity + profile_url;
                            }
                        }

                        if (profile_url) {
                            APICalls.cache.profile_urls.setItem(entity, profile_url);
                            callback(profile_url);
                        } else {
                            APICalls.http_call(entity, "GET", function(resp) {

                                if (resp.status >= 200 && resp.status < 300) {
                                    var doc = document.implementation.createHTMLDocument("");
                                    doc.documentElement.innerHTML = resp.responseText;
                                    var links = $(doc).find("link[rel='https://tent.io/rels/meta-post']");

                                    if (links.length > 0) {
                                        var href = links.get(0).href;
                                        APICalls.cache.profile_urls.setItem(entity, href);
                                        if (!href.startsWith("http")) {
                                            href = entity + href;
                                        }
                                        callback(href);

                                    } else {
                                        if(errorCallback) errorCallback(entity + " has no profile URL");
                                    }
                                } else {
                                    if(errorCallback) errorCallback(entity + " has no profile URL");
                                }

                            }, null, false, false);

                            //if(errorCallback) errorCallback(entity + " has no profile URL");
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

    APICalls.mkApiRootPath = function(path) {

        var api_root = HostApp.stringForKey("api_root");

        if((api_root.substring(api_root.length - 1, api_root.length) != "/") && (path.substring(0, 1) != "/")) {
            api_root += "/";
        } else if((api_root.substring(api_root.length - 1, api_root.length) == "/") && (path.substring(0, 1) == "/")) {
            api_root = api_root.substring(0, api_root.length -1);
        }
        return api_root + path;
    }

    APICalls.parseHeaderForProfiles = function(header_string) {
        var regexp = /https:\/\/tent.io\/rels\/meta-post/i;
        return APICalls.parseHeaderForLink(header_string, regexp);
    }

    APICalls.parseHeader = function(header_string) {
        var header_strings = header_string.split(/\n/);
        var headers = {};
        for (var i = 0; i < header_strings.length; i++) {
            var hs = header_strings[i].split(/:(.+)?/);
            headers[hs[0]] = hs[1];
        }
        return headers;
    }

    APICalls.getCount = function(resp) {
        var count = 0;
        var headers = APICalls.parseHeader(resp.getAllResponseHeaders());
        if(headers["Count"]) count = parseInt(headers["Count"], 10);
        return count;
    }

    APICalls.parseHeaderForLink = function(header_string, match) {
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
        var things = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.match(match)) {
                var n = item.match(/<([^>]*)>/);
                if (n) {
                    things.push(n[1]);
                }
            }
        }

        return things;
    }

    return APICalls;
});
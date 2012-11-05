// its different for app authentication and user authentication:
// for apps its id: mac_key_id and secret: mac_key,
// for users its id: access_token and secret:mac_key

function getURL(url, http_method, callback, data, auth_header) {
    $.ajax({
        beforeSend: function(xhr) {
            if (data) xhr.setRequestHeader("Content-Length", data.length);

            if (auth_header) { // if is_set? auth_header
                xhr.setRequestHeader("Authorization", auth_header);
            } else {
                var user_access_token = controller.stringForKey_("user_access_token");
                if (auth_header !== false && user_access_token) {
                    auth_header = makeAuthHeader(
                        url, 
                        http_method, 
                        controller.stringForKey_("user_mac_key"), 
                        user_access_token
                    )
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
            alert("getURL " + xhr.statusText + " " + http_method + " (" + url + "): '" + xhr.responseText + "'");
        }
    });
}

function makeAuthHeader(url, http_method, mac_key, mac_key_id) {

    url = URI(url);
    var nonce = makeid(8);
    var time_stamp = parseInt((new Date).getTime() / 1000, 10);

    var port = url.port();
    if (!port) {
        port = url.protocol() == "https" ? "443" : "80";
    }

    var normalizedRequestString = "" 
                                + time_stamp + '\n'
                                + nonce + '\n'
                                + http_method + '\n'
                                + url.path() + url.search() + url.hash() + '\n'
                                + url.hostname() + '\n'
                                + port + '\n'
                                + '\n' ;

    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, mac_key);
    hmac.update(normalizedRequestString);
    var hash = hmac.finalize();
    var mac = hash.toString(CryptoJS.enc.Base64);

    return 'MAC id="' + mac_key_id +
            '", ts="' + time_stamp +
            '", nonce="' + nonce +
            '", mac="' + mac + '"';
}

function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function findProfileURL(entity, callback) {
    $.ajax({
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
                }
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert("findProfileURL " + xhr.statusText + " (" + entity + "): " + xhr.responseText);
        }
    });
}

function mkApiRootPath(path) {
    var api_root = controller.stringForKey_("api_root");
    if((api_root.substring(api_root.length - 1, api_root.length) != "/") && (path.substring(0, 1) != "/")) {
        api_root += "/";
    } else if((api_root.substring(api_root.length - 1, api_root.length) == "/") && (path.substring(0, 1) == "/")) {
        api_root = api_root.substring(0, api_root.length -1);
    }
    return api_root + path;
}

function debug(string) {
    if (typeof string == "Object") {
        string = JSON.stirngify(string);
    }
    alert("DEBUG: " + string);
}
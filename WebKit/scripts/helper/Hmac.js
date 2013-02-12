define([
    "lib/URI",
    "lib/CryptoJS"
],

function(URI, CryptoJS) {

    var Hmac = {};

    Hmac.makeAuthHeader = function(url, http_method, mac_key, mac_key_id) {

        url = URI(url);
        var nonce = Hmac.makeid(8);
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

    Hmac.makeid = function(len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < len; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    return Hmac;
});

// its different for app authentication and user authentication:
// for apps its id: mac_key_id and secret: mac_key,
// for users its id: access_token and secret:mac_key

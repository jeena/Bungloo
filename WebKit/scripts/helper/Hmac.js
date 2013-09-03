define([
    "lib/URI",
    "lib/CryptoJS"
],

function(URI, CryptoJS) {

    var Hmac = {};

    Hmac.makeHawkAuthHeader = function(url, http_method, hawk_id, key, app_id) {

        url = URI(url);
        var nonce = Hmac.makeid(8);
        var time_stamp = parseInt((new Date).getTime() / 1000, 10);

        var port = url.port();
        if (!port) {
            port = url.protocol() == "https" ? "443" : "80";
        }

        var normalizedRequestString = "hawk.1.header\n" // header
                                    + time_stamp + '\n' // ts
                                    + nonce + '\n' // nonce
                                    + http_method.toUpperCase() + '\n' // method
                                    + url.path() + url.search() + url.hash() + '\n' // request uri
                                    + url.hostname().toLowerCase() + '\n' // host
                                    + port + '\n' // port
                                    + '\n' // Hmac.calculatePayloadHash(payload) + '\n' // hash // FIXME implement payload validation
                                    + '\n' // ext (we don't use it)

        var app = "";

        if(app_id) {
            app = ', app="' + app_id + "'";
            normalizedRequestString +=  app_id + "\n" + // app
                                        '\n'; // dlg should be empty
        }

        var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
        hmac.update(normalizedRequestString);
        var hash = hmac.finalize();
        var mac = hash.toString(CryptoJS.enc.Base64);

        return 'Hawk id="' + hawk_id +
                '", mac="' + mac +
                '", ts="' + time_stamp +
                '", nonce="' + nonce + '"' +
                app
    }

    Hmac.calculatePayloadHash = function (payload) {
        if (!payload) return "";

        var hash = CryptoJS.algo.SHA256.create();
        hash.update('hawk.1.payload\n');
        hash.update('application/vnd.tent.post.v0+json\n');
        hash.update(payload || '');
        hash.update('\n');
        return hash.finalize().toString(CryptoJS.enc.Base64);
    },

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

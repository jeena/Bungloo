// its different for app authentication and user authentication:
// for apps its id: mac_key_id and secret: mac_key,
// for users its id: access_token and secret:mac_key

function getURL(url, http_method, callback, data, auth_header) {
    $.ajax({
        beforeSend: function(xhr) {
            if (data) {
                xhr.setRequestHeader("Content-Length", data.length);
            }

            if (auth_header) {
                xhr.setRequestHeader("Authorization", auth_header);                
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
            alert("getURL ERROR:");
            alert(xhr.statusText);
            alert(ajaxOptions);
            alert(thrownError);
        }
    });
}

function makeAuthHeader(url, http_method, mac_key, mac_key_id) {

    url = URI(url);
    var nonce = makeid(8);
    var time_stamp = parseInt((new Date).getTime() / 1000, 10);

    var normalizedRequestString = "" 
                                + time_stamp + '\n'
                                + nonce + '\n'
                                + http_method + '\n'
                                + url.path() + '\n'
                                + url.hostname() + '\n'
                                + url.port() + '\n'
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
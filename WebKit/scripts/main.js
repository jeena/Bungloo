var tentia_instance;
var tentia_cache = {};
var OS_TYPE = "mac";

requirejs.config({
    baseUrl: 'scripts'
});

function start(view) {

    if (view == "oauth") {
        
        require(["controller/Oauth"], function(Oauth) {

            tentia_instance = new Oauth();
            tentia_instance.authenticate();

        });

    } else if (view == "timeline") {

        require(["controller/Timeline"], function(Timeline) {

            tentia_instance = new Timeline();

        });

    } else if (view == "mentions") {

        require(["controller/Mentions"], function(Mentions) {

            tentia_instance = new Mentions();

        });

    } else if (view == "profile") {

    } else if (view == "follow") {

    } else if (view == "conversation") {

    }
}


String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

function loadPlugin(url) {
    var plugin = document.createElement("script");
    plugin.type = "text/javascript";
    plugin.src = url;
    document.getElementsByTagName("head")[0].appendChild(plugin);
}

function debug(string) {
    if (typeof string != "string") {
        string = JSON.stringify(string);
    }
    alert("DEBUG: " + string);
}

setTimeout(HostAppGo, 1000);

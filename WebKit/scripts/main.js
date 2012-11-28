var tentia_instance;
var tentia_cache = {};

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

        require(["controller/Profile"], function(Profile) {

            tentia_instance = new Profile();

        });

    } else if (view == "follow") {

    } else if (view == "conversation") {

        require(["controller/Conversation"], function(Conversation) {

            tentia_instance = new Conversation();

        });

    }
}


String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

var __entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
};

String.prototype.escapeHTML = function() {
    return String(this).replace(/[&<>]/g, function (s) {
        return __entityMap[s];
    });
}

var console = {
    log: function(s) {
        if (OS_TYPE == "mac") {
            alert(s)
        } else {
            __console.log(s);
        }
    },
    error: function(s) {
        if (OS_TYPE == "mac") {
            alert("ERROR: " + s);
        } else {
            __console.error(s);
        }
    },
    warn: function (s) {
        if (OS_TYPE == "mac") {
            alert("WARNING: " + s);
        } else {
            __console.warning(s);
        }
    },
    notice: function(s) {
        if (OS_TYPE == "mac") {
            alert("NOTICE: " + s);
        } else {
            __console.notice(s);
        }
    },
    debug: function(s) {
        if (OS_TYPE == "mac") {
            alert("DEBUG: " + s);
        } else {
            __console.debug(s);
        }
    }
};

function loadJsPlugin(js_url) {
    if (js_url) {
        var js_plugin = document.createElement("script");
        js_plugin.type = "text/javascript";
        js_plugin.src = js_url;
        document.getElementsByTagName("head")[0].appendChild(js_plugin);
    }
}

function loadCssPlugin(css_url) {

    if (css_url) {
        var css_plugin = document.createElement("link");
        css_plugin.rel = 'stylesheet';
        css_plugin.type = 'text/css'
        css_plugin.href = css_url;
        document.getElementsByTagName("head")[0].appendChild(css_plugin);
    }
}

function debug(string) {
    
    if (typeof string != "string") {
        string = JSON.stringify(string);
    }

    console.debug(string);
}

function go() { // wait untill everything is loaded
    setTimeout(function() {
        
        if (typeof HostAppGo != typeof __not_defined__) {

            HostAppGo();

        } else {
            
            go();

        }

    }, 500);    
}

go();
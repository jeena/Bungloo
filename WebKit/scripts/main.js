
var bungloo = {
    oauth: null,
    sidebar: null,
    timeline: null,
    mentions: null,
    entityProfile: null,
    conversation: null,
    search: null,
    cache: {}
};

requirejs.config({
    baseUrl: 'scripts'
});

function start() {
/*
    require(["controller/Oauth"], function(Oauth) {

        bungloo.oauth = new Oauth();

    });*/

    require([
        "controller/Sidebar",
        "controller/Timeline",
        "controller/Mentions",
        "controller/Profile",
        "controller/Conversation",
        "controller/Search"

        ], function(Sidebar, Timeline, Mentions, Profile, Conversation, Search) {

        bungloo.sidebar = new Sidebar();
        bungloo.timeline = new Timeline();
        bungloo.mentions = new Mentions();
        bungloo.entityProfile = new Profile();
        bungloo.conversation = new Conversation();
        bungloo.search = new Search();

    });
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
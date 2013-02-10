define([
],

function() {

    function CacheStorage(name) {
        this.name = name;
    }

    CacheStorage.prototype.mkPath = function(key) {
        return this.mkInternalPath("") + "-" + key;
    }

    CacheStorage.prototype.mkInternalPath = function(key) {
        return "bungloo-cache-" + this.name + key;
    };

    CacheStorage.prototype.getItem = function(key) {
        var item = null;
        
        try { // If localStorage doesn't work then just leave it empty
            item = JSON.parse(localStorage.getItem(this.mkPath(key)));  
        } catch(e) {}

        return item;
    }

    CacheStorage.prototype.setItem = function(key, value) {
        var item = this.getItem(key);

        try {
            localStorage.setItem(this.mkPath(key), JSON.stringify(value));

            if (!item) {
                var length_path = this.mkInternalPath("_length");
                var length = parseInt(localStorage.getItem(length_path), 10) + 1;
                localStorage.setItem(length_path, length);
            }        
        } catch(e) {}
    }

    CacheStorage.prototype.removeItem = function(key) {
        var item = this.getItem(key);

        try {
            localStorage.removeItem(this.mkPath(key));

            if (item) {
                var length_path = this.mkInternalPath("_length");
                var length = parseInt(localStorage.getItem(length_path), 10) - 1;
                localStorage.setItem(length_path, length);
            }            
        } catch(e) {}
    };

    CacheStorage.prototype.clear = function() {
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.startsWith(this.mkPath(""))) {
                    localStorage.removeItem(key);
                }
            }

            localStorage.setItem(this.mkInternalPath("_length"), 0);            
        } catch(e) {}
    }

    CacheStorage.prototype.length = function() {
        var l = 0;
        try {
            l = parseInt(localStorage.getItem(this.mkInternalPath("_length")), 10);
        } catch(e) {}
        return l;
    }

    return CacheStorage;

});
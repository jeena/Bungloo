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
        return "tentia-cache-" + this.name + key;
    };

    CacheStorage.prototype.getItem = function(key) {
        return localStorage.getItem(this.mkPath(key));
    }

    CacheStorage.prototype.setItem = function(key, value) {
        var item = this.getItem(key);

        localStorage.setItem(this.mkPath(key), value);

        if (!item) {
            var length_path = this.mkInternalPath("_length");
            var length = parseInt(localStorage.getItem(length_path), 10) + 1;
            localStorage.setItem(length_path, length);
        }
    }

    CacheStorage.prototype.removeItem = function(key) {

        var item = this.getItem(key);

        localStorage.removeItem(this.mkPath(key));

        if (item) {
            var length_path = this.mkInternalPath("_length");
            var length = parseInt(localStorage.getItem(length_path), 10) - 1;
            localStorage.setItem(length_path, length);
        }
    };

    CacheStorage.prototype.clear = function() {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.startsWith(this.mkPath(""))) {
                localStorage.removeItem(key);
            }
        }

        localStorage.setItem(this.mkInternalPath("_length"), 0);
    }

    CacheStorage.prototype.length = function() {
        return parseInt(localStorage.getItem(this.mkInternalPath("_length")), 10);
    }

    return CacheStorage;

});
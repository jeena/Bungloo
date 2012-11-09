define(function() {
    
    var HostApp = {};

    HostApp.setStringForKey = function(string, key) {

        if (OS_TYPE == "mac") {
            controller.setString_forKey_(string, key);
        } else {
            controller.setStringForKey(string, key);
        }
    }

    HostApp.stringForKey = function(key) {

        if (OS_TYPE == "mac") {
            return controller.stringForKey_(key);
        } else {
            return controller.stringForKey(key);
        }
    }

    HostApp.openURL = function(url) {

        if (OS_TYPE == "mac") {
            controller.openURL_(url);
        } else {
            controller.openURL(URL);
        }
    }

    HostApp.loggedIn = function() {

        controller.loggedIn();
    }

    HostApp.logout = function() {

        if (OS_TYPE == "mac") {
            controller.logout_(self);
        } else {
            controller.logout(self);
        }
    }

    HostApp.unreadMentions = function(i) {

        if (OS_TYPE == "mac") {
            controller.unreadMentions_(i);
        } else {
            controller.unreadMentions(i);
        }
    }

    HostApp.openNewMessageWidow = function(entity, status_id, string) {

        if (OS_TYPE == "mac") {
            controller.openNewMessageWindowInReplyTo_statusId_withString_(entity, status_id, string);
        } else {
            controller.openNewMessageWindowInReplyTostatusIdwithString(entity, status_id, string);
        }
    }

    HostApp.showConversation = function(id, entity) {

        if (OS_TYPE == "mac") {
            controller.showConversationForPostId_andEntity_(id, entity);
        } else {
            controller.showConversationForPostIdandEntity(id, entity);
        }
    }

    return HostApp;    

});
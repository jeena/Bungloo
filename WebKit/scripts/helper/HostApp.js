define(function() {
   
    var HostApp = {};

    HostApp.setStringForKey = function(string, key) {

        if (OS_TYPE == "mac") {
            controller.setString_forKey_(string, key);
        } else {
            controller.setStringForKey(string, key);
        }
    }
      
    HostApp.setSecret = function(string) {
      
       if (OS_TYPE == "mac") {
            controller.setSecret_(string);
       } else {
            controller.setStringForKey(string, "user_mac_key");
       }
    }
      
    HostApp.secret = function() {
       if (OS_TYPE == "mac") {
            return controller.secret();
       } else {
            return controller.stringForKey("user_mac_key");
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
            controller.openURL(url);
        }
    }

    HostApp.openAuthorizationURL = function(url) {

        if (OS_TYPE == "mac") {
            controller.openURL_(url);
        } else {
            controller.openAuthorizationURL(url);
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

    HostApp.openNewMessageWidow = function(entity, status_id, string, is_private) {

        if (OS_TYPE == "mac") {
            controller.openNewMessageWindowInReplyTo_statusId_withString_isPrivate_(entity, status_id, string, is_private);
        } else {
            controller.openNewMessageWindowInReplyTostatusIdwithStringIsPrivate(entity, status_id, string, is_private);
        }
    }

    HostApp.showConversation = function(id, entity) {

        if (OS_TYPE == "mac") {
            controller.showConversationForPostId_andEntity_(id, entity);
        } else {
            controller.showConversationForPostIdandEntity(id, entity);
        }
    }

    HostApp.showProfileForEntity = function(entity) {

        if (OS_TYPE == "mac") {
            controller.showProfileForEntity_(entity);
        } else {
            controller.showProfileForEntity(entity);
        }
    }

    HostApp.notificateUserAboutMention = function(text, name, post_id, entity) {
        if (OS_TYPE == "mac") {
            controller.notificateUserAboutMention_fromName_withPostId_andEntity_(text, name, post_id, entity);
        } else {
            controller.notificateUserAboutMentionFromNameWithPostIdAndEntity(text, name, post_id, entity);
	}
    }

    HostApp.alertTitleWithMessage = function(title, message) {
        if (OS_TYPE == "mac") {
            controller.alertTitle_withMessage_(title, message);
        } else {
            controller.alertTitleWithMessage(title, message);
        }
    }

    HostApp.authentificationDidNotSucceed = function(errorMessage) {
        if (OS_TYPE == "mac") {
            controller.authentificationDidNotSucceed_(errorMessage);
        } else {
            controller.authentificationDidNotSucceed(errorMessage);
        }
    }

    HostApp.osType = function() {
        return OS_TYPE == "mac" ? "OS X" : "Linux";
    }

    HostApp.notificateViewsAboutDeletedPost = function(postId, entity) {
        if (OS_TYPE == "mac") {
            controller.notificateViewsAboutDeletedPostWithId_byEntity_(postId, entity);
        } else {
            controller.notificateViewsAboutDeletedPostWithIdbyEntity(postId, entity);
        }
    }

    return HostApp;

});
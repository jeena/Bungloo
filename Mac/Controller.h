//
//  Controller.h
//  Tentia
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Cocoa/Cocoa.h>
#import <Webkit/Webkit.h>
#import "ViewDelegate.h"
#import <Carbon/Carbon.h>
#import "Constants.h"
#import "AccessToken.h"
#import <Growl/Growl.h>
#import "NSData+Base64.h"
#import "MimeType.h"

@interface Controller : NSObject <GrowlApplicationBridgeDelegate> {
	IBOutlet WebView *timelineView;
	IBOutlet NSWindow *timelineViewWindow;
	IBOutlet WebView *mentionsView;
	IBOutlet NSWindow *mentionsViewWindow;
    IBOutlet WebView *conversationView;
    IBOutlet NSWindow *conversationViewWindow;
    NSWindow *loginViewWindow;
    NSTextField *loginEntityTextField;
    NSProgressIndicator *loginActivityIndicator;
	IBOutlet NSMenuItem *globalHotkeyMenuItem;
	IBOutlet NSImageView *logoLayer;
	ViewDelegate *viewDelegate;
    WebView *oauthView;
    AccessToken *accessToken;

}

@property (retain, nonatomic) IBOutlet WebView *timelineView;
@property (retain, nonatomic) IBOutlet NSWindow *timelineViewWindow;
@property (retain, nonatomic) IBOutlet WebView *mentionsView;
@property (retain, nonatomic) IBOutlet NSWindow *mentionsViewWindow;
@property (retain, nonatomic) IBOutlet WebView *conversationView;
@property (retain, nonatomic) IBOutlet NSWindow *conversationViewWindow;
@property (assign) IBOutlet NSWindow *loginViewWindow;
@property (assign) IBOutlet NSTextField *loginEntityTextField;
@property (assign) IBOutlet NSProgressIndicator *loginActivityIndicator;
@property (retain, nonatomic) IBOutlet NSMenuItem *globalHotkeyMenuItem;
@property (retain, nonatomic) IBOutlet NSImageView *logoLayer;
@property (retain, nonatomic) IBOutlet ViewDelegate *viewDelegate;
@property (retain, nonatomic) WebView *oauthView;
@property (retain, nonatomic) AccessToken *accessToken;


- (void)initOauth;
- (void)authentificationSucceded:(id)sender;
- (void)authentificationDidNotSucceed:(NSString *)errorMessage;
- (void)initWebViews;
- (void)initHotKeys;
- (void)alertTitle:(NSString *)title withMessage:(NSString *)message;
- (void)openNewMessageWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string;
- (NSString *)pluginURL;
- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent;
- (void)unreadMentions:(int)count;
- (void)notificateUserAboutMention:(NSString *)text fromName:(NSString *)name withPostId:(NSString *)postId andEntity:(NSString *)entity;

- (void)openURL:(NSString *)url;

- (void)setString:(NSString *)string forKey:(NSString *)aKey;
- (NSString *)stringForKey:(NSString *)aKey;
- (void)storeAccessToken:(NSString *)accessToken secret:(NSString *)secret userId:(NSString *)userId andScreenName:(NSString *)screenName;
- (void)loggedIn;

- (IBAction)login:(id)sender;
- (IBAction)logout:(id)sender;

- (IBAction)showConversationForPostId:(NSString *)postId andEntity:(NSString *)entity;


OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData);

@end

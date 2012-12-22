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
    WebView *profileView;
    NSWindow *profileViewWindow;
    NSWindow *loginViewWindow;
    NSTextField *loginEntityTextField;
    NSProgressIndicator *loginActivityIndicator;
	IBOutlet NSMenuItem *globalHotkeyMenuItem;
	IBOutlet NSImageView *logoLayer;
	ViewDelegate *viewDelegate;
    WebView *oauthView;
    AccessToken *accessToken;

}

@property (assign) IBOutlet WebView *timelineView;
@property (assign) IBOutlet NSWindow *timelineViewWindow;
@property (assign) IBOutlet WebView *mentionsView;
@property (assign) IBOutlet NSWindow *mentionsViewWindow;
@property (assign) IBOutlet WebView *conversationView;
@property (assign) IBOutlet NSWindow *conversationViewWindow;
@property (assign) IBOutlet WebView *profileView;
@property (assign) IBOutlet NSWindow *profileViewWindow;

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
- (void)openNewMessageWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string isPrivate:(BOOL)isPrivate;
- (NSString *)pluginURL;
- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent;
- (void)unreadMentions:(int)count;
- (void)notificateUserAboutMention:(NSString *)text fromName:(NSString *)name withPostId:(NSString *)postId andEntity:(NSString *)entity;

- (void)openURL:(NSString *)url;

- (void)setString:(NSString *)string forKey:(NSString *)aKey;
- (void)setSecret:(NSString *)string;
- (NSString *)secret;
- (NSString *)stringForKey:(NSString *)aKey;
- (void)storeAccessToken:(NSString *)accessToken secret:(NSString *)secret userId:(NSString *)userId andScreenName:(NSString *)screenName;
- (void)loggedIn;

- (IBAction)login:(id)sender;
- (IBAction)logout:(id)sender;

- (IBAction)showConversationForPostId:(NSString *)postId andEntity:(NSString *)entity;

- (IBAction)clearCache:(id)sender;

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData);

@end

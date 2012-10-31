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


@interface Controller : NSObject {
	IBOutlet WebView *timelineView;
	IBOutlet NSWindow *timelineViewWindow;
	IBOutlet WebView *mentionsView;
	IBOutlet NSWindow *mentionsViewWindow;
    NSWindow *loginViewWindow;
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
@property (assign) IBOutlet NSWindow *loginViewWindow;
@property (assign) IBOutlet NSProgressIndicator *loginActivityIndicator;
@property (retain, nonatomic) IBOutlet NSMenuItem *globalHotkeyMenuItem;
@property (retain, nonatomic) IBOutlet NSImageView *logoLayer;
@property (retain, nonatomic) IBOutlet ViewDelegate *viewDelegate;
@property (retain, nonatomic) WebView *oauthView;
@property (retain, nonatomic) AccessToken *accessToken;

- (void)initOauth;
- (void)authentificationSucceded:(id)sender;
- (void)initWebViews;
- (void)initHotKeys;
- (void)openNewMessageWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string;
- (NSString *)pluginURL;
- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent;
- (void)unreadMentions:(NSInteger)count;
- (void)openURL:(NSString *)url;

- (void)setString:(NSString *)string forKey:(NSString *)aKey;
- (NSString *)stringForKey:(NSString *)aKey;
- (void)storeAccessToken:(NSString *)accessToken secret:(NSString *)secret userId:(NSString *)userId andScreenName:(NSString *)screenName;
- (void)loggedIn;

- (IBAction)login:(id)sender;
- (IBAction)logout:(id)sender;


OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData);

@end

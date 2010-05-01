//
//  Controller.h
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Cocoa/Cocoa.h>
#import <Webkit/Webkit.h>
#import "ViewDelegate.h"
#import <Carbon/Carbon.h>
#import "Constants.h"


@interface Controller : NSObject {
	IBOutlet WebView *timelineView;
	IBOutlet NSWindow *timelineViewWindow;
	IBOutlet WebView *mentionsView;
	IBOutlet NSWindow *mentionsViewWindow;
	IBOutlet NSMenuItem *globalHotkeyMenuItem;
	ViewDelegate *viewDelegate;
}

@property (retain, nonatomic) IBOutlet WebView *timelineView;
@property (retain, nonatomic) IBOutlet NSWindow *timelineViewWindow;
@property (retain, nonatomic) IBOutlet WebView *mentionsView;
@property (retain, nonatomic) IBOutlet NSWindow *mentionsViewWindow;
@property (retain, nonatomic) IBOutlet NSMenuItem *globalHotkeyMenuItem;
@property (retain, nonatomic) IBOutlet ViewDelegate *viewDelegate;

- (void)initWebViews;
- (void)initHotKeys;
- (void)openNewTweetWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId;
- (NSString *)pluginURL;
- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent;
- (void)unreadMentions:(NSInteger)count;

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData);

@end

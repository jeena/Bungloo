//
//  Controller.h
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Cocoa/Cocoa.h>
#import <Webkit/Webkit.h>
#import "StatusView.h"
#import "ViewDelegate.h"
#import <Carbon/Carbon.h>

@interface Controller : NSObject {
	IBOutlet WebView *webView;
	id<StatusView> viewDelegate;
	NSString *username;
	NSString *password;
}

@property (retain, nonatomic) IBOutlet WebView *webView;
@property (retain, nonatomic) IBOutlet id<StatusView> viewDelegate;

- (void)initWebView;
- (void)openNewTweetWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId;
OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData);

@end

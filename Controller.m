//
//  Controller.m
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "Controller.h"
#import "MyDocument.h"


@implementation Controller

@synthesize timelineView, timelineViewWindow, mentionsView, mentionsViewWindow, globalHotkeyMenuItem, viewDelegate, oauth;

- (void)awakeFromNib {
	
	[self initHotKeys];
	
	NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
	[nc addObserver:self 
		   selector:@selector(openNewTweetWindow:) 
			   name:@"openNewTweetWindow"
			 object:nil];
	[nc addObserver:self 
		   selector:@selector(sendTweet:) 
			   name:@"sendTweet"
			 object:nil];
	[nc addObserver:self 
		   selector:@selector(authentificationSucceded:) 
			   name:@"authentificationSucceded"
			 object:nil];
	
	NSAppleEventManager *appleEventManager = [NSAppleEventManager sharedAppleEventManager];
	[appleEventManager setEventHandler:self
						   andSelector:@selector(handleGetURLEvent:withReplyEvent:)
						 forEventClass:kInternetEventClass
							andEventID:kAEGetURL];
	
	if ([oauth accessToken]) {
		[self initWebViews];
	}
}

- (void)initHotKeys {

	NSInteger newTweetKey = kVK_ANSI_T; // http://boredzo.org/blog/archives/2007-05-22/virtual-key-codes
	NSInteger newTweetModifierKey = controlKey + cmdKey + optionKey; // cmdKey 256, shitfKey 512, optionKey 2048, controlKey 4096 
	
	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
	NSInteger defaultsNewTweetKey = (NSInteger)[defaults integerForKey:@"newTweetKey"];
	if ([NSNumber numberWithInt:defaultsNewTweetKey] != nil) {
		newTweetKey = defaultsNewTweetKey;
	} else {
		[defaults setInteger:newTweetKey forKey:@"newTweetKey"];
	}
	
	NSInteger defaultsNewTweetModifierKey = (NSInteger)[defaults integerForKey:@"newTweetModifierKey"];
	if ([NSNumber numberWithInt:defaultsNewTweetModifierKey] != nil) {
		newTweetModifierKey = defaultsNewTweetModifierKey;
	} else {
		[defaults setInteger:newTweetModifierKey forKey:@"newTweetModifierKey"];
	}
	
	NSUInteger cocoaModifiers = 0;
	if (newTweetModifierKey & shiftKey) cocoaModifiers = cocoaModifiers | NSShiftKeyMask;
	if (newTweetModifierKey & optionKey) cocoaModifiers = cocoaModifiers | NSAlternateKeyMask;
	if (newTweetModifierKey & controlKey) cocoaModifiers = cocoaModifiers | NSControlKeyMask;
	if (newTweetModifierKey & cmdKey) cocoaModifiers = cocoaModifiers | NSCommandKeyMask;
	
	[globalHotkeyMenuItem setKeyEquivalent:[Constants stringFromVirtualKeyCode:newTweetKey]];
	[globalHotkeyMenuItem setKeyEquivalentModifierMask:cocoaModifiers];
	
	/* CARBON from http://github.com/Xjs/drama-button/blob/carbon/Drama_ButtonAppDelegate.m */
	
	EventTypeSpec eventType;
	eventType.eventClass = kEventClassKeyboard;
	eventType.eventKind  = kEventHotKeyPressed;
	
	InstallApplicationEventHandler(&handler, 1, &eventType, NULL, NULL);
	
	EventHotKeyID g_HotKeyID;
	g_HotKeyID.id = 1;
	
	EventHotKeyRef g_HotKeyRef;
	
	RegisterEventHotKey(newTweetKey, newTweetModifierKey, g_HotKeyID, GetApplicationEventTarget(), 0, &g_HotKeyRef);
	
	/* end CARBON */
}

- (void)authentificationSucceded:(id)sender {
	[self initWebViews];
}

- (void)initWebViews {

	NSString *path = [[NSBundle mainBundle] resourcePath];
	NSURL *url = [NSURL fileURLWithPath:path];
	NSString *index_string = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%@/index.html", path] encoding:NSUTF8StringEncoding error:nil];
	
	viewDelegate = [[ViewDelegate alloc] init];

	viewDelegate.timelineView = timelineView;
	[[timelineView mainFrame] loadHTMLString:index_string baseURL:url];
	[timelineView setFrameLoadDelegate:viewDelegate];
	[timelineView setPolicyDelegate:viewDelegate];
	[timelineView setUIDelegate:viewDelegate];
    [[timelineView windowScriptObject] setValue:self forKey:@"controller"];

	viewDelegate.mentionsView = mentionsView;
	[[mentionsView mainFrame] loadHTMLString:index_string baseURL:url];
	[mentionsView setFrameLoadDelegate:viewDelegate];
	[mentionsView setPolicyDelegate:viewDelegate];
	[mentionsView setUIDelegate:viewDelegate];
    [[mentionsView windowScriptObject] setValue:self forKey:@"controller"];
}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector {
	return NO;
}

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name {
	return NO;
}


#pragma mark Notifications

- (IBAction)openNewTweetWindow:(id)sender {
	[NSApp activateIgnoringOtherApps:YES]; 
	[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];	
}

- (void)openNewTweetWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId {
	[NSApp activateIgnoringOtherApps:YES]; 
	MyDocument *newTweet = (MyDocument *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
	[newTweet inReplyTo:userName statusId:statusId];
}

- (void)openNewTweetWindowWithString:(NSString *)aString {
	[NSApp activateIgnoringOtherApps:YES];
	
	if ([aString hasPrefix:@"//oauth_token/"]) {
		// [oauth requestAccessToken:[aString substringFromIndex:14]];
	} else {
		MyDocument *newTweet = (MyDocument *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
		[newTweet withString:aString];		
	}
	
}

- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent {
	NSString *text = [[[event paramDescriptorForKeyword:keyDirectObject] stringValue] substringFromIndex:8];
	[self openNewTweetWindowWithString:[text stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
}

- (IBAction)sendTweet:(id)sender {
	NSString *encodedString = [[[sender object] objectAtIndex:0] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	[timelineView stringByEvaluatingJavaScriptFromString:
	 [NSString stringWithFormat:@"twittia_instance.sendNewTweet(\"%@\", \"%@\")",
	  [encodedString stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""],
	  [[sender object] objectAtIndex:1]]];
}

- (NSString *)pluginURL {
	NSFileManager *fileManager = [NSFileManager defaultManager];
	NSString *pathToPlugin = [@"~/Library/Application Support/Twittia/Plugin.js" stringByExpandingTildeInPath];
	if([fileManager fileExistsAtPath:pathToPlugin]) {
		return [NSString stringWithFormat:@"%@", [NSURL fileURLWithPath:pathToPlugin]];
	}
	return nil;
}

- (void)unreadMentions:(NSInteger)count {
	if (![mentionsViewWindow isVisible] && count > 0) {
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Twittia (@%i)", count]];
	} else {
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Twittia"]];
		[mentionsView stringByEvaluatingJavaScriptFromString:@"twittia_instance.unread_mentions = 0;"];
	}
}

// Mentions window has been visible
- (void)windowDidBecomeKey:(NSNotification *)notification {
	if ([notification object] == mentionsViewWindow) {
		[self unreadMentions:0];		
	}	
}


/* CARBON */

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData)
{
	[[NSNotificationCenter defaultCenter] postNotificationName:@"openNewTweetWindow" object:nil];
	return noErr;
}

@end

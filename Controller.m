//
//  Controller.m
//  Tentia
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "Controller.h"
#import "NewMessageWindow.h"
#import "TweetModel.h"


@implementation Controller
@synthesize loginViewWindow;
@synthesize loginActivityIndicator;

@synthesize timelineView, timelineViewWindow, mentionsView, mentionsViewWindow, globalHotkeyMenuItem, viewDelegate;
@synthesize logoLayer;
@synthesize oauthView, accessToken;

- (void)awakeFromNib {
	
	[self initHotKeys];
	
	NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
	[nc addObserver:self 
		   selector:@selector(openNewMessageWindow:) 
			   name:@"openNewMessageWindow"
			 object:nil];
	[nc addObserver:self 
		   selector:@selector(sendTweet:) 
			   name:@"sendTweet"
			 object:nil];
	[nc addObserver:self 
		   selector:@selector(authentificationSucceded:) 
			   name:@"authentificationSucceded"
			 object:nil];
	[nc addObserver:self 
		   selector:@selector(getTweetUpdates:) 
			   name:@"getTweetUpdates"
			 object:nil];
	
	NSAppleEventManager *appleEventManager = [NSAppleEventManager sharedAppleEventManager];
	[appleEventManager setEventHandler:self
						   andSelector:@selector(handleGetURLEvent:withReplyEvent:)
						 forEventClass:kInternetEventClass
							andEventID:kAEGetURL];
	 
    viewDelegate = [[ViewDelegate alloc] init];
    
    
    accessToken = [[AccessToken alloc] init];

    //[accessToken setString:nil forKey:@"user_access_token"];
    
    if (![accessToken stringForKey:@"user_access_token"]) {
        [timelineViewWindow performClose:self];
        [mentionsViewWindow performClose:self];
        [self.loginViewWindow makeKeyAndOrderFront:self];
    } else {
        [timelineViewWindow makeKeyAndOrderFront:self];
        [self initWebViews];
    }    
}

- (void)initOauth {
    if (!oauthView) {
        NSString *path = [[NSBundle mainBundle] resourcePath];
        NSURL *url = [NSURL fileURLWithPath:path];
        NSString *index_string = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%@/index_oauth.html", path] encoding:NSUTF8StringEncoding error:nil];
        
        
        oauthView = [[WebView alloc] init];
        viewDelegate.oauthView = oauthView;
        [[oauthView mainFrame] loadHTMLString:index_string baseURL:url];
        [oauthView setFrameLoadDelegate:viewDelegate];
        [oauthView setPolicyDelegate:viewDelegate];
        [oauthView setUIDelegate:viewDelegate];
        [[oauthView windowScriptObject] setValue:self forKey:@"controller"];
    } else {
        [oauthView stringByEvaluatingJavaScriptFromString:@"tentia_oauth.authenticate()"];
    }
}

- (void)initHotKeys {

	NSInteger newTweetKey = kVK_ANSI_M; // http://boredzo.org/blog/archives/2007-05-22/virtual-key-codes
	NSInteger newTweetModifierKey = controlKey + cmdKey + optionKey; // cmdKey 256, shitfKey 512, optionKey 2048, controlKey 4096 
	
	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
	NSInteger defaultsNewTweetKey = (NSInteger)[defaults integerForKey:@"newTweetKey"];

	if ([defaults objectForKey:@"newTweetKey"] != nil) {
		newTweetKey = defaultsNewTweetKey;
	} else {
		[defaults setInteger:newTweetKey forKey:@"newTweetKey"];
	}
	
	NSInteger defaultsNewTweetModifierKey = (NSInteger)[defaults integerForKey:@"newTweetModifierKey"];
	if ([defaults objectForKey:@"newTweetModifierKey"] != nil) {
		newTweetModifierKey = defaultsNewTweetModifierKey;
	} else {
		[defaults setInteger:newTweetModifierKey forKey:@"newTweetModifierKey"];
	}
	
	[defaults synchronize];
	
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
    [loginActivityIndicator stopAnimation:self];
	[self initWebViews];
    [loginViewWindow performClose:self];
}

- (void)initWebViews {

	NSString *path = [[NSBundle mainBundle] resourcePath];
	NSURL *url = [NSURL fileURLWithPath:path];
	NSString *index_string = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%@/index.html", path] encoding:NSUTF8StringEncoding error:nil];

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

    // FIXME: show timelineView after authentification
}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector {
	return NO;
}

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name {
	return NO;
}

- (void)setString:(NSString *)string forKey:(NSString *)aKey
{
    [self.accessToken setString:string forKey:aKey];
}

- (NSString *)stringForKey:(NSString *)aKey
{
    return [self.accessToken stringForKey:aKey];
}


#pragma mark Notifications

- (IBAction)openNewMessageWindow:(id)sender {
	[NSApp activateIgnoringOtherApps:YES]; 
	[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];	
}

- (void)openNewMessageWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string {
	[NSApp activateIgnoringOtherApps:YES]; 
	NewMessageWindow *newTweet = (NewMessageWindow *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
	[newTweet inReplyTo:userName statusId:statusId withString:string];
}

- (void)openNewMessageWindowWithString:(NSString *)aString {
	[NSApp activateIgnoringOtherApps:YES];
	
	NSRange range = [aString rangeOfString:@"oauthtoken"];
	
	if (range.length > 0) {
        [oauthView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"tentia_oauth.requestAccessToken('%@')", aString]];
	} else {
		NewMessageWindow *newTweet = (NewMessageWindow *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
		[newTweet withString:aString];		
	}
	
}

- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent {
	NSString *text = [[[event paramDescriptorForKeyword:keyDirectObject] stringValue] substringFromIndex:8];
	[self openNewMessageWindowWithString:[text stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
}

- (IBAction)sendTweet:(id)sender {
	TweetModel *tweet = (TweetModel *)[sender object];
    NSString *text = [[tweet.text stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""] stringByReplacingOccurrencesOfString:@"\\" withString:@"\\\\"];
    NSString *func = [NSString stringWithFormat:@"tentia_instance.sendNewMessage(\"%@\", \"%@\", \"%@\")",
                      text,
                      tweet.inReplyTostatusId,
                      tweet.inReplyToEntity];
    [timelineView stringByEvaluatingJavaScriptFromString:func];
}

- (NSString *)pluginURL {
	NSFileManager *fileManager = [NSFileManager defaultManager];
	NSString *pathToPlugin = [@"~/Library/Application Support/Tentia/Plugin.js" stringByExpandingTildeInPath];
	if([fileManager fileExistsAtPath:pathToPlugin]) {
		return [NSString stringWithFormat:@"%@", [NSURL fileURLWithPath:pathToPlugin]];
	}
	return nil;
}

- (void)unreadMentions:(NSInteger)count {
	if (![mentionsViewWindow isVisible] && count > 0) {
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Tentia (^%i)", count]];
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:[NSString stringWithFormat:@"%i", count]];
	} else {
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Tentia"]];
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:nil];
		[mentionsView stringByEvaluatingJavaScriptFromString:@"tentia_instance.unread_mentions = 0;"];
	}
}

- (void)openURL:(NSString *)url {
    [[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:url]];
}

- (void)storeAccessToken:(NSString *)_accessToken secret:(NSString *)secret userId:(NSString *)userId andScreenName:(NSString *)screenName
{
    self.accessToken.accessToken = _accessToken;
    self.accessToken.secret = secret;
    self.accessToken.userId = userId;
    self.accessToken.screenName = screenName;
    
    [timelineViewWindow makeKeyAndOrderFront:self];
    
    [[NSNotificationCenter defaultCenter] postNotificationName:@"authentificationSucceded" object:nil];
}

- (void)loggedIn {
    [timelineViewWindow makeKeyAndOrderFront:self];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"authentificationSucceded" object:nil];
}

- (IBAction)login:(id)sender {
    [loginActivityIndicator startAnimation:self];
    [self initOauth];
}

- (IBAction)logout:(id)sender {
    [timelineViewWindow performClose:self];
    [mentionsViewWindow performClose:self];
    [self.loginViewWindow makeKeyAndOrderFront:self];
    
    [timelineView stringByEvaluatingJavaScriptFromString:@"tentia_instance.logout();"];
    [mentionsView stringByEvaluatingJavaScriptFromString:@"tentia_instance.logout();"];
    
    [accessToken setString:nil forKey:@"app_mac_key"];
    [accessToken setString:nil forKey:@"app_mac_key_id"];
    [accessToken setString:nil forKey:@"app_id"];
    [accessToken setString:nil forKey:@"app_mac_algorithm"];
    [accessToken setString:nil forKey:@"user_access_token"];
    [accessToken setString:nil forKey:@"user_mac_key"];
    [accessToken setString:nil forKey:@"user_mac_algorithm"];
    [accessToken setString:nil forKey:@"user_token_type"];
    [accessToken setString:nil forKey:@"api_root"];
    [accessToken setString:nil forKey:@"entity"];
}

// Mentions window has been visible
- (void)windowDidBecomeKey:(NSNotification *)notification {
	if ([notification object] == mentionsViewWindow) {
		[self unreadMentions:0];		
	}	
}

- (void)getTweetUpdates:(id)sender {
	[timelineView stringByEvaluatingJavaScriptFromString:@"tentia_instance.getNewData(true)"];
	[mentionsView stringByEvaluatingJavaScriptFromString:@"tentia_instance.getNewData(true)"];
}


/* CARBON */

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData)
{
	[[NSNotificationCenter defaultCenter] postNotificationName:@"openNewMessageWindow" object:nil];
	return noErr;
}

@end

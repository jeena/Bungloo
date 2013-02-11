//
//  Controller.m
//  bungloo
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "Controller.h"
#import "NewMessageWindow.h"
#import "PostModel.h"
#import "NSData+Base64.h"

@implementation Controller
@synthesize showProfileTextField;
@synthesize openProfileWindow;
@synthesize loginViewWindow;
@synthesize loginEntityTextField;
@synthesize loginActivityIndicator;
@synthesize timelineView, timelineViewWindow, mentionsView, mentionsViewWindow, conversationView, conversationViewWindow, profileView, profileViewWindow;
@synthesize globalHotkeyMenuItem, viewDelegate;
@synthesize logoLayer;
@synthesize oauthView, accessToken;

- (void)awakeFromNib
{
	[timelineViewWindow setExcludedFromWindowsMenu:YES];
	[mentionsViewWindow setExcludedFromWindowsMenu:YES];
	
	[self initHotKeys];
	
	[GrowlApplicationBridge setGrowlDelegate:self];
	
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
	
	BOOL forceLogin = NO;
	/*
	if (![accessToken stringForKey:@"version-0.6.0-new-login"]) {
		[self logout:self];
		forceLogin = YES;
		[accessToken setString:nil forKey:@"entity"];		
		[accessToken setString:@"yes" forKey:@"version-0.6.0-new-login"];
	}*/
	
	if (forceLogin || ![accessToken stringForKey:@"user_access_token"] || ![accessToken secret]) {
		[timelineViewWindow performClose:self];
		[mentionsViewWindow performClose:self];
		[self.loginViewWindow makeKeyAndOrderFront:self];
		[self initOauth];
	} else {
		[timelineViewWindow makeKeyAndOrderFront:self];
		[self initWebViews];
	}
}

# pragma mark Init



- (void)initOauth
{
	if (!oauthView) {
		NSString *path = [[[NSBundle mainBundle] resourcePath] stringByAppendingString:@"/Webkit/"];
		NSURL *url = [NSURL fileURLWithPath:path];
		NSString *index_string = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%@index.html", path] encoding:NSUTF8StringEncoding error:nil];
		
		oauthView = [[WebView alloc] init];
		viewDelegate.oauthView = oauthView;
		[[oauthView mainFrame] loadHTMLString:index_string baseURL:url];
		[oauthView setFrameLoadDelegate:viewDelegate];
		[oauthView setPolicyDelegate:viewDelegate];
		[oauthView setUIDelegate:viewDelegate];
		[[oauthView windowScriptObject] setValue:self forKey:@"controller"];

	}
}

- (void)initWebViews
{

	if (viewDelegate.timelineView != timelineView)
	{
		[self initOauth];
		
		NSString *path = [[[NSBundle mainBundle] resourcePath] stringByAppendingString:@"/Webkit/"];
		NSURL *url = [NSURL fileURLWithPath:path];
		NSString *index_string = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%@index.html", path] encoding:NSUTF8StringEncoding error:nil];
		
		viewDelegate.timelineView = timelineView;
		[[timelineView mainFrame] loadHTMLString:index_string baseURL:url];
		[timelineView setFrameLoadDelegate:viewDelegate];
		[timelineView setPolicyDelegate:viewDelegate];
		[timelineView setUIDelegate:viewDelegate];
		[[timelineView windowScriptObject] setValue:self forKey:@"controller"];
		//WebPreferences* prefs = [timelineView preferences];
		//[prefs _setLocalStorageDatabasePath:localStoragePath];
		//[prefs setLocalStorageEnabled:YES];
		
		viewDelegate.mentionsView = mentionsView;
		[[mentionsView mainFrame] loadHTMLString:index_string baseURL:url];
		[mentionsView setFrameLoadDelegate:viewDelegate];
		[mentionsView setPolicyDelegate:viewDelegate];
		[mentionsView setUIDelegate:viewDelegate];
		[[mentionsView windowScriptObject] setValue:self forKey:@"controller"];
		//prefs = [mentionsView preferences];
		//[prefs _setLocalStorageDatabasePath:localStoragePath];
		//[prefs setLocalStorageEnabled:YES];
		
		viewDelegate.conversationView = conversationView;
		[[conversationView mainFrame] loadHTMLString:index_string baseURL:url];
		[conversationView setFrameLoadDelegate:viewDelegate];
		[conversationView setPolicyDelegate:viewDelegate];
		[conversationView setUIDelegate:viewDelegate];
		[[conversationView windowScriptObject] setValue:self forKey:@"controller"];
		//prefs = [conversationView preferences];
		//[prefs _setLocalStorageDatabasePath:localStoragePath];
		//[prefs setLocalStorageEnabled:YES];
		
		viewDelegate.profileView = profileView;
		[[profileView mainFrame] loadHTMLString:index_string baseURL:url];
		[profileView setFrameLoadDelegate:viewDelegate];
		[profileView setPolicyDelegate:viewDelegate];
		[profileView setUIDelegate:viewDelegate];
		[[profileView windowScriptObject] setValue:self forKey:@"controller"];
		//prefs = [profileView preferences];
		//[prefs _setLocalStorageDatabasePath:localStoragePath];
		//[prefs setLocalStorageEnabled:YES];

	}
	else
	{
		[timelineView stringByEvaluatingJavaScriptFromString:@"start('timeline')"];
		[mentionsView stringByEvaluatingJavaScriptFromString:@"start('mentions')"];
		[conversationView stringByEvaluatingJavaScriptFromString:@"start('conversation')"];
		[profileView stringByEvaluatingJavaScriptFromString:@"start('profile')"];
	}
}

- (void)initHotKeys
{

	NSInteger newTweetKey = kVK_ANSI_M; // http://boredzo.org/blog/archives/2007-05-22/virtual-key-codes
	NSInteger newTweetModifierKey = controlKey + cmdKey + optionKey; // cmdKey 256, shitfKey 512, optionKey 2048, controlKey 4096 
	
	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
	NSInteger defaultsNewTweetKey = (NSInteger)[defaults integerForKey:@"newTweetKey"];

	if ([defaults objectForKey:@"newTweetKey"] != nil)
	{
		newTweetKey = defaultsNewTweetKey;
	}
	else
	{
		[defaults setInteger:newTweetKey forKey:@"newTweetKey"];
	}
	
	NSInteger defaultsNewTweetModifierKey = (NSInteger)[defaults integerForKey:@"newTweetModifierKey"];
	if ([defaults objectForKey:@"newTweetModifierKey"] != nil)
	{
		newTweetModifierKey = defaultsNewTweetModifierKey;
	}
	else
	{
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

- (void)alertTitle:(NSString *)title withMessage:(NSString *)message
{
	NSAlert *alert = [NSAlert alertWithMessageText:title
									 defaultButton:@"OK" alternateButton:nil otherButton:nil
						 informativeTextWithFormat:@"%@", message];
	[alert runModal];
}

- (void)authentificationSucceded:(id)sender
{
	[loginActivityIndicator stopAnimation:self];
	[self initWebViews];
	[loginViewWindow performClose:self];
}

- (void)authentificationDidNotSucceed:(NSString *)errorMessage
{
	[loginActivityIndicator stopAnimation:self];
	[self alertTitle:@"Authenication error" withMessage:errorMessage];
}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector
{
	return NO;
}

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name
{
	return NO;
}

- (void)setString:(NSString *)string forKey:(NSString *)aKey
{
	[self.accessToken setString:string forKey:aKey];
}

- (void)setSecret:(NSString *)string
{
	[self.accessToken setSecret:string];
}
- (NSString *)secret
{
	return [self.accessToken secret];
}

- (NSString *)stringForKey:(NSString *)aKey
{
	return [self.accessToken stringForKey:aKey];
}


#pragma mark Notifications

-(BOOL)applicationShouldOpenUntitledFile:(NSApplication *)theApplication
{
	return NO;
}

- (BOOL)applicationShouldHandleReopen:(NSApplication *)theApplication hasVisibleWindows:(BOOL)flag
{
	[timelineViewWindow makeKeyAndOrderFront:self];
	return NO;
}

- (IBAction)openNewMessageWindow:(id)sender
{
	[NSApp activateIgnoringOtherApps:YES]; 
	[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];	
}

- (void)openNewMessageWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string isPrivate:(BOOL)isPrivate
{
	[NSApp activateIgnoringOtherApps:YES]; 
	NewMessageWindow *newMessage = (NewMessageWindow *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
	[newMessage inReplyTo:userName statusId:statusId withString:string];
	[newMessage setIsPrivate:isPrivate];
}

- (void)openNewMessageWindowWithString:(NSString *)aString
{
	[NSApp activateIgnoringOtherApps:YES];
	
	NSRange range = [aString rangeOfString:@"oauthtoken"];
	
	if (range.length > 0)
	{
		[oauthView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"bungloo_instance.requestAccessToken('%@')", aString]];
	}
	else
	{
		NewMessageWindow *newTweet = (NewMessageWindow *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
		[newTweet withString:aString];		
	}
}

- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent
{
	NSString *text = [[[event paramDescriptorForKeyword:keyDirectObject] stringValue] substringFromIndex:8];
	[self openNewMessageWindowWithString:[text stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
}

- (IBAction)sendTweet:(id)sender
{
	PostModel *post = (PostModel *)[sender object];
	NSString *text = [[post.text stringByReplacingOccurrencesOfString:@"\\" withString:@"\\\\"] stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
	text = [text stringByReplacingOccurrencesOfString:@"\n" withString:@"\\n"];
	
	NSString *locationObject = @"null";
	if (post.location) {
		locationObject = [NSString stringWithFormat:@"[%f, %f]", post.location.coordinate.latitude, post.location.coordinate.longitude];
	}
	
	NSString *imageFilePath = @"null";
	if (post.imageFilePath) {
		NSError *error;
		NSString *mimeType = [MimeType mimeTypeForFileAtPath:post.imageFilePath error:&error];
		NSData *data = [[NSData alloc] initWithContentsOfFile:post.imageFilePath];
		NSString *base64 = [data base64Encoding_xcd];
		[data release];
		imageFilePath = [NSString stringWithFormat:@"\"data:%@;base64,%@\"", mimeType, base64];
	}
	
	NSString *isPrivate = @"false";
	if (post.isPrivate) {
		isPrivate = @"true";
	}
	
	NSString *func = [NSString stringWithFormat:@"bungloo_instance.sendNewMessage(\"%@\", \"%@\", \"%@\", %@, %@, %@)",
					  text,
					  post.inReplyTostatusId,
					  post.inReplyToEntity,
					  locationObject,
					  imageFilePath,
					  isPrivate];

	[timelineView stringByEvaluatingJavaScriptFromString:func];
}

- (NSString *)pluginURL
{
	NSFileManager *fileManager = [NSFileManager defaultManager];
	NSString *pathToPlugin = [@"~/Library/Application Support/Bungloo/Plugin.js" stringByExpandingTildeInPath];
	
	if([fileManager fileExistsAtPath:pathToPlugin])
	{
		return [NSString stringWithFormat:@"%@", [NSURL fileURLWithPath:pathToPlugin]];
	}
	return nil;
}

- (void)unreadMentions:(int)count
{
	if (![mentionsViewWindow isVisible] && count > 0)
	{
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Bungloo (^%i)", count]];
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:[NSString stringWithFormat:@"%i", count]];
	}
	else
	{
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Bungloo"]];
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:nil];
		[mentionsView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.unread_mentions = 0;"];
	}
}

- (void)notificateUserAboutMention:(NSString *)text fromName:(NSString *)name withPostId:(NSString *)postId andEntity:(NSString *)entity
{
	[GrowlApplicationBridge
		notifyWithTitle:[NSString stringWithFormat:@"Mentioned by %@ on Tent", name]
		description:text
		notificationName:@"Mention"
		iconData:nil
		priority:0
		isSticky:NO
		clickContext:[NSDictionary dictionaryWithObjectsAndKeys:
					  entity, @"entity",
					  postId, @"postId", nil]];
}

- (void)openURL:(NSString *)url
{
	[[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:url]];
}

- (IBAction)showProfile:(id)sender
{
	NSString *entity = [self.showProfileTextField stringValue];
	if ([entity rangeOfString:@"."].location != NSNotFound && ([entity hasPrefix:@"http://"] || [entity hasPrefix:@"https://"])) {
		NSString *func = [NSString stringWithFormat:@"bungloo_instance.showProfileForEntity('%@')", entity];
		[profileView stringByEvaluatingJavaScriptFromString:func];
		[profileViewWindow makeKeyAndOrderFront:self];
		[openProfileWindow performClose:self];
	}
}

- (void)notificateViewsAboutDeletedPostWithId:(NSString *)postId byEntity:(NSString*)entity
{
	NSString *fun = [NSString stringWithFormat:@"bungloo_instance.postDeleted('%@', '%@')", postId, entity];
	[timelineView stringByEvaluatingJavaScriptFromString:fun];
	[mentionsView stringByEvaluatingJavaScriptFromString:fun];
	[conversationView stringByEvaluatingJavaScriptFromString:fun];
	[profileView stringByEvaluatingJavaScriptFromString:fun];
}


/*
- (void)storeAccessToken:(NSString *)_accessToken secret:(NSString *)secret userId:(NSString *)userId andScreenName:(NSString *)screenName
{
	self.accessToken.accessToken = _accessToken;
	self.accessToken.secret = secret;
	self.accessToken.userId = userId;
	self.accessToken.screenName = screenName;
	[timelineViewWindow makeKeyAndOrderFront:self];
	
	[[NSNotificationCenter defaultCenter] postNotificationName:@"authentificationSucceded" object:nil];
}*/

- (void)loggedIn
{
	[loginActivityIndicator stopAnimation:self];
	[self initWebViews];
	[loginViewWindow performClose:self];
	[timelineViewWindow makeKeyAndOrderFront:self];
}

- (IBAction)login:(id)sender
{
	if ([[loginEntityTextField stringValue] length] > 0) {
		[[loginEntityTextField window] makeFirstResponder:nil];
		[loginActivityIndicator startAnimation:self];
		[oauthView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.authenticate();"];
	}
}

- (IBAction)logout:(id)sender
{
	[oauthView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.logout();"];
	
	[timelineViewWindow performClose:self];
	[mentionsViewWindow performClose:self];
	[conversationViewWindow performClose:self];
	[profileViewWindow performClose:self];
	[self.loginViewWindow makeKeyAndOrderFront:self];
	
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.logout();"];
	[mentionsView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.logout();"];
}

// Mentions window has been visible
- (void)windowDidBecomeKey:(NSNotification *)notification
{
	if ([notification object] == mentionsViewWindow)
	{
		//[self unreadMentions:0];
		[mentionsView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.setAllMentionsRead();"];
	}	
}

- (void)getTweetUpdates:(id)sender
{
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.getNewData(true)"];
	[mentionsView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.getNewData(true)"];
}

- (IBAction)showConversationForPostId:(NSString *)postId andEntity:(NSString *)entity
{
	NSString *js = [NSString stringWithFormat:@"bungloo_instance.showStatus('%@', '%@');", postId, entity];
	[conversationView stringByEvaluatingJavaScriptFromString:js];
	[conversationViewWindow makeKeyAndOrderFront:self];
	[[NSApplication sharedApplication] activateIgnoringOtherApps:YES];
}

- (IBAction)clearCache:(id)sender
{
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.cache.clear()"];
}

- (IBAction)showProfileForEntity:(NSString *)entity
{
	NSString *js = [NSString stringWithFormat:@"bungloo_instance.showProfileForEntity('%@');", entity];
	[profileView stringByEvaluatingJavaScriptFromString:js];
	[profileViewWindow makeKeyAndOrderFront:self];
}

- (void)growlNotificationWasClicked:(id)clickContext
{
	NSDictionary *userInfo = (NSDictionary *)clickContext;
	NSString *postId = [userInfo objectForKey:@"postId"];
	NSString *entity = [userInfo objectForKey:@"entity"];
	
	[self showConversationForPostId:postId andEntity:entity];
	
	NSString *js = [NSString stringWithFormat:@"bungloo_instance.mentionRead('%@', '%@');", postId, entity];
	[mentionsView stringByEvaluatingJavaScriptFromString:js];
}

- (NSString *) applicationNameForGrowl
{
	return @"Bungloo";
}

/* CARBON */

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData)
{
	[[NSNotificationCenter defaultCenter] postNotificationName:@"openNewMessageWindow" object:nil];
	return noErr;
}

@end

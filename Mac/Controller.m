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
@synthesize timelineView, timelineViewWindow;
@synthesize globalHotkeyMenuItem, viewDelegate;
@synthesize logoLayer;
@synthesize oauthView, accessToken;

- (void)awakeFromNib
{
	[timelineViewWindow setExcludedFromWindowsMenu:YES];

	[self initHotKeys];

	[GrowlApplicationBridge setGrowlDelegate:self];

	NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
	[nc addObserver:self
		   selector:@selector(openNewMessageWindow:)
			   name:@"openNewMessageWindow"
			 object:nil];
	[nc addObserver:self
		   selector:@selector(sendPost:)
			   name:@"sendPost"
			 object:nil];
	[nc addObserver:self
		   selector:@selector(authentificationSucceded:)
			   name:@"authentificationSucceded"
			 object:nil];
	[nc addObserver:self
		   selector:@selector(getPostUpdates:)
			   name:@"getPostUpdates"
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
		[self.loginViewWindow makeKeyAndOrderFront:self];
		[self initOauth];
	} else {
		[timelineViewWindow makeKeyAndOrderFront:self];
		[self initWebViews];
	}
}

# pragma mark Init

- (void)stringFromFile:(NSString *)file url: (NSURL **) url content: (NSString **) content
{
    NSString *path = [[[NSBundle mainBundle] resourcePath] stringByAppendingFormat: @"/WebKit/%@", file];
    *url = [NSURL fileURLWithPath: path];
    *content = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
}

- (void)initOauth
{
	if (!oauthView) {
        NSString *index_string;
        NSURL *url;
        
        [self stringFromFile: @"index.html" url: &url content: &index_string];

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
        NSString *index_string;
   		NSURL *url;

		[self initOauth];
        
        [self stringFromFile: @"index.html" url: &url content: &index_string];

		viewDelegate.timelineView = timelineView;
		[[timelineView mainFrame] loadHTMLString:index_string baseURL:url];
		[timelineView setFrameLoadDelegate:viewDelegate];
		[timelineView setPolicyDelegate:viewDelegate];
		[timelineView setUIDelegate:viewDelegate];
		[[timelineView windowScriptObject] setValue:self forKey:@"controller"];

	}
	else
	{
		[timelineView stringByEvaluatingJavaScriptFromString:@"start('timeline')"];
	}
}

- (void)initHotKeys
{

	NSInteger newPostKey = kVK_ANSI_M; // http://boredzo.org/blog/archives/2007-05-22/virtual-key-codes
	NSInteger newPostModifierKey = controlKey + cmdKey + optionKey; // cmdKey 256, shitfKey 512, optionKey 2048, controlKey 4096

	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
	NSInteger defaultsNewPostKey = (NSInteger)[defaults integerForKey:@"newPostKey"];

	if ([defaults objectForKey:@"newPostKey"] != nil)
	{
		newPostKey = defaultsNewPostKey;
	}
	else
	{
		[defaults setInteger:newPostKey forKey:@"newPostKey"];
	}

	NSInteger defaultsNewPostModifierKey = (NSInteger)[defaults integerForKey:@"newPostModifierKey"];
	if ([defaults objectForKey:@"newPostModifierKey"] != nil)
	{
		newPostModifierKey = defaultsNewPostModifierKey;
	}
	else
	{
		[defaults setInteger:newPostModifierKey forKey:@"newPostModifierKey"];
	}

	[defaults synchronize];

	NSUInteger cocoaModifiers = 0;
	if (newPostModifierKey & shiftKey) cocoaModifiers = cocoaModifiers | NSShiftKeyMask;
	if (newPostModifierKey & optionKey) cocoaModifiers = cocoaModifiers | NSAlternateKeyMask;
	if (newPostModifierKey & controlKey) cocoaModifiers = cocoaModifiers | NSControlKeyMask;
	if (newPostModifierKey & cmdKey) cocoaModifiers = cocoaModifiers | NSCommandKeyMask;

	[globalHotkeyMenuItem setKeyEquivalent:[Constants stringFromVirtualKeyCode:newPostKey]];
	[globalHotkeyMenuItem setKeyEquivalentModifierMask:cocoaModifiers];

	/* CARBON from http://github.com/Xjs/drama-button/blob/carbon/Drama_ButtonAppDelegate.m */

	EventTypeSpec eventType;
	eventType.eventClass = kEventClassKeyboard;
	eventType.eventKind  = kEventHotKeyPressed;

	InstallApplicationEventHandler(&handler, 1, &eventType, NULL, NULL);

	EventHotKeyID g_HotKeyID;
	g_HotKeyID.id = 1;

	EventHotKeyRef g_HotKeyRef;

	RegisterEventHotKey(newPostKey, newPostModifierKey, g_HotKeyID, GetApplicationEventTarget(), 0, &g_HotKeyRef);

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
		[oauthView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"bungloo.oauth.requestAccessToken('%@')", aString]];
	}
	else
	{
		NewMessageWindow *newPost = (NewMessageWindow *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
		[newPost withString:aString];
	}
}

- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event withReplyEvent:(NSAppleEventDescriptor *)replyEvent
{
	NSString *text = [[[event paramDescriptorForKeyword:keyDirectObject] stringValue] substringFromIndex:8];
	[self openNewMessageWindowWithString:[text stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
}

- (IBAction)sendPost:(id)sender
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

	NSString *func = [NSString stringWithFormat:@"bungloo.timeline.sendNewMessage(\"%@\", \"%@\", \"%@\", %@, %@, %@)",
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
	if (count > 0)
	{
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:[NSString stringWithFormat:@"%i", count]];
	}
	else
	{
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:nil];
	}
    
    NSString *script = [NSString stringWithFormat:@"bungloo.sidebar.setUnreadMentions(%i);", count];
    [timelineView stringByEvaluatingJavaScriptFromString:script];
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

- (IBAction)showTimeline:(id)sender
{
    [timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.sidebar.onTimeline();"];
}

- (IBAction)showMentions:(id)sender
{
    [timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.sidebar.onMentions();"];
}

- (IBAction)showConversation:(id)sender
{
    [timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.sidebar.onConversation();"];
}

- (IBAction)showProfile:(id)sender
{
    if ([sender isKindOfClass:[NSMenuItem class]]) {
        [timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.sidebar.onEntityProfile();"];
    } else {
        NSString *entity = [self.showProfileTextField stringValue];
        if ([entity rangeOfString:@"."].location != NSNotFound && ([entity hasPrefix:@"http://"] || [entity hasPrefix:@"https://"])) {
            NSString *func = [NSString stringWithFormat:@"bungloo.sidebar.onEntityProfile(); bungloo.entityProfile.showProfileForEntity('%@')", entity];
            [timelineView stringByEvaluatingJavaScriptFromString:func];
        }
    }
}

- (IBAction)showSearch:(id)sender
{
    [timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.sidebar.onSearch();"];
}

- (IBAction)showAbout:(id)sender
{
    [self openURL:@"http://jabs.nu/bungloo"];
}

- (IBAction)showNext:(id)sender
{
    [timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.sidebar.setContentForNext();"];
}

- (void)notificateViewsAboutDeletedPostWithId:(NSString *)postId byEntity:(NSString*)entity
{
    NSString *f = [NSString stringWithFormat:@".postDeleted('%@', '%@');", postId, entity];
	NSMutableString *fun = [NSMutableString stringWithFormat:@"bungloo.timeline%@", f];
    [fun appendFormat:@"bungloo.mentions%@", f];
    [fun appendFormat:@"bungloo.conversation%@", f];
    [fun appendFormat:@"bungloo.entityProfile%@", f];
	[timelineView stringByEvaluatingJavaScriptFromString:fun];
}

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
		[oauthView stringByEvaluatingJavaScriptFromString:@"bungloo.oauth.authenticate();"];
	}
}

- (IBAction)logout:(id)sender
{
	[oauthView stringByEvaluatingJavaScriptFromString:@"bungloo.oauth.logout();"];

	[timelineViewWindow performClose:self];
	[self.loginViewWindow makeKeyAndOrderFront:self];

	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.sidebar.logout();"];
}

// Mentions window has been visible
- (void)windowDidBecomeKey:(NSNotification *)notification
{

}

- (void)getPostUpdates:(id)sender
{
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.timeline.getNewData(true)"];
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.mentions.getNewData(true)"];
}

- (IBAction)showConversationForPostId:(NSString *)postId andEntity:(NSString *)entity
{
	NSString *js = [NSString stringWithFormat:@"bungloo.sidebar.onConversation(); bungloo.conversation.showStatus('%@', '%@');", postId, entity];
	[timelineView stringByEvaluatingJavaScriptFromString:js];
}

- (IBAction)clearCache:(id)sender
{
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.timeline.cache.clear()"];
}

- (IBAction)showProfileForEntity:(NSString *)entity
{
	NSString *js = [NSString stringWithFormat:@"bungloo.sidebar.onEntityProfile(); bungloo.entityProfile.showProfileForEntity('%@');", entity];
	[timelineView stringByEvaluatingJavaScriptFromString:js];
}

- (void)growlNotificationWasClicked:(id)clickContext
{
	NSDictionary *userInfo = (NSDictionary *)clickContext;
	NSString *postId = [userInfo objectForKey:@"postId"];
	NSString *entity = [userInfo objectForKey:@"entity"];

	[self showConversationForPostId:postId andEntity:entity];

	NSString *js = [NSString stringWithFormat:@"bungloo.sidebar.onMentions(); bungloo.mentions.mentionRead('%@', '%@');", postId, entity];
	[timelineView stringByEvaluatingJavaScriptFromString:js];
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

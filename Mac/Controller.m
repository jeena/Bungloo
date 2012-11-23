//
//  Controller.m
//  Tentia
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "Controller.h"
#import "NewMessageWindow.h"
#import "PostModel.h"
#import "NSData+Base64.h"

@implementation Controller
@synthesize loginViewWindow;
@synthesize loginEntityTextField;
@synthesize loginActivityIndicator;

@synthesize timelineView, timelineViewWindow, mentionsView, mentionsViewWindow, conversationView, conversationViewWindow;
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

    //[accessToken setString:nil forKey:@"user_access_token"];
    if (![accessToken stringForKey:@"version-0.2.0-new-login"]) {
        [self logout:self];
        [accessToken setString:@"yes" forKey:@"version-0.2.0-new-login"];
    }
    
    if (![accessToken stringForKey:@"user_access_token"]) {
        [timelineViewWindow performClose:self];
        [mentionsViewWindow performClose:self];
        [self.loginViewWindow makeKeyAndOrderFront:self];
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
        //[oauthView stringByEvaluatingJavaScriptFromString:@"function HostAppGo() { start('oauth'); };"];

    } else {
        [oauthView stringByEvaluatingJavaScriptFromString:@"start('oauth');"];
    }
}

- (void)initWebViews
{

    if (YES) //viewDelegate.timelineView != timelineView)
    {
        NSString *path = [[[NSBundle mainBundle] resourcePath] stringByAppendingString:@"/Webkit/"];
        NSURL *url = [NSURL fileURLWithPath:path];
        NSString *index_string = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%@index.html", path] encoding:NSUTF8StringEncoding error:nil];
        
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
        
        
        viewDelegate.conversationView = conversationView;
        [[conversationView mainFrame] loadHTMLString:index_string baseURL:url];
        [conversationView setFrameLoadDelegate:viewDelegate];
        [conversationView setPolicyDelegate:viewDelegate];
        [conversationView setUIDelegate:viewDelegate];
        [[conversationView windowScriptObject] setValue:self forKey:@"controller"];
    }
    else
    {
        [timelineView stringByEvaluatingJavaScriptFromString:@"start('timeline')"];
        [mentionsView stringByEvaluatingJavaScriptFromString:@"start('mentions')"];
        [conversationView stringByEvaluatingJavaScriptFromString:@"start('conversation')"];
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

- (NSString *)stringForKey:(NSString *)aKey
{
    return [self.accessToken stringForKey:aKey];
}


#pragma mark Notifications

-(BOOL)applicationShouldOpenUntitledFile:(NSApplication *)theApplication
{
    return NO;
}

- (IBAction)openNewMessageWindow:(id)sender
{
	[NSApp activateIgnoringOtherApps:YES]; 
	[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];	
}

- (void)openNewMessageWindowInReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string
{
	[NSApp activateIgnoringOtherApps:YES]; 
	NewMessageWindow *newTweet = (NewMessageWindow *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
	[newTweet inReplyTo:userName statusId:statusId withString:string];
}

- (void)openNewMessageWindowWithString:(NSString *)aString
{
	[NSApp activateIgnoringOtherApps:YES];
	
	NSRange range = [aString rangeOfString:@"oauthtoken"];
	
	if (range.length > 0)
    {
        [oauthView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"tentia_instance.requestAccessToken('%@')", aString]];
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
    
    NSString *func = [NSString stringWithFormat:@"tentia_instance.sendNewMessage(\"%@\", \"%@\", \"%@\", %@, %@)",
                      text,
                      post.inReplyTostatusId,
                      post.inReplyToEntity,
                      locationObject,
                      imageFilePath];

    [timelineView stringByEvaluatingJavaScriptFromString:func];
}

- (NSString *)pluginURL
{
	NSFileManager *fileManager = [NSFileManager defaultManager];
	NSString *pathToPlugin = [@"~/Library/Application Support/Tentia/Plugin.js" stringByExpandingTildeInPath];
	
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
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Tentia (^%i)", count]];
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:[NSString stringWithFormat:@"%i", count]];
	}
    else
    {
		[timelineViewWindow setTitle:[NSString stringWithFormat:@"Tentia"]];
		[[[NSApplication sharedApplication] dockTile] setBadgeLabel:nil];
		[mentionsView stringByEvaluatingJavaScriptFromString:@"tentia_instance.unread_mentions = 0;"];
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

- (void)storeAccessToken:(NSString *)_accessToken secret:(NSString *)secret userId:(NSString *)userId andScreenName:(NSString *)screenName
{
    self.accessToken.accessToken = _accessToken;
    self.accessToken.secret = secret;
    self.accessToken.userId = userId;
    self.accessToken.screenName = screenName;
    
    [timelineViewWindow makeKeyAndOrderFront:self];
    
    [[NSNotificationCenter defaultCenter] postNotificationName:@"authentificationSucceded" object:nil];
}

- (void)loggedIn
{
    [timelineViewWindow makeKeyAndOrderFront:self];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"authentificationSucceded" object:nil];
}

- (IBAction)login:(id)sender
{
    if ([[loginEntityTextField stringValue] length] > 0) {
        [[loginEntityTextField window] makeFirstResponder:nil];
        [loginActivityIndicator startAnimation:self];
        [self initOauth];
    }
}

- (IBAction)logout:(id)sender
{
    [timelineViewWindow performClose:self];
    [mentionsViewWindow performClose:self];
    [self.loginViewWindow makeKeyAndOrderFront:self];
    
    [timelineView stringByEvaluatingJavaScriptFromString:@"tentia_instance.logout();"];
    [mentionsView stringByEvaluatingJavaScriptFromString:@"tentia_instance.logout();"];
    if (oauthView) {
        [oauthView stringByEvaluatingJavaScriptFromString:@"tentia_instance.logout();"];
    }
    
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
- (void)windowDidBecomeKey:(NSNotification *)notification
{
	if ([notification object] == mentionsViewWindow)
    {
		[self unreadMentions:0];		
	}	
}

- (void)getTweetUpdates:(id)sender
{
	[timelineView stringByEvaluatingJavaScriptFromString:@"tentia_instance.getNewData(true)"];
	[mentionsView stringByEvaluatingJavaScriptFromString:@"tentia_instance.getNewData(true)"];
}

- (IBAction)showConversationForPostId:(NSString *)postId andEntity:(NSString *)entity
{
    NSString *js = [NSString stringWithFormat:@"tentia_instance.showStatus('%@', '%@');", postId, entity];
    [conversationView stringByEvaluatingJavaScriptFromString:js];
    [conversationViewWindow makeKeyAndOrderFront:self];
}

- (void)growlNotificationWasClicked:(id)clickContext
{
    NSDictionary *userInfo = (NSDictionary *)clickContext;
    NSString *postId = [userInfo objectForKey:@"postId"];
    NSString *entity = [userInfo objectForKey:@"entity"];
    
    [self showConversationForPostId:postId andEntity:entity];
    
    NSString *js = [NSString stringWithFormat:@"tentia_instance.mentionRead('%@', '%@');", postId, entity];
    [mentionsView stringByEvaluatingJavaScriptFromString:js];
}

- (NSString *) applicationNameForGrowl
{
    return @"Tentia";
}

/* CARBON */

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData)
{
	[[NSNotificationCenter defaultCenter] postNotificationName:@"openNewMessageWindow" object:nil];
	return noErr;
}

@end

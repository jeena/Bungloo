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

@synthesize webView, viewDelegate;

- (void)awakeFromNib {
	[self initWebView];

	
	/* CARBON from http://github.com/Xjs/drama-button/blob/carbon/Drama_ButtonAppDelegate.m */
	
	EventTypeSpec eventType;
	eventType.eventClass = kEventClassKeyboard;
	eventType.eventKind  = kEventHotKeyPressed;
	
	InstallApplicationEventHandler(&handler, 1, &eventType, NULL, NULL);
	
	EventHotKeyID g_HotKeyID;
	g_HotKeyID.id = 1;
	
	EventHotKeyRef g_HotKeyRef;
	
	RegisterEventHotKey(17, controlKey + cmdKey + optionKey, g_HotKeyID, GetApplicationEventTarget(), 0, &g_HotKeyRef);
	
	/* end CARBON */
	
	NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
	[nc addObserver:self 
		   selector:@selector(openNewTweetWindow:) 
			   name:@"openNewTweetWindow"
			 object:nil];
	[nc addObserver:self 
		   selector:@selector(sendTweet:) 
			   name:@"sendTweet"
			 object:nil];
}

- (void)initWebView {
	NSString *path = [[NSBundle mainBundle] resourcePath];
	NSURL *url = [NSURL fileURLWithPath:path];
	NSString *index_string = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%@/index.html", path] encoding:NSUTF8StringEncoding error:nil];
	[[webView mainFrame] loadHTMLString:index_string baseURL:url];
	
	viewDelegate = [[ViewDelegate alloc] initWithWebView:webView];
	[webView setFrameLoadDelegate:viewDelegate];
	[webView setPolicyDelegate:viewDelegate];
	[webView setUIDelegate:viewDelegate];
	
    [[webView windowScriptObject] setValue:self forKey:@"controller"];
}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector {
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

- (IBAction)sendTweet:(id)sender {
	
	NSString *encodedString = [[[sender object] objectAtIndex:0] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	
	[webView stringByEvaluatingJavaScriptFromString:
	 [NSString stringWithFormat:@"twittia_instance.sendNewTweet(\"%@\", \"%@\")",
	  [encodedString stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""],
	  [[sender object] objectAtIndex:1]
	  ]];
}

/* CARBON */

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData)
{
	[[NSNotificationCenter defaultCenter] postNotificationName:@"openNewTweetWindow" object:nil];
	return noErr;
}

@end

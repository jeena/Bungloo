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

@synthesize timelineView, timelineViewWindow, mentionsView, mentionsViewWindow, globalHotkeyMenuItem, viewDelegate;

- (void)awakeFromNib {
	[self initWebViews];
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

	NSAppleEventManager *appleEventManager = [NSAppleEventManager sharedAppleEventManager];
	[appleEventManager setEventHandler:self
						   andSelector:@selector(handleGetURLEvent:withReplyEvent:)
						 forEventClass:kInternetEventClass
							andEventID:kAEGetURL];
}

- (void)initHotKeys {

	NSInteger newTweetKey = kVK_ANSI_T; // HIToolbox/Events.h
	NSInteger newTweetModifierKey = controlKey + cmdKey + optionKey; // controlKey 4096, cmdKey 256, optionKey 2048
	
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

	NSLog(@"%i", NSShiftKeyMask);
	NSInteger theNumber = cocoaModifiers;
	NSMutableString *str = [NSMutableString string];
	NSInteger numberCopy = theNumber; // so you won't change your original value
	for(NSInteger i = 0; i < 32 ; i++) {
		// Prepend "0" or "1", depending on the bit
		[str insertString:((numberCopy & 1) ? @"1" : @"0") atIndex:0];
		numberCopy >>= 1;
	}
	
	// NSLog(@"Binary version: %@", str);
	
	NSLog(@"%c", kVK_ANSI_T);
	
	[globalHotkeyMenuItem setKeyEquivalent:[Controller stringFromVirtualKeyCode:newTweetKey]];
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
	MyDocument *newTweet = (MyDocument *)[[NSDocumentController sharedDocumentController] openUntitledDocumentAndDisplay:YES error:nil];
	[newTweet withString:aString];
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

+ (NSString *)stringFromVirtualKeyCode:(NSInteger)code {
	NSString *string;
	switch (code) {
		case kVK_ANSI_A:
			string = @"A";
			break;
		case kVK_ANSI_S:
			string = @"S";
			break;
		case kVK_ANSI_D:
			string = @"D";
			break;
		case kVK_ANSI_F:
			string = @"F";
			break;
		case kVK_ANSI_H:
			string = @"H";
			break;
		case kVK_ANSI_G:
			string = @"G";
			break;
		case kVK_ANSI_Z:
			string = @"Z";
			break;
		case kVK_ANSI_X:
			string = @"X";
			break;
		case kVK_ANSI_C:
			string = @"C";
			break;
		case kVK_ANSI_V:
			string = @"V";
			break;
		case kVK_ANSI_B:
			string = @"B";
			break;
		case kVK_ANSI_Q:
			string = @"Q";
			break;
		case kVK_ANSI_W:
			string = @"W";
			break;
		case kVK_ANSI_E:
			string = @"E";
			break;
		case kVK_ANSI_R:
			string = @"R";
			break;
		case kVK_ANSI_Y:
			string = @"Y";
			break;
		case kVK_ANSI_T:
			string = @"T";
			break;
		case kVK_ANSI_1:
			string = @"1";
			break;
		case kVK_ANSI_2:
			string = @"2";
			break;
		case kVK_ANSI_3:
			string = @"3";
			break;
		case kVK_ANSI_4:
			string = @"4";
			break;
		case kVK_ANSI_6:
			string = @"6";
			break;
		case kVK_ANSI_5:
			string = @"5";
			break;
		case kVK_ANSI_Equal:
			string = @"=";
			break;
		case kVK_ANSI_9:
			string = @"9";
			break;
		case kVK_ANSI_7:
			string = @"7";
			break;
		case kVK_ANSI_Minus:
			string = @"-";
			break;
		case kVK_ANSI_8:
			string = @"8";
			break;
		case kVK_ANSI_0:
			string = @"0";
			break;
		case kVK_ANSI_RightBracket:
			string = @")";
			break;
		case kVK_ANSI_O:
			string = @"0";
			break;
		case kVK_ANSI_U:
			string = @"U";
			break;
		case kVK_ANSI_LeftBracket:
			string = @"(";
			break;
		case kVK_ANSI_I:
			string = @"I";
			break;
		case kVK_ANSI_P:
			string = @"P";
			break;
		case kVK_ANSI_L:
			string = @"L";
			break;
		case kVK_ANSI_J:
			string = @"J";
			break;
		case kVK_ANSI_Quote:
			string = @"\"";
			break;
		case kVK_ANSI_K:
			string = @"K";
			break;
		case kVK_ANSI_Semicolon:
			string = @";";
			break;
		case kVK_ANSI_Backslash:
			string = @"\\";
			break;
		case kVK_ANSI_Comma:
			string = @",";
			break;
		case kVK_ANSI_Slash:
			string = @"/";
			break;
		case kVK_ANSI_N:
			string = @"N";
			break;
		case kVK_ANSI_M:
			string = @"M";
			break;
		case kVK_ANSI_Period:
			string = @".";
			break;
		case kVK_ANSI_Grave:
			string = @"`";
			break;
		case kVK_ANSI_KeypadDecimal:
			string = @".";
			break;
		case kVK_ANSI_KeypadMultiply:
			string = @"*";
			break;
		case kVK_ANSI_KeypadPlus:
			string = @"+";
			break;
		case kVK_ANSI_KeypadClear:
			string = @"";
			break;
		case kVK_ANSI_KeypadDivide:
			string = @"/";
			break;
		case kVK_ANSI_KeypadEnter:
			string = @"⎆";
			break;
		case kVK_ANSI_KeypadMinus:
			string = @"-";
			break;
		case kVK_ANSI_KeypadEquals:
			string = @"=";
			break;
		case kVK_ANSI_Keypad0:
			string = @"0";
			break;
		case kVK_ANSI_Keypad1:
			string = @"1";
			break;
		case kVK_ANSI_Keypad2:
			string = @"2";
			break;
		case kVK_ANSI_Keypad3:
			string = @"3";
			break;
		case kVK_ANSI_Keypad4:
			string = @"4";
			break;
		case kVK_ANSI_Keypad5:
			string = @"5";
			break;
		case kVK_ANSI_Keypad6:
			string = @"6";
			break;
		case kVK_ANSI_Keypad7:
			string = @"7";
			break;
		case kVK_ANSI_Keypad8:
			string = @"8";
			break;
		case kVK_ANSI_Keypad9:
			string = @"9";
			break;
		default:
			break;
	}
	
	return string;
}


/* CARBON */

OSStatus handler(EventHandlerCallRef nextHandler, EventRef theEvent, void* userData)
{
	[[NSNotificationCenter defaultCenter] postNotificationName:@"openNewTweetWindow" object:nil];
	return noErr;
}

@end

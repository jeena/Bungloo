//
//  ViewDelegate.m
//  bungloo
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "ViewDelegate.h"


@implementation ViewDelegate

@synthesize timelineView, mentionsView, conversationView, profileView, oauthView;

- (void)webView:(WebView *)sender addMessageToConsole:(NSDictionary *)message;{

	if (![message isKindOfClass:[NSDictionary class]]) return;
	
	NSString *viewName = @"TimelineView";
	if (sender == mentionsView) viewName = @"MentionsView";
	if (sender == conversationView) viewName = @"ConversationView";
	if (sender == oauthView) viewName = @"OauthView";
	if (sender == profileView) viewName = @"ProfileView";
	
	NSLog(@"js<%@>: %@:%@: %@",
		viewName,
		[[message objectForKey:@"sourceURL"] lastPathComponent],
		[message objectForKey:@"lineNumber"],
		[message objectForKey:@"message"]
	);
}

- (void)webView:(WebView *)sender runJavaScriptAlertPanelWithMessage:(NSString *)message initiatedByFrame:(WebFrame *)frame {
	NSString *viewName = @"TimelineView";
	if (sender == mentionsView) viewName = @"MentionsView";
	if (sender == conversationView) viewName = @"ConversationView";
	if (sender == oauthView) viewName = @"OauthView";

	NSLog(@"jsa<%@>: %@", viewName, message);
}

- (BOOL)webView:(WebView *)sender runJavaScriptConfirmPanelWithMessage:(NSString *)message initiatedByFrame:(WebFrame *)frame {
	NSInteger result = NSRunCriticalAlertPanel(NSLocalizedString(@"Bungloo", @""),   // title
										message,									 // message
										NSLocalizedString(@"OK", @""),				 // default button
										NSLocalizedString(@"Cancel", @""),			 // alt button
										nil);
	return NSAlertDefaultReturn == result;  
	return NO;
}

- (void)webView:(WebView *)sender decidePolicyForNavigationAction:(NSDictionary *)actionInformation request:(NSURLRequest *)request frame:(WebFrame *)frame decisionListener:(id <WebPolicyDecisionListener>)listener {
	[listener ignore];
	[[NSWorkspace sharedWorkspace] openURL:[request URL]];
}

- (void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame {
	
	NSFileManager *fileManager = [NSFileManager defaultManager];
	NSString *pathToJsPlugin = [@"~/Library/Application Support/bungloo/Plugin.js" stringByExpandingTildeInPath];
	NSString *pathToCssPlugin = [@"~/Library/Application Support/bungloo/Plugin.css" stringByExpandingTildeInPath];
	
	if([fileManager fileExistsAtPath:pathToCssPlugin])
	{
		[sender stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"setTimeout(function() { loadCssPlugin('file://localhost%@') }, 1000);", pathToCssPlugin]];
	}
	
	if([fileManager fileExistsAtPath:pathToJsPlugin])
	{
		[sender stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"setTimeout(function() { loadJsPlugin('file://localhost%@') }, 1000);", pathToJsPlugin]];
	}
	
	[sender stringByEvaluatingJavaScriptFromString:@"var OS_TYPE = 'mac';"];

	if (sender == oauthView) {
		
		[oauthView stringByEvaluatingJavaScriptFromString:@"function HostAppGo() { start('oauth') }"];

	} else if(sender == conversationView) {
	
		[conversationView stringByEvaluatingJavaScriptFromString:@"function HostAppGo() { start('conversation') }"];
		
	} else if(sender == profileView) {
		
		[profileView stringByEvaluatingJavaScriptFromString:@"function HostAppGo() { start('profile') }"];
		
	} else {
		
		NSString *action = @"timeline";
		NSString *delay = @"1";
		
		if (sender == mentionsView) {
			action = @"mentions";
			delay = @"1000";
		}
		
		[sender stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"function HostAppGo() { start('%@') }", action]];
	}
}

- (NSArray *)webView:(WebView *)sender contextMenuItemsForElement:(NSDictionary *)element defaultMenuItems:(NSArray *)defaultMenuItems
{
	// FIXME
	/*
	NSMutableArray *menuItems = [NSMutableArray arrayWithArray:defaultMenuItems];
	
	for (NSMenuItem*item in defaultMenuItems) {
		if ([[item title] isEqualToString:@"Reload"]) {
			//[item setAction:@selector(reload:)];
			//[item setTarget:self];
		} else {
			[menuItems addObject:item];
		}
	}*/
	
	return defaultMenuItems;
}

- (void)reload:(id)sender {
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.getNewData();"];
	[mentionsView stringByEvaluatingJavaScriptFromString:@"bungloo_instance.getNewData();"];
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

@end

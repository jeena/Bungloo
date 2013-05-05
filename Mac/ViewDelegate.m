//
//  ViewDelegate.m
//  bungloo
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "ViewDelegate.h"


@implementation ViewDelegate

@synthesize timelineView, oauthView, conversationViews;

- (id)init
{
    self = [super init];
    if (self) {
        self.conversationViews = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)webView:(WebView *)sender addMessageToConsole:(NSDictionary *)message {

	if (![message isKindOfClass:[NSDictionary class]]) return;

	NSString *viewName = @"TimelineView";
	if (sender == oauthView) viewName = @"OauthView";
    else if(sender != timelineView) viewName = @"ConversationView";
    
	NSLog(@"js<%@>: %@:%@: %@",
		viewName,
		[[message objectForKey:@"sourceURL"] lastPathComponent],
		[message objectForKey:@"lineNumber"],
		[message objectForKey:@"message"]
	);
}

- (void)webView:(WebView *)sender runJavaScriptAlertPanelWithMessage:(NSString *)message initiatedByFrame:(WebFrame *)frame {
	NSString *viewName = @"TimelineView";
	if (sender == oauthView) viewName = @"OauthView";
    else if (sender != timelineView) viewName = @"ConversationView";

	NSLog(@"jsa<%@>: %@", viewName, message);
}

- (BOOL)webView:(WebView *)sender runJavaScriptConfirmPanelWithMessage:(NSString *)message initiatedByFrame:(WebFrame *)frame {
	NSInteger result = NSRunCriticalAlertPanel(NSLocalizedString(@"Bungloo", @""),   // title
											   message,								 // message
											   NSLocalizedString(@"OK", @""),		 // default button
											   NSLocalizedString(@"Cancel", @""),	 // alt button
											   nil);
	return NSAlertDefaultReturn == result;
	return NO;
}

- (void)webView:(WebView *)sender decidePolicyForNavigationAction:(NSDictionary *)actionInformation request:(NSURLRequest *)request frame:(WebFrame *)frame decisionListener:(id <WebPolicyDecisionListener>)listener {
    
    NSArray *frames = [NSArray arrayWithObjects:timelineView.mainFrame, oauthView.mainFrame, nil];

    // If it is clicked from one of the views the open default browser
    if ([frames indexOfObject:frame] != NSNotFound) {
        [listener ignore];
        [[NSWorkspace sharedWorkspace] openURL:[request URL]];
    } else { // otherwies load the iframe stuff like YouTube or vimeo
        [listener use];
    }
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

    } else if([conversationViews containsObject:sender]) {
        
        [sender stringByEvaluatingJavaScriptFromString:@"function HostAppGo() { start('conversation-standalone', function() { bungloo.conversation.showStatusFromController(); }) }"];
        
	} else {

		[sender stringByEvaluatingJavaScriptFromString:@"function HostAppGo() { start('timeline') }"];
	}
}

- (NSArray *)webView:(WebView *)sender contextMenuItemsForElement:(NSDictionary *)element defaultMenuItems:(NSArray *)defaultMenuItems
{
	//remove reload menu item
    NSMutableArray *menuItems = [NSMutableArray arrayWithArray:defaultMenuItems];
	for (NSMenuItem* item in defaultMenuItems) {
		if ([item tag] == WebMenuItemTagReload) {
			[menuItems removeObject:item];
            break;
		}
	}

	return menuItems;
}

- (void)reload:(id)sender {
	[timelineView stringByEvaluatingJavaScriptFromString:@"bungloo.timeline.getNewData();"];
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

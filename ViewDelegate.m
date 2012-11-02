//
//  ViewDelegate.m
//  Tentia
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "ViewDelegate.h"


@implementation ViewDelegate

@synthesize timelineView, mentionsView, oauthView;

- (void)webView:(WebView *)sender addMessageToConsole:(NSDictionary *)message;{

	if (![message isKindOfClass:[NSDictionary class]]) return;
	
    NSString *viewName = @"TimelineView";
    if (sender == mentionsView) viewName = @"MentionsView";
    if (sender == oauthView) viewName = @"OauthView";
    
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
    if (sender == oauthView) viewName = @"OauthView";

	NSLog(@"jsa<%@>: %@", viewName, message);
}

- (void)webView:(WebView *)sender decidePolicyForNavigationAction:(NSDictionary *)actionInformation request:(NSURLRequest *)request frame:(WebFrame *)frame decisionListener:(id <WebPolicyDecisionListener>)listener {
	[listener ignore];
    [[NSWorkspace sharedWorkspace] openURL:[request URL]];
}

- (void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame {

    if (sender == oauthView) {
        
        [oauthView stringByEvaluatingJavaScriptFromString:@"setTimeout( function() { tentia_oauth = new OauthImplementation(); }, 2);"];
        
    } else {
        
        NSString *action = @"home_timeline";
        NSString *delay = @"1";
        
        if (sender == mentionsView) {
            action = @"mentions";
            delay = @"1000";
        }
        
        [sender stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:
                                                        @"setTimeout(function(){ tentia_instance = new Core('%@'); \
                                                        document.getElementsByTagName('body')[0].appendChild(tentia_instance.body); \
                                                        setTimeout(function() { loadPlugin(controller.pluginURL()) }, 1); }, %@);", action, delay]];
    }
}

- (NSArray *)webView:(WebView *)sender contextMenuItemsForElement:(NSDictionary *)element defaultMenuItems:(NSArray *)defaultMenuItems {
    for (NSMenuItem*item in defaultMenuItems) {
        if ([[item title] isEqualToString:@"Reload"]) {
            [item setAction:@selector(reload:)];
            [item setTarget:self];
        }
    }
    
    return defaultMenuItems;
}

- (void)reload:(id)sender {
    [timelineView stringByEvaluatingJavaScriptFromString:@"tentia_instance.getNewData();"];
    [mentionsView stringByEvaluatingJavaScriptFromString:@"tentia_instance.getNewData();"];
}

@end

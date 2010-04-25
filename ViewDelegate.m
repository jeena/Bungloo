//
//  ViewDelegate.m
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "ViewDelegate.h"


@implementation ViewDelegate

@synthesize timelineView, mentionsView;

- (void)webView:(WebView *)sender addMessageToConsole:(NSDictionary *)message;{

	if (![message isKindOfClass:[NSDictionary class]]) return;
	
	NSLog(@"js: %@:%@: %@",
		[[message objectForKey:@"sourceURL"] lastPathComponent],
		[message objectForKey:@"lineNumber"],
		[message objectForKey:@"message"]
	);
}

- (void)webView:(WebView *)sender runJavaScriptAlertPanelWithMessage:(NSString *)message initiatedByFrame:(WebFrame *)frame {
	NSLog(@"jsa: %@", message);
}

- (void)webView:(WebView *)sender decidePolicyForNavigationAction:(NSDictionary *)actionInformation request:(NSURLRequest *)request frame:(WebFrame *)frame decisionListener:(id <WebPolicyDecisionListener>)listener {
	[listener ignore];
    [[NSWorkspace sharedWorkspace] openURL:[request URL]];
}

- (void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame {
	NSString *action = @"home_timeline";

	if (sender == mentionsView) {
		action = @"mentions";
	}

	[sender stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:
													@"setTimeout(function(){ twittia_instance = new Twittia('%@'); }, 1);", action]];
}

@end

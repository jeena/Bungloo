//
//  ViewDelegate.h
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import "StatusView.h"

@interface ViewDelegate : NSObject<StatusView> {
	WebView *webView;
}

-(id)initWithWebView:(WebView *) webView;

@end

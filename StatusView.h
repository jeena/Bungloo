//
//  Viewer.h
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@protocol StatusView

-(id)initWithWebView:(WebView *) webView;

@end

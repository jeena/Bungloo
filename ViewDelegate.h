//
//  ViewDelegate.h
//  Twittia 2
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface ViewDelegate : NSObject {
	WebView *timelineView;
	WebView *mentionsView;
}

@property (nonatomic, assign) WebView *timelineView;
@property (nonatomic, assign) WebView *mentionsView;

@end

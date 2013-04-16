//
//  ViewDelegate.h
//  bungloo
//
//  Created by Jeena on 15.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import "Constants.h"

@interface ViewDelegate : NSObject {
	WebView *timelineView;
    WebView *oauthView;
    NSMutableArray *conversationViews;
}

@property (nonatomic, assign) WebView *timelineView;
@property (nonatomic, assign) WebView *oauthView;
@property (nonatomic, assign) NSMutableArray *conversationViews;
@end

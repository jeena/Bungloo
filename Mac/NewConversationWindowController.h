//
//  NewConversationWindowController.h
//  Bungloo
//
//  Created by Jeena on 16/04/2013.
//
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import "ViewDelegate.h"

@interface NewConversationWindowController : NSWindowController {
    NSString *postId;
    NSString *entity;
    IBOutlet WebView *timelineView;
    ViewDelegate *viewDelegate;
}

@property (nonatomic, retain) NSString *postId;
@property (nonatomic, retain) NSString *entity;
@property (nonatomic, retain) IBOutlet WebView *timelineView;
@property (nonatomic, retain) ViewDelegate *viewDelegate;

- (id)initWithPostId:(NSString *)postId entity:(NSString *)entity andViewDelegate:(ViewDelegate *)viewDelegate;

@end

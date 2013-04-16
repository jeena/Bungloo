//
//  NewConversationWindowController.m
//  Bungloo
//
//  Created by Jeena on 16/04/2013.
//
//

#import "NewConversationWindowController.h"
#import "Controller.h"

@implementation NewConversationWindowController

@synthesize postId, entity, timelineView, viewDelegate;

- (id)initWithWindow:(NSWindow *)window
{
    self = [super initWithWindow:window];
    if (self) {
        // Initialization code here.
    }
    
    return self;
}

- (id)initWithPostId:(NSString *)_postId entity:(NSString *)_entity andViewDelegate:(ViewDelegate *)_viewDelegate;
{
    self = [super initWithWindowNibName:@"NewConversationWindowController"];
    if (self) {
        self.postId = _postId;
        self.entity = _entity;
        self.viewDelegate = _viewDelegate;
    }
    
    return self;
}

- (void)windowDidLoad
{
    [super windowDidLoad];
    
    // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
    NSString *index_string;
    NSURL *url;
    
    
    Controller *controller = (Controller *)[[NSApplication sharedApplication] delegate];
    [controller stringFromFile: @"index.html" url: &url content: &index_string];
    
    [self.viewDelegate.conversationViews addObject:timelineView];
    [[timelineView mainFrame] loadHTMLString:index_string baseURL:url];
    [timelineView setFrameLoadDelegate:viewDelegate];
    [timelineView setPolicyDelegate:viewDelegate];
    [timelineView setUIDelegate:viewDelegate];
    [[timelineView windowScriptObject] setValue:controller forKey:@"controller"];
    [[timelineView windowScriptObject] setValue:self forKey:@"conversationViewController"];

}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector
{
	return NO;
}

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name
{
	return NO;
}

@end

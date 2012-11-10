//
//  NewTweetWindow.h
//  Tentia
//
//  Created by Jeena on 16.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//


#import <Cocoa/Cocoa.h>


@interface NewMessageWindow : NSDocument <NSTextFieldDelegate>
{
	IBOutlet NSTextField *textField;
	IBOutlet NSTextField *counter;
	NSString *inReplyTostatusId;
    NSString *inReplyToEntity;
}

@property (nonatomic, retain) IBOutlet NSTextField *textField;
@property (nonatomic, retain) IBOutlet NSTextField *counter;

- (IBAction)sendTweet:(NSControl *)control;
- (void)inReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string;
- (void)withString:(NSString *)aString;

@end

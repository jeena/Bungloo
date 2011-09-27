//
//  NewTweetWindow.h
//  Twittia 2
//
//  Created by Jeena on 16.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//


#import <Cocoa/Cocoa.h>


@interface NewTweetWindow : NSDocument
{
	IBOutlet NSTextField *textField;
	IBOutlet NSTextField *counter;
	NSString *inReplyTostatusId;
}

@property (nonatomic, retain) IBOutlet NSTextField *textField;
@property (nonatomic, retain) IBOutlet NSTextField *counter;

- (IBAction)sendTweet:(NSControl *)control;
- (void)inReplyTo:(NSString *)userName statusId:(NSString *)statusId;
- (void)withString:(NSString *)aString;

@end

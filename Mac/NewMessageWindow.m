//
//  NewTweetWindow.m
//  Tentia
//
//  Created by Jeena on 16.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "NewMessageWindow.h"
#import "Constants.h"
#import "TweetModel.h"

@interface NewMessageWindow (private)
- (BOOL)isCommandEnterEvent:(NSEvent *)e;
@end

@implementation NewMessageWindow

@synthesize textField, counter;


- (id)init
{
    self = [super init];
    if (self) {
    
        // Add your subclass-specific initialization here.
        // If an error occurs here, send a [self release] message and return nil.
		inReplyTostatusId = @"";
        inReplyToEntity = @"";
    }
    return self;
}

- (NSString *)windowNibName
{
    // Override returning the nib file name of the document
    // If you need to use a subclass of NSWindowController or if your document supports multiple NSWindowControllers, you should remove this method and override -makeWindowControllers instead.
    return @"NewMessageWindow";
}

- (NSString *)displayName {
	return @"New Post";
}

- (void)windowControllerDidLoadNib:(NSWindowController *) aController
{
    [super windowControllerDidLoadNib:aController];
    // Add any code here that needs to be executed once the windowController has loaded the document's window.
    [textField becomeFirstResponder];

    // Enable Continous Spelling
    NSTextView *textView = (NSTextView *)[[[self.windowControllers objectAtIndex:0] window] firstResponder];;
    [textView setContinuousSpellCheckingEnabled:YES];
}

- (NSData *)dataOfType:(NSString *)typeName error:(NSError **)outError
{
    // Insert code here to write your document to data of the specified type. If the given outError != NULL, ensure that you set *outError when returning nil.

    // You can also choose to override -fileWrapperOfType:error:, -writeToURL:ofType:error:, or -writeToURL:ofType:forSaveOperation:originalContentsURL:error: instead.

    // For applications targeted for Panther or earlier systems, you should use the deprecated API -dataRepresentationOfType:. In this case you can also choose to override -fileWrapperRepresentationOfType: or -writeToFile:ofType: instead.

    if ( outError != NULL ) {
		*outError = [NSError errorWithDomain:NSOSStatusErrorDomain code:unimpErr userInfo:NULL];
	}
	return nil;
}

- (BOOL)readFromData:(NSData *)data ofType:(NSString *)typeName error:(NSError **)outError
{
    // Insert code here to read your document from the given data of the specified type.  If the given outError != NULL, ensure that you set *outError when returning NO.

    // You can also choose to override -readFromFileWrapper:ofType:error: or -readFromURL:ofType:error: instead. 
    
    // For applications targeted for Panther or earlier systems, you should use the deprecated API -loadDataRepresentation:ofType. In this case you can also choose to override -readFromFile:ofType: or -loadFileWrapperRepresentation:ofType: instead.
    
    if ( outError != NULL ) {
		*outError = [NSError errorWithDomain:NSOSStatusErrorDomain code:unimpErr userInfo:NULL];
	}
    return YES;
}

- (void)inReplyTo:(NSString *)entity statusId:(NSString *)statusId withString:(NSString *)string {
	[textField setStringValue:string];
	NSRange range = {[[textField stringValue] length] , 0};
	[[textField currentEditor] setSelectedRange:range];
    
	[inReplyTostatusId release];
	inReplyTostatusId = statusId;
	[inReplyTostatusId retain];
    
    [inReplyToEntity release];
    inReplyToEntity = entity;
    [inReplyToEntity retain];
    
    [self controlTextDidChange:nil];
}

- (void)withString:(NSString *)aString {
	[textField setStringValue:aString];
	NSRange range = {[[textField stringValue] length] , 0};
	[[textField currentEditor] setSelectedRange:range];
    
    [self controlTextDidChange:nil];
}

-(void)controlTextDidChange:(NSNotification *)aNotification {
	NSInteger c =  MESSAGE_MAX_LENGTH - [[textField stringValue] length];
	[counter setIntValue:c];
	if(c < 0) {
		[counter setTextColor:[NSColor redColor]];
	} else {
		[counter setTextColor:[NSColor controlTextColor]];	
	}
}


#pragma mark Keyboard delegate methods

- (IBAction)sendTweet:(NSControl *)control {
	if ([[control stringValue] length] <= MESSAGE_MAX_LENGTH) {
		TweetModel *tweet = [[[TweetModel alloc] init] autorelease];
		tweet.text = [control stringValue];
		tweet.inReplyTostatusId = inReplyTostatusId;
        tweet.inReplyToEntity = inReplyToEntity;
		[[NSNotificationCenter defaultCenter] postNotificationName:@"sendTweet" object:tweet];
		[self close];
	} else {
		NSBeep();
	}

}

- (BOOL)isCommandEnterEvent:(NSEvent *)e {
    NSUInteger flags = (e.modifierFlags & NSDeviceIndependentModifierFlagsMask);
    BOOL isCommand = (flags & NSCommandKeyMask) == NSCommandKeyMask;
    BOOL isEnter = (e.keyCode == 0x24); // VK_RETURN
    return (isCommand && isEnter);
}

- (BOOL)control:(NSControl *)control textView:(NSTextView *)fieldEditor doCommandBySelector:(SEL)commandSelector
{
    BOOL retval = NO;
    
    if (commandSelector == @selector(insertNewline:)) {
        
        NSText *text = [[textField window] fieldEditor:YES forObject:nil];
        
        NSRange range = [text selectedRange];
        NSString *stringBefore = [textField.stringValue substringToIndex:range.location];
        NSString *stringAfter =  [textField.stringValue substringFromIndex:range.location + range.length];
        
        textField.stringValue = [NSString stringWithFormat:@"%@\n%@", stringBefore, stringAfter];

        NSRange r = NSMakeRange(range.location + 1, 0);
        [text scrollRangeToVisible:r];
        [text setSelectedRange:r];

        retval = YES; // causes Apple to NOT fire the default enter action
    }
    else if (commandSelector == @selector(noop:)) {
        retval = YES;
        [self sendTweet:control];
    }
    
    return retval;
}

@end

//
//  MyDocument.m
//  Twittia 2
//
//  Created by Jeena on 16.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "MyDocument.h"

@implementation MyDocument

@synthesize textField, counter;

#define TWEET_MAX_LENGTH 140

- (id)init
{
    self = [super init];
    if (self) {
    
        // Add your subclass-specific initialization here.
        // If an error occurs here, send a [self release] message and return nil.
		inReplyTostatusId = @"";
    }
    return self;
}

- (NSString *)windowNibName
{
    // Override returning the nib file name of the document
    // If you need to use a subclass of NSWindowController or if your document supports multiple NSWindowControllers, you should remove this method and override -makeWindowControllers instead.
    return @"MyDocument";
}

- (NSString *)displayName {
	return @"New Tweet";
}

- (void)windowControllerDidLoadNib:(NSWindowController *) aController
{
    [super windowControllerDidLoadNib:aController];
    // Add any code here that needs to be executed once the windowController has loaded the document's window.
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

- (void)inReplyTo:(NSString *)userName statusId:(NSString *)statusId {
	[textField setStringValue:[NSString stringWithFormat:@"@%@ ", userName]];
	NSRange range = {[[textField stringValue] length] , 0};
	[[textField currentEditor] setSelectedRange:range];
	[inReplyTostatusId release];
	inReplyTostatusId = statusId;
	[inReplyTostatusId retain];
}


#pragma mark Keyboard delegate methods

- (IBAction)sendTweet:(NSControl *)control {
	if ([[control stringValue] length] <= TWEET_MAX_LENGTH) {
		NSArray *tweet = [NSArray arrayWithObjects:[control stringValue], inReplyTostatusId, nil];
		[[NSNotificationCenter defaultCenter] postNotificationName:@"sendTweet" object:tweet];
		[self close];
	} else {
		NSBeep();
	}

}

@end

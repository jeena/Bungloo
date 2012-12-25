//
//  NewTweetWindow.m
//  Tentia
//
//  Created by Jeena on 16.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "NewMessageWindow.h"
#import "Constants.h"
#import "PostModel.h"
#import "Controller.h"

@interface NewMessageWindow (private)
- (BOOL)isCommandEnterEvent:(NSEvent *)e;
- (void)initLocationManager;
@end

@implementation NewMessageWindow

@synthesize addMenu;
@synthesize addMenuButton;
@synthesize textField, counter;
@synthesize locationManager, currentLocation;
@synthesize imageFilePath;
@synthesize togglePrivateButton;

- (void)dealloc
{
    [locationManager stopUpdatingLocation];
    [locationManager release];
    [currentLocation release];
    [imageFilePath release];
    [super dealloc];
}

- (id)init
{
    self = [super init];
    if (self)
    {
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

- (NSString *)displayName
{
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
    
    if ( outError != NULL )
    {
		*outError = [NSError errorWithDomain:NSOSStatusErrorDomain code:unimpErr userInfo:NULL];
	}
    return YES;
}

- (void)inReplyTo:(NSString *)entity statusId:(NSString *)statusId withString:(NSString *)string
{
	[textField setStringValue:string];
    
    NSInteger location = [string rangeOfString:@" "].location;
    NSInteger length = 0;
    if (location != NSNotFound) {
        length = [[textField stringValue] length] -  location - 1;
    }
    
    
	NSRange range = {location + 1, length};
	[[textField currentEditor] setSelectedRange:range];
    
	[inReplyTostatusId release];
	inReplyTostatusId = statusId;
	[inReplyTostatusId retain];
    
    [inReplyToEntity release];
    inReplyToEntity = entity;
    [inReplyToEntity retain];
    
    [self controlTextDidChange:nil];
}

- (void)withString:(NSString *)aString
{
	[textField setStringValue:aString];
	NSRange range = {[[textField stringValue] length] , 0};
	[[textField currentEditor] setSelectedRange:range];
    NSLog(@"BB");
    
    [self controlTextDidChange:nil];
}

- (IBAction)addCurrentLocation:(id)sender
{
    NSMenuItem *menuItem = (NSMenuItem *)sender;
    if (!self.locationManager)
    {
        [menuItem setTitle:@"Current location not available"];
        [self initLocationManager];
    }
    else
    {
        [self.locationManager stopUpdatingLocation];
        self.currentLocation = nil;
        self.locationManager = nil;
        [menuItem setTitle:@"Add current location"];
    }
}

- (IBAction)openAddMenu:(id)sender
{
    NSRect frame = [(NSButton *)sender frame];
    NSPoint menuOrigin = [[(NSButton *)sender superview] convertPoint:NSMakePoint(frame.origin.x, frame.origin.y+frame.size.height) toView:nil];
    
    NSEvent *event =  [NSEvent mouseEventWithType:NSLeftMouseDown
                                         location:menuOrigin
                                    modifierFlags:NSLeftMouseDownMask // 0x100
                                        timestamp:NSTimeIntervalSince1970
                                     windowNumber:[[(NSButton *)sender window] windowNumber]
                                          context:[[(NSButton *)sender window] graphicsContext]
                                      eventNumber:0
                                       clickCount:1
                                         pressure:1];
    
    [NSMenu popUpContextMenu:self.addMenu withEvent:event forView:self.addMenuButton];
}

- (IBAction)togglePrivate:(id)sender
{
    NSImage *image = [NSImage imageNamed:NSImageNameLockLockedTemplate];
    if (self.togglePrivateButton.image == [NSImage imageNamed:NSImageNameLockLockedTemplate])
    {
        image = [NSImage imageNamed:NSImageNameLockUnlockedTemplate];
    }
    [self.togglePrivateButton setImage:image];
}

- (void)setIsPrivate:(BOOL)isPrivate {
    NSImage *image = [NSImage imageNamed:(isPrivate ? NSImageNameLockLockedTemplate : NSImageNameLockUnlockedTemplate)];
    [self.togglePrivateButton setImage:image];
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

- (void)initLocationManager
{
    self.locationManager = [[CLLocationManager alloc] init];
    [self.locationManager setDelegate:self];
    [self.locationManager setDesiredAccuracy:kCLLocationAccuracyBest];
    [self.locationManager setDistanceFilter:kCLDistanceFilterNone];
    [self.locationManager startUpdatingLocation];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateToLocation:(CLLocation *)newLocation fromLocation:(CLLocation *)oldLocation
{
    self.currentLocation = newLocation;
    NSMenuItem *menuItem = [self.addMenu itemAtIndex:0];
    [menuItem setTitle:@"Remove current location"];
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error{
    NSLog(@"CLLocationManager Error: %@", error);
    
    NSMenuItem *menuItem = [self.addMenu itemAtIndex:0];
    [menuItem setTitle:@"Current location not available"];
}

- (IBAction)sendPostButtonPressed:(id)sender
{
    [self sendPost:self.textField];
}

#pragma mark Keyboard delegate methods

- (IBAction)sendPost:(NSControl *)control {
	if ([[control stringValue] length] <= MESSAGE_MAX_LENGTH) {
		PostModel *post = [[[PostModel alloc] init] autorelease];
		post.text = [control stringValue];
		post.inReplyTostatusId = inReplyTostatusId;
        post.inReplyToEntity = inReplyToEntity;
        post.location = self.currentLocation;
        post.imageFilePath = self.imageFilePath;
        post.isPrivate = self.togglePrivateButton.image == [NSImage imageNamed:NSImageNameLockLockedTemplate];
		[[NSNotificationCenter defaultCenter] postNotificationName:@"sendTweet" object:post];
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
    
    BOOL isEnter = [[NSApp currentEvent] keyCode] == 76;
    
    if (commandSelector == @selector(insertNewline:) && !isEnter) {
        
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
    else if (commandSelector == @selector(noop:) || isEnter) {
        retval = YES;
        [self sendPost:control];
    }
    
    return retval;
}

#pragma mark Add images

- (IBAction)addImage:(id)sender
{
    NSMenuItem *menuItem = (NSMenuItem *)sender;

    if (!self.imageFilePath)
    {
        [menuItem setTitle:@"Remove photo"];
        
        NSOpenPanel* openDlg = [NSOpenPanel openPanel];
        [openDlg setPrompt:@"Select"];
        [openDlg setDelegate:self];
        
        // Enable the selection of files in the dialog.
        [openDlg setCanChooseFiles:YES];
        
        // Enable the selection of directories in the dialog.
        [openDlg setCanChooseDirectories:NO];
        
        // Display the dialog.  If the OK button was pressed,
        // process the files.
        if ( [openDlg runModalForDirectory:nil file:nil] == NSOKButton )
        {
            // Get an array containing the full filenames of all
            // files and directories selected.
            NSArray* files = [openDlg filenames];
            
            // Loop through all the files and process them.
            for( int i = 0; i < [files count]; i++ )
            {
                self.imageFilePath = [files objectAtIndex:i];
            }
        }
    }
    else
    {
        self.imageFilePath = nil;
        [menuItem setTitle:@"Add photo"];
    }
}

-(BOOL)panel:(id)sender shouldShowFilename:(NSString *)filename
{
    NSString* ext = [filename pathExtension];
    if (ext == @"" || ext == @"/" || ext == nil || ext == NULL || [ext length] < 1) {
        return YES;
    }
    
    NSEnumerator* tagEnumerator = [[NSArray arrayWithObjects:@"png", @"jpg", @"gif", @"jpeg", nil] objectEnumerator];
    NSString* allowedExt;
    while ((allowedExt = [tagEnumerator nextObject]))
    {
        if ([ext caseInsensitiveCompare:allowedExt] == NSOrderedSame)
        {
            return YES;
        }
    }
    
    return NO;
}

@end

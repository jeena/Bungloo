//
//  NewMessageWindow.h
//  bungloo
//
//  Created by Jeena on 16.04.10.
//  Licence: BSD (see attached LICENCE.txt file).
//


#import <Cocoa/Cocoa.h>
#import <CoreLocation/CoreLocation.h>


@interface NewMessageWindow : NSDocument <NSTextFieldDelegate, CLLocationManagerDelegate, NSOpenSavePanelDelegate>
{
	IBOutlet NSTextField *textField;
	IBOutlet NSTextField *counter;
	NSMenu *addMenu;
	NSButton *addMenuButton;
	NSString *inReplyTostatusId;
	NSString *inReplyToEntity;
	NSMenuItem *addImage;
	CLLocationManager *locationManager;
	CLLocation *currentLocation;
	NSString *imageFilePath;
	NSButton *togglePrivateButton;
}

@property (nonatomic, retain) IBOutlet NSTextField *textField;
@property (nonatomic, retain) IBOutlet NSTextField *counter;
@property (assign) IBOutlet NSMenu *addMenu;
@property (assign) IBOutlet NSButton *addMenuButton;
@property (retain, nonatomic) CLLocationManager *locationManager;
@property (retain, nonatomic) CLLocation *currentLocation;
@property (retain, nonatomic) NSString *imageFilePath;
@property (assign) IBOutlet NSButton *togglePrivateButton;

- (IBAction)sendPostButtonPressed:(id)sender;
- (IBAction)sendPost:(NSControl *)control;
- (void)inReplyTo:(NSString *)userName statusId:(NSString *)statusId withString:(NSString *)string;
- (void)withString:(NSString *)aString;
- (IBAction)addCurrentLocation:(id)sender;
- (IBAction)addImage:(id)sender;
- (IBAction)openAddMenu:(id)sender;
- (IBAction)togglePrivate:(id)sender;
- (void)setIsPrivate:(BOOL)isPrivate;

@end

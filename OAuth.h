//
//  OAuth.h
//  Twittia 2
//
//  Created by Jeena on 01.05.10.
//  Copyright 2010 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <OAuthConsumer/OAToken.h>
#import <OAuthConsumer/OAConsumer.h>
#import "OAToken+WebView.h"


@interface OAuth : NSObject {
	OAToken *requestToken;
	OAToken *accessToken;
	OAToken *consumerToken;
	OAConsumer *consumer;
	IBOutlet NSTextField *twitterPINField;
	IBOutlet NSPanel *twitterPINPanel;
}

@property (nonatomic, retain) OAToken *accessToken;
@property (nonatomic, retain) OAToken *consumerToken;
@property (nonatomic, retain) IBOutlet NSTextField *twitterPINField;
@property (nonatomic, retain) IBOutlet NSPanel *twitterPINPanel;

- (id)init;
- (void)requestAToken;
- (IBAction)requestAccessTokenWithPIN:(id)sender;

@end

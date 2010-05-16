//
//  OAuth.h
//  Twittia 2
//
//  Created by Jeena on 01.05.10.
//  Licence: BSD (see attached LICENCE.txt file).
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
}

@property (nonatomic, retain) OAToken *accessToken;
@property (nonatomic, retain) OAToken *consumerToken;

- (id)init;
- (void)requestAToken;
- (void)requestAccessToken;
- (void)updateTweet:(NSString *)tweet inReplaToStatus:(NSString *)statusId;


@end

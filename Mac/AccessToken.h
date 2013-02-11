//
//  AccessToken.h
//  bungloo
//
//  Created by Jeena Paradies on 19/09/2011.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//



@interface AccessToken : NSObject {
	NSUserDefaults *d;
}

- (void)setString:(NSString *)string forKey:(NSString *)aKey;
- (NSString *)stringForKey:(NSString *)aKey;

- (void)setAccessToken:(NSString *)_accessToken;
- (NSString *)accessToken;
- (void)setSecret:(NSString *)_secret;
- (NSString *)secret;
- (void)setUserId:(NSString *)_userId;
- (NSString *)userId;
- (void)setScreenName:(NSString *)_screenName;
- (NSString *)screenName;

@end
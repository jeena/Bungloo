//
//  AccessToken.m
//  Twittia 2
//
//  Created by Jeena Paradies on 19/09/2011.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "AccessToken.h"

@implementation AccessToken

- (id)init
{
    self = [super init];
    if (self) {
        // Initialization code here.
        d = [NSUserDefaults standardUserDefaults];
    }
    
    return self;
}

- (void)setAccessToken:(NSString *)_accessToken
{
    [d setObject:_accessToken forKey:@"accessToken"];
    [d synchronize];
}

- (NSString *)accessToken
{
    return [d objectForKey:@"accessToken"];
}

- (void)setSecret:(NSString *)_secret
{
    [d setObject:_secret forKey:@"secret"];
    [d synchronize];
}

- (NSString *)secret
{
    return [d objectForKey:@"secret"];
}

- (void)setUserId:(NSString *)_userId
{
    [d setObject:_userId forKey:@"userId"];
    [d synchronize];
}

- (NSString *)userId
{
    return [d objectForKey:@"userId"];
}

- (void)setScreenName:(NSString *)_screenName
{
    [d setObject:_screenName forKey:@"screenName"];
    [d synchronize];
}

- (NSString *)screenName
{
    return [d objectForKey:@"screenName"];
}


@end

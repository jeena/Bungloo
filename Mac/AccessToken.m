//
//  AccessToken.m
//  Tentia
//
//  Created by Jeena Paradies on 19/09/2011.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "AccessToken.h"
#include <Security/Security.h>

@implementation AccessToken

- (id)init
{
    self = [super init];
    if (self) {
        // Initialization code here.
        d = [NSUserDefaults standardUserDefaults];
        //[d removeObjectForKey:@"user_access_token"];
    }
    
    return self;
}

- (void)setString:(NSString *)string forKey:(NSString *)aKey
{
    [d setObject:string forKey:aKey];
    [d synchronize];
}

- (NSString *)stringForKey:(NSString *)aKey
{
    return [d objectForKey:aKey];
}

- (void)setAccessToken:(NSString *)_accessToken
{
    [d synchronize];
}

- (NSString *)accessToken
{
    return [d objectForKey:@"accessToken"];
}

- (void)setSecret:(NSString *)_secret
{
    OSStatus status;
    void * passwordData = (void*)[_secret cStringUsingEncoding:NSUTF8StringEncoding];
    UInt32 passwordLength = strlen((char*)passwordData);
    status = SecKeychainAddGenericPassword (
                                            NULL,           // default keychain
                                            6,              // length of service name
                                            "Tentia",         // service name
                                            17,             // length of account name
                                            "TentiaUserAccount",    // account name
                                            passwordLength,  // length of password
                                            passwordData,        // pointer to password data
                                            NULL             // the item reference
                                            );
    //NSLog(@"%@",(NSString *)SecCopyErrorMessageString (status,NULL));
}

- (NSString *)secret
{
    UInt32 passwordLength = 0;
    char *password = nil;
    SecKeychainItemRef item = nil;
    SecKeychainFindGenericPassword(NULL, 6, "Tentia", 17, "TentiaUserAccount", &passwordLength, (void **)&password, &item);
    //Get password
    NSString *passwordString = [[[NSString alloc] initWithData:[NSData dataWithBytes:password length:passwordLength] encoding:NSUTF8StringEncoding] autorelease];
    SecKeychainItemFreeContent(NULL, password);
    return passwordString;
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

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector {
	return NO;
}

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name {
	return NO;
}


@end

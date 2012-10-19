//
//  Constants.h
//  Tentia
//
//  Created by Jeena on 01.05.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Foundation/Foundation.h>
#import <Carbon/Carbon.h>


@interface Constants : NSObject {

}

#define OAUTH_CONSUMER_KEY @"JPmU8KJhiBKfpohCiWLg"
#define OAUTH_CONSUMER_SECRET @"jtfSrnDrRcUnL1nqTMcAW0055m63EMClmkxhiBjQ"
#define OAUTH_SIGNATURE_METHOD @"HMAC-SHA1"
#define OAUTH_REQUEST_TOKEN_URL @"http://twitter.com/oauth/request_token"
#define OAUTH_USER_AUTHORIZATION_URL @"http://twitter.com/oauth/authorize"
#define OAUTH_ACCESS_TOKEN_URL @"http://twitter.com/oauth/access_token"
#define OAUTH_SERVICE_NAME @"twitter.com"

#define APP_NAME @"Tentia"
#define MESSAGE_MAX_LENGTH 256

+ (NSString *)stringFromVirtualKeyCode:(NSInteger)code;

@end

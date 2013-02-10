//
//  Constants.h
//  bungloo
//
//  Created by Jeena on 01.05.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import <Foundation/Foundation.h>
#import <Carbon/Carbon.h>


@interface Constants : NSObject {

}

#define APP_NAME @"bungloo"
#define MESSAGE_MAX_LENGTH 256

+ (NSString *)stringFromVirtualKeyCode:(NSInteger)code;

@end

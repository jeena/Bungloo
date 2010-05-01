//
//  Constants.h
//  Twittia 2
//
//  Created by Jeena on 01.05.10.
//  Copyright 2010 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Carbon/Carbon.h>


@interface Constants : NSObject {

}

#define TWEET_MAX_LENGTH 140

+ (NSString *)stringFromVirtualKeyCode:(NSInteger)code;

@end

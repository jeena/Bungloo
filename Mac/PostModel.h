//
//  TweetModel.h
//  Tentia
//
//  Created by Jeena on 10.01.11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>

@interface PostModel : NSObject {
	NSString *text;
	NSString *inReplyTostatusId;
    NSString *inReplyToEntity;
    CLLocation *location;
    NSImage *image;
}

@property (nonatomic, retain) NSString *text;
@property (nonatomic, retain) NSString *inReplyTostatusId;
@property (nonatomic, retain) NSString *inReplyToEntity;
@property (nonatomic, retain) CLLocation *location;
@property (nonatomic, retain) NSImage *image;

@end

//
//  PostModel.h
//  bungloo
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
	NSString *imageFilePath;
	BOOL isPrivate;
}

@property (nonatomic, retain) NSString *text;
@property (nonatomic, retain) NSString *inReplyTostatusId;
@property (nonatomic, retain) NSString *inReplyToEntity;
@property (nonatomic, retain) CLLocation *location;
@property (nonatomic, retain) NSString *imageFilePath;
@property (nonatomic) BOOL isPrivate;

@end

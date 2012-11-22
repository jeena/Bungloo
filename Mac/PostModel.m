//
//  TweetModel.m
//  Tentia
//
//  Created by Jeena on 10.01.11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "PostModel.h"


@implementation PostModel

@synthesize text, inReplyTostatusId, inReplyToEntity, location, image;

- (void)dealloc
{
	[text release];
	[inReplyTostatusId release];
    [inReplyToEntity release];
    [location release];
    [image release];
	[super dealloc];
}

@end

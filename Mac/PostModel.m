//
//  TweetModel.m
//  bungloo
//
//  Created by Jeena on 10.01.11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "PostModel.h"


@implementation PostModel

@synthesize text, inReplyTostatusId, inReplyToEntity, location, imageFilePath, isPrivate;

- (void)dealloc
{
	[text release];
	[inReplyTostatusId release];
	[inReplyToEntity release];
	[location release];
	[imageFilePath release];
	[super dealloc];
}

@end

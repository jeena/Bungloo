//
//  TweetModel.m
//  Tentia
//
//  Created by Jeena on 10.01.11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "TweetModel.h"


@implementation TweetModel

@synthesize text, inReplyTostatusId, inReplyToEntity;

- (void)dealloc {
	[text release];
	[inReplyTostatusId release];
    [inReplyToEntity release];
	[super dealloc];
}

@end

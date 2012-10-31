//
//  TweetModel.h
//  Tentia
//
//  Created by Jeena on 10.01.11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface TweetModel : NSObject {
	NSString *text;
	NSString *inReplyTostatusId;
    NSString *inReplyToEntity;
}

@property (nonatomic, retain) NSString *text;
@property (nonatomic, retain) NSString *inReplyTostatusId;
@property (nonatomic, retain) NSString *inReplyToEntity;

@end

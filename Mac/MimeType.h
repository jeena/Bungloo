//
//  MimeType.h
//  Tentia
//
//  Created by Jeena on 23/11/2012.
//
//

#import <Foundation/Foundation.h>

@interface MimeType : NSObject
+(NSString *)mimeTypeForFileAtPath:(NSString *)path error:(NSError **)err;
@end

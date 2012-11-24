//
//  Created by Cédric Luthi on 2012-02-24.
//  Copyright (c) 2012 Cédric Luthi. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSData (Base64)

+ (id) dataWithBase64Encoding_xcd:(NSString *)base64String;
- (NSString *) base64Encoding_xcd;

@end
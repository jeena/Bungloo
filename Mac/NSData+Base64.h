//
//  Created by Cédric Luthi on 2012-02-24.
//  Copyright (c) 2012 Cédric Luthi. All rights reserved.
//

#import "NSData+Base64.h"

#ifndef __has_feature
#define __has_feature(x) 0
#endif

@implementation NSData (Base64)

+ (id) dataWithBase64Encoding_xcd:(NSString *)base64Encoding
{
	if ([base64Encoding length] % 4 != 0)
		return nil;
	
	NSString *plist = [NSString stringWithFormat:@"<?xml version=\"1.0\" encoding=\"UTF-8\"?><plist version=\"1.0\"><data>%@</data></plist>", base64Encoding];
	return [NSPropertyListSerialization propertyListWithData:[plist dataUsingEncoding:NSASCIIStringEncoding] options:0 format:NULL error:NULL];
}

- (NSString *) base64Encoding_xcd
{
	NSData *plist = [NSPropertyListSerialization dataWithPropertyList:self format:NSPropertyListXMLFormat_v1_0 options:0 error:NULL];
	NSRange fullRange = NSMakeRange(0, [plist length]);
	NSRange startRange = [plist rangeOfData:[@"<data>" dataUsingEncoding:NSASCIIStringEncoding] options:0 range:fullRange];
	NSRange endRange = [plist rangeOfData:[@"</data>" dataUsingEncoding:NSASCIIStringEncoding] options:NSDataSearchBackwards range:fullRange];
	if (startRange.location == NSNotFound || endRange.location == NSNotFound)
		return nil;
	
	NSUInteger base64Location = startRange.location + startRange.length;
	NSUInteger base64length = endRange.location - base64Location;
	NSData *base64Data = [NSData dataWithBytesNoCopy:(void *)((uintptr_t)base64Location + (uintptr_t)[plist bytes]) length:base64length freeWhenDone:NO];
	NSString *base64Encoding = [[NSString alloc] initWithData:base64Data encoding:NSASCIIStringEncoding];
	base64Encoding = [base64Encoding stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
	base64Encoding = [base64Encoding stringByReplacingOccurrencesOfString:@"\n" withString:@""];
	
#if __has_feature(objc_arc)
	return base64Encoding;
#else
	return [base64Encoding autorelease];
#endif
}

@end
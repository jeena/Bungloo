//
//  MimeType.m
//  bungloo
//
//  Created by Jeena on 23/11/2012.
//
//

#import "MimeType.h"

@implementation MimeType

+(NSString *)mimeTypeForFileAtPath:(NSString *)path error:(NSError **)err {
	NSString *uti, *mimeType = nil;

	if (!(uti = [[NSWorkspace sharedWorkspace] typeOfFile:path error:err]))
		return nil;
	if (err)
		*err = nil;

	if ((mimeType = (NSString *)UTTypeCopyPreferredTagWithClass((CFStringRef)uti, kUTTagClassMIMEType)))
		mimeType = NSMakeCollectable(mimeType);

	return mimeType;
}

@end

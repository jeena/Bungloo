//
//  OAToken+WebView.m
//  Twittia 2
//
//  Created by Jeena on 02.05.10.
//  Copyright 2010 __MyCompanyName__. All rights reserved.
//

#import "OAToken+WebView.h"


// this is just so the JavaScript can get the tokens.
@implementation OAToken(WebView)

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector {
	return NO;
}

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name {
	return NO;
}

@end

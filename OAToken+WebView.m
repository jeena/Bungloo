//
//  OAToken+WebView.m
//  Twittia 2
//
//  Created by Jeena on 02.05.10.
//  Licence: BSD (see attached LICENCE.txt file).
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

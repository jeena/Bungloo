//
//  OAuth.m
//  Twittia 2
//
//  Created by Jeena on 01.05.10.
//  Copyright 2010 __MyCompanyName__. All rights reserved.
//

#import "OAuth.h"
#import "Constants.h"
#import <OAuthConsumer/OAConsumer.h>
#import <OAuthConsumer/OAMutableURLRequest.h>
#import <OAuthConsumer/OADataFetcher.h>
#import <OAuthConsumer/OAToken.h>


@implementation OAuth

@synthesize accessToken, consumerToken, twitterPINField, twitterPINPanel;

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector {
	return NO;
}

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name {
	return NO;
}

-(id)init {
	if (self = [super init]) {
		self.consumerToken = [[OAToken alloc] initWithKey:OAUTH_CONSUMER_KEY secret:OAUTH_CONSUMER_SECRET];
		self.accessToken = [[OAToken alloc] initWithUserDefaultsUsingServiceProviderName:OAUTH_SERVICE_NAME prefix:APP_NAME];
	}
	
	return self;
}

- (void)dealloc {
	[consumerToken release];
	[accessToken release];
	[consumer release];
	[super dealloc];
}

- (void)awakeFromNib {
	if (!self.accessToken) {
		[self requestAToken];
	}
}

-(void)requestAToken {
	consumer = [[OAConsumer alloc] initWithKey:OAUTH_CONSUMER_KEY secret:OAUTH_CONSUMER_SECRET];
	
	NSURL *url = [NSURL URLWithString:OAUTH_REQUEST_TOKEN_URL];
	
	OAMutableURLRequest *request = [[OAMutableURLRequest alloc] initWithURL:url
																   consumer:consumer
																	  token:nil   // we don't have a Token yet
																	  realm:nil   // our service provider doesn't specify a realm
														  signatureProvider:nil]; // use the default method, HMAC-SHA1
	
	[request setHTTPMethod:@"POST"];
	
	OADataFetcher *fetcher = [[OADataFetcher alloc] init];
	
	[fetcher fetchDataWithRequest:request
						 delegate:self
				didFinishSelector:@selector(requestTokenTicket:didFinishWithData:)
				  didFailSelector:@selector(requestTokenTicket:didFailWithError:)];
}

- (void)requestTokenTicket:(OAServiceTicket *)ticket didFinishWithData:(NSData *)data {
	if (ticket.didSucceed) {
		NSString *responseBody = [[NSString alloc] initWithData:data
													   encoding:NSUTF8StringEncoding];
		requestToken = [[OAToken alloc] initWithHTTPResponseBody:responseBody];
		
		// show PIN panel
		[twitterPINPanel makeKeyAndOrderFront:self];
		
		NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@?oauth_token=%@", OAUTH_USER_AUTHORIZATION_URL, requestToken.key]];
		[[NSWorkspace sharedWorkspace] openURL:url];
	}
}

- (void)requestTokenTicket:(OAServiceTicket *)ticket didFailWithError:(NSError *)error {
	NSLog(@"ERROR: %@", error);
}

- (void)requestAccessTokenWithPIN:(id)sender {
	
	[twitterPINPanel resignKeyWindow];
	[twitterPINPanel close];
	
	NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@?oauth_verifier=%@", OAUTH_ACCESS_TOKEN_URL, [twitterPINField stringValue]]];
	
	OAMutableURLRequest *request = [[OAMutableURLRequest alloc] initWithURL:url
																   consumer:consumer
																	  token:requestToken   // we don't have a Token yet
																	  realm:nil   // our service provider doesn't specify a realm
														  signatureProvider:nil]; // use the default method, HMAC-SHA1
	
	[request setHTTPMethod:@"POST"];

	
	OADataFetcher *fetcher = [[OADataFetcher alloc] init];
	[fetcher fetchDataWithRequest:request
						 delegate:self
				didFinishSelector:@selector(accessTokenTicket:didFinishWithData:)
				  didFailSelector:@selector(requestTokenTicket:didFailWithError:)];
	
	
}

- (void)accessTokenTicket:(OAServiceTicket *)ticket didFinishWithData:(NSData *)data {
	if (ticket.didSucceed) {
		NSString *responseBody = [[NSString alloc] initWithData:data
													   encoding:NSUTF8StringEncoding];
		accessToken = [[OAToken alloc] initWithHTTPResponseBody:responseBody];
		[accessToken storeInUserDefaultsWithServiceProviderName:OAUTH_SERVICE_NAME prefix:APP_NAME];
		NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
		[nc postNotificationName:@"authentificationSucceded" object:self];
		
		/*
		NSURL *url = [NSURL URLWithString:@"http://api.twitter.com/1/statuses/home_timeline.json"];
		OAMutableURLRequest *request = [[OAMutableURLRequest alloc] initWithURL:url
																	   consumer:consumer
																		  token:accessToken
																		  realm:nil
															  signatureProvider:nil];
		
		OADataFetcher *fetcher = [[OADataFetcher alloc] init];
		[fetcher fetchDataWithRequest:request
							 delegate:self
					didFinishSelector:@selector(apiTicket:didFinishWithData:)
					  didFailSelector:@selector(requestTokenTicket:didFailWithError:)];
		 */
	}
}

- (void)apiTicket:(OAServiceTicket *)ticket didFinishWithData:(NSData *)data {
	if (ticket.didSucceed) {
		NSString *responseBody = [[NSString alloc] initWithData:data
													   encoding:NSUTF8StringEncoding];
		NSLog(@"%@", responseBody);
	}
}



@end

//
//  OAuth.m
//  Twittia 2
//
//  Created by Jeena on 01.05.10.
//  Licence: BSD (see attached LICENCE.txt file).
//

#import "OAuth.h"
#import "Constants.h"
#import <OAuthConsumer/OAConsumer.h>
#import <OAuthConsumer/OAMutableURLRequest.h>
#import <OAuthConsumer/OADataFetcher.h>
#import <OAuthConsumer/OAToken.h>


@implementation OAuth

@synthesize accessToken, consumerToken;

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
		consumer = [[OAConsumer alloc] initWithKey:OAUTH_CONSUMER_KEY secret:OAUTH_CONSUMER_SECRET];
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
				
		NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@?oauth_token=%@", OAUTH_USER_AUTHORIZATION_URL, requestToken.key]];
		[[NSWorkspace sharedWorkspace] openURL:url];
	}
}

- (void)requestTokenTicket:(OAServiceTicket *)ticket didFailWithError:(NSError *)error {
	NSLog(@"ERROR: %@", error);
}

- (void)requestAccessToken {
		
	NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@", OAUTH_ACCESS_TOKEN_URL]];
	
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
				  didFailSelector:@selector(accessTokenTicket:didFailWithError:)];
	
	
}

- (void)accessTokenTicket:(OAServiceTicket *)ticket didFinishWithData:(NSData *)data {
	NSLog(@"%@", ticket);
	if (ticket.didSucceed) {
		NSString *responseBody = [[NSString alloc] initWithData:data
													   encoding:NSUTF8StringEncoding];
		
		self.accessToken = [[OAToken alloc] initWithHTTPResponseBody:responseBody];
		[accessToken storeInUserDefaultsWithServiceProviderName:OAUTH_SERVICE_NAME prefix:APP_NAME];

		NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
		[nc postNotificationName:@"authentificationSucceded" object:self];		
	}
}



- (void)accessTokenTicket:(OAServiceTicket *)ticket didFailWithError:(NSError *)error {
	NSLog(@"ERROR a: %@", error);
	// [self requestAccessToken];
	
	NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@?oauth_token=%@", OAUTH_USER_AUTHORIZATION_URL, requestToken.key]];
	[[NSWorkspace sharedWorkspace] openURL:url];	
}

- (void)updateTweet:(NSString *)tweet inReplaToStatus:(NSString *)statusId {
	
	NSLog(@"%@ %@", tweet, statusId);
	
	NSURL *url = [NSURL URLWithString:@"http://api.twitter.com/1/statuses/update.json"];
	OAMutableURLRequest *request = [[OAMutableURLRequest alloc] initWithURL:url
																   consumer:consumer
																	  token:accessToken
																	  realm:nil
														  signatureProvider:nil];
	
	OARequestParameter *source = [[OARequestParameter alloc] initWithName:@"source" value:@"twittia"];
	OARequestParameter *status = [[OARequestParameter alloc] initWithName:@"status" value:tweet];
	
	NSMutableArray *params = [NSMutableArray arrayWithObjects:source, status, nil];
	
	if (statusId) {
		OARequestParameter *reply = [[OARequestParameter alloc] initWithName:@"in_reply_to_status_id" value:[NSString stringWithString:statusId]];
		[params addObject:reply];
	}
	
	[request setHTTPMethod:@"POST"];
    [request setParameters:params];
	
	OADataFetcher *fetcher = [[OADataFetcher alloc] init];
	[fetcher fetchDataWithRequest:request
						 delegate:self
				didFinishSelector:@selector(updateTweetTicket:didFinishWithData:)
				  didFailSelector:@selector(updateTweetTokenTicket:didFailWithError:)];
}

- (void)updateTweetTicket:(OAServiceTicket *)ticket didFinishWithData:(NSData *)data {
	if (ticket.didSucceed) {
		NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
		[nc postNotificationName:@"getTweetUpdates" object:self];

	}
}

- (void)updateTweetTokenTicket:(OAServiceTicket *)ticket didFailWithError:(NSError *)error {
	NSLog(@"ERROR update tweet: %@", error);
}

@end

//
//  ChunkLoader.m
//  MBundle
//
//  Created by Nexus Lau on 10/11/2024.
//

#import "ChunkModule.h"
#import <React/RCTBridge+Private.h>
#import "AppDelegate.h"

@implementation ChunkModule

RCT_EXPORT_MODULE(ChunkModule);

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(loadChunk:(NSString *)moduleId)
{
  NSString *bundleName = [NSString stringWithFormat:@"chunk-%@-plain", moduleId];
  NSURL *bundleUrl = [[NSBundle mainBundle] URLForResource:bundleName withExtension:@"bundle"];
  NSError *error = nil;
  NSData *source = [NSData dataWithContentsOfFile:bundleUrl.path
                                          options:NSDataReadingMappedIfSafe
                                            error:&error];
  
  RCTBridge *bridge = ((AppDelegate*)[UIApplication sharedApplication].delegate).bridge;
  
  if ([bridge.batchedBridge isKindOfClass:[RCTCxxBridge class]]) {
    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)bridge.batchedBridge;
    [cxxBridge executeApplicationScript:source url:bundleUrl async:NO];
  }
  return @(YES);
}




@end

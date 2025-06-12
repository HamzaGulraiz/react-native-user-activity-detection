//  UserActivityModule.m
#import "UserActivityModule.h"
#import <UIKit/UIKit.h>
#import <objc/runtime.h>

@implementation UserActivityModule {
  BOOL hasListeners;
}

static UserActivityModule *_sharedInstance = nil;

+ (instancetype)sharedInstance {
  return _sharedInstance;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (instancetype)init {
  if (self = [super init]) {
    _sharedInstance = self;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"UserActivityDetected"];
}

- (void)startObserving {
  hasListeners = YES;
}

- (void)stopObserving {
  hasListeners = NO;
}

- (void)emitUserActivity {
  if (hasListeners) {
    [self sendEventWithName:@"UserActivityDetected"
                       body:@{ @"timestamp": @([[NSDate date] timeIntervalSince1970] * 1000) }];
  }
}

RCT_EXPORT_METHOD(resetInactivityTimer) {
  [self emitUserActivity];
}

RCT_EXPORT_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve(@(YES));
}
@end

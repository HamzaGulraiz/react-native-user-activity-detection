#import "UserActivityDetection.h"
#import <UIKit/UIKit.h>

@implementation UserActivityDetection {
  BOOL hasListeners;
}

static UserActivityDetection *_sharedInstance = nil;

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

    // Add global touch detector
    dispatch_async(dispatch_get_main_queue(), ^{
      UIWindow *window = UIApplication.sharedApplication.keyWindow;
      if (window) {
        UIGestureRecognizer *gesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(userDidInteract)];
        gesture.cancelsTouchesInView = NO;
        gesture.delaysTouchesBegan = NO;
        gesture.delaysTouchesEnded = NO;
        [window addGestureRecognizer:gesture];
      } else {
        NSLog(@"❗️UserActivityDetection: No keyWindow found. Gesture recognizer not attached.");
      }
    });
  }
  return self;
}

- (void)userDidInteract {
  [self emitUserActivity];
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

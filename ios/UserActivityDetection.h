// UserActivityDetection.h
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface UserActivityDetection : RCTEventEmitter <RCTBridgeModule>

+ (instancetype)sharedInstance;
- (void)emitUserActivity;

@end

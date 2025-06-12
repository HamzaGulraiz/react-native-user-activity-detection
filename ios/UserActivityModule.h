//  UserActivityModule.h
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface UserActivityModule : RCTEventEmitter <RCTBridgeModule>

+ (instancetype)sharedInstance;
- (void)emitUserActivity;

@end

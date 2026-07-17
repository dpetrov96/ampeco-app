#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ClusterBadgeModule, NSObject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getBadgeUri:(nonnull NSNumber *)count)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getPinUri:(NSString *)label)

@end

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppVersion, NSObject)
RCT_EXTERN_METHOD(getVersion:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end

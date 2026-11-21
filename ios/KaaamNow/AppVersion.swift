import Foundation
import React

/// Installed app version from Info.plist (`MARKETING_VERSION`).
@objc(AppVersion)
class AppVersion: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func constantsToExport() -> [AnyHashable: Any] {
    ["version": Self.installed()]
  }

  @objc func getVersion(
    _ resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    resolve(Self.installed())
  }

  private static func installed() -> String {
    Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
  }
}

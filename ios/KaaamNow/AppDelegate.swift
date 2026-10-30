import UIKit
import FirebaseCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  /// The window lives on the scene; libraries such as react-native-razorpay still read
  /// `UIApplication.shared.delegate.window` to find the presenting view controller.
  var window: UIWindow? {
    get {
      let windows = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap(\.windows)
      return windows.first(where: \.isKeyWindow) ?? windows.first
    }
    set {}
  }

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()
    return true
  }
}

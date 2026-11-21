package `in`.kaaamnow.app

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/** Installed app version (`versionName` from the Android build). */
class AppVersionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = NAME

  override fun getConstants(): Map<String, Any> = mapOf("version" to installedVersion())

  @ReactMethod
  fun getVersion(promise: Promise) {
    promise.resolve(installedVersion())
  }

  private fun installedVersion(): String {
    val info = reactApplicationContext.packageManager.getPackageInfo(reactApplicationContext.packageName, 0)
    return info.versionName ?: ""
  }

  companion object {
    const val NAME = "AppVersion"
  }
}

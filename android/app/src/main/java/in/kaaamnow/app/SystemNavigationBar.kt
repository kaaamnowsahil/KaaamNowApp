package `in`.kaaamnow.app

import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** Centralizes system-bar appearance so Android starts with the saved app theme. */
object SystemNavigationBar {
  const val PREFERENCES = "kaaamnow_ui"
  const val LIGHT_APPEARANCE = "light_navigation_bars"

  fun apply(activity: Activity, isLight: Boolean) = apply(activity.window, isLight)

  fun apply(window: android.view.Window, isLight: Boolean) {
    window.navigationBarColor = Color.TRANSPARENT
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
      window.isNavigationBarContrastEnforced = false
    }
    WindowInsetsControllerCompat(window, window.decorView)
      .isAppearanceLightNavigationBars = isLight
  }
}

class SystemNavigationBarModule(
  private val context: ReactApplicationContext,
) : ReactContextBaseJavaModule(context) {
  override fun getName(): String = NAME

  @ReactMethod
  fun setLightNavigationBar(isLight: Boolean) {
    context
      .getSharedPreferences(SystemNavigationBar.PREFERENCES, Context.MODE_PRIVATE)
      .edit()
      .putBoolean(SystemNavigationBar.LIGHT_APPEARANCE, isLight)
      .apply()

    Handler(Looper.getMainLooper()).post {
      context.currentActivity?.let { SystemNavigationBar.apply(it, isLight) }
    }
  }

  companion object {
    const val NAME = "SystemNavigationBar"
  }
}

class SystemNavigationBarPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == SystemNavigationBarModule.NAME) {
      SystemNavigationBarModule(reactContext)
    } else {
      null
    }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider {
      mapOf(
        SystemNavigationBarModule.NAME to
          ReactModuleInfo(
            SystemNavigationBarModule.NAME,
            SystemNavigationBarModule::class.java.name,
            false,
            false,
            false,
            false,
          ),
      )
    }
}

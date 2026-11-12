package `in`.kaaamnow.app

import android.app.NotificationManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import kotlin.math.max

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    applyNavigationBarInset()
  }

  override fun onResume() {
    super.onResume()
    promptAlarmAccess()
  }

  /**
   * Android 15 and 16 draw the app behind the navigation bar. Pad the content by the
   * taller of the navigation bar and the mandatory gesture inset, so gesture navigation
   * and the 3-button bar both stay clear of the tab bar. Top insets are left for the
   * safe area so screens keep their own status-bar spacing.
   */
  private fun applyNavigationBarInset() {
    val content = findViewById<View>(android.R.id.content) ?: return
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val navigation = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
      val gestures = insets.getInsets(WindowInsetsCompat.Type.mandatorySystemGestures())
      view.setPadding(0, 0, 0, max(navigation.bottom, gestures.bottom))
      insets
    }
    ViewCompat.requestApplyInsets(content)
  }

  /** One prompt so a silent or Do Not Disturb phone can still play the work alarm. */
  private fun promptAlarmAccess() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return
    val prefs = getSharedPreferences("kaaamnow", MODE_PRIVATE)
    if (prefs.getBoolean("alarm_policy_prompted", false)) return
    val manager = getSystemService(NotificationManager::class.java) ?: return
    prefs.edit().putBoolean("alarm_policy_prompted", true).apply()
    if (manager.isNotificationPolicyAccessGranted) return
    try {
      startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
    } catch (_: ActivityNotFoundException) {
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "KaaamNow"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}

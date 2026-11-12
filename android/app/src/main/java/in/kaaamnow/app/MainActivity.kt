package `in`.kaaamnow.app

import android.app.NotificationManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onResume() {
    super.onResume()
    promptAlarmAccess()
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

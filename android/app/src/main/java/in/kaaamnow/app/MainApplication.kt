package `in`.kaaamnow.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(RingPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    createNotificationChannels()
    loadReactNative(this)
  }

  /**
   * Each spoken ringtone has its own channel. A killed app is started by the push itself,
   * and deleting that channel cancels the banner Android just posted, so neither the
   * notification nor the sound is left. Channels are created once and then left alone.
   */
  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java)
    manager.deleteNotificationChannel("kaaamnow")
    manager.deleteNotificationChannel("kaaamnow_ring")
    val voiceId = RingMessageReceiver.VOICE_CHANNEL
    if (manager.getNotificationChannel(voiceId) == null) {
      val voice =
        NotificationChannel(
          voiceId,
          getString(R.string.default_notification_channel_name),
          NotificationManager.IMPORTANCE_HIGH,
        )
      voice.setSound(null, null)
      voice.enableVibration(true)
      manager.createNotificationChannel(voice)
    }
    val alertsId = getString(R.string.default_notification_channel_id)
    if (manager.getNotificationChannel(alertsId) == null) {
      val alerts =
        NotificationChannel(
          alertsId,
          getString(R.string.default_notification_channel_name),
          NotificationManager.IMPORTANCE_HIGH,
        )
      alerts.enableVibration(true)
      manager.createNotificationChannel(alerts)
    }

    val audio =
      AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
    for (language in LANGUAGES) {
      for ((kind, label) in RINGS) {
        val id = "ring_${language}_$kind"
        if (manager.getNotificationChannel(id) != null) continue
        val resId = resources.getIdentifier(id, "raw", packageName)
        if (resId == 0) continue
        val channel =
          NotificationChannel(
            id,
            "$label · ${LANGUAGE_NAMES[language]}",
            NotificationManager.IMPORTANCE_HIGH,
          )
        channel.setSound(Uri.parse("android.resource://$packageName/raw/$id"), audio)
        channel.enableVibration(true)
        manager.createNotificationChannel(channel)
      }
    }
  }

  companion object {
    private val LANGUAGES =
      listOf("bn", "en", "gu", "hi", "kn", "ml", "mr", "or", "pa", "ta", "te", "ur")
    private val LANGUAGE_NAMES =
      mapOf(
        "bn" to "Bengali",
        "en" to "English",
        "gu" to "Gujarati",
        "hi" to "Hindi",
        "kn" to "Kannada",
        "ml" to "Malayalam",
        "mr" to "Marathi",
        "or" to "Odia",
        "pa" to "Punjabi",
        "ta" to "Tamil",
        "te" to "Telugu",
        "ur" to "Urdu",
      )
    private val RINGS = listOf("new_work" to "New work", "worker_accepted" to "Worker accepted")
  }
}

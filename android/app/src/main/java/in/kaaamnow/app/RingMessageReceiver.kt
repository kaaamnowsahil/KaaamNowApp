package `in`.kaaamnow.app

import android.app.ActivityManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

/**
 * Killed-state sound comes from the notification channel named after the raw file.
 * When FCM already includes that channel, Android plays it. This only draws a banner
 * for a data-only message, on that same channel, so the spoken file still plays.
 */
class RingMessageReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != RECEIVE) return
    val extras = intent.extras ?: return
    if (extras.getString("google.message_id") == null) return
    val sound = resolveSound(extras) ?: return
    if (isAppForeground(context)) return
    val systemShowing =
      extras.containsKey("gcm.notification.title") || extras.containsKey("gcm.notification.body")
    if (systemShowing) return

    val title = extras.getString("title") ?: "KaaamNow"
    val body = extras.getString("body") ?: ""
    showNotification(
      context.applicationContext,
      title,
      body,
      extras.getString("google.message_id"),
      sound,
    )
  }

  private fun showNotification(
    context: Context,
    title: String,
    body: String,
    messageId: String?,
    sound: String,
  ) {
    ensureAlarmChannel(context, sound, "KaaamNow")
    val manager = context.getSystemService(NotificationManager::class.java)
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val open =
      PendingIntent.getActivity(
        context,
        0,
        launch,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
    val notification =
      NotificationCompat.Builder(context, alarmChannelId(sound))
        .setSmallIcon(context.applicationInfo.icon)
        .setContentTitle(title)
        .setContentText(body)
        .setCategory(NotificationCompat.CATEGORY_ALARM)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setPriority(NotificationCompat.PRIORITY_MAX)
        .setAutoCancel(true)
        .setContentIntent(open)
        .build()
    manager.notify(messageId?.hashCode() ?: title.hashCode(), notification)
  }

  private fun isAppForeground(context: Context): Boolean {
    val manager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    val packageName = context.packageName
    return manager.runningAppProcesses.orEmpty().any { process ->
      process.processName == packageName &&
        process.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
    }
  }

  companion object {
    private const val RECEIVE = "com.google.android.c2dm.intent.RECEIVE"
    const val VOICE_CHANNEL = "kaaamnow_voice"
    const val ALARM_CHANNEL_PREFIX = "kaaamnow_alarm_"
    private val soundName = Regex("ring_[a-z]{2}_(new_work|worker_accepted)")
    private val languages =
      setOf("bn", "en", "gu", "hi", "kn", "ml", "mr", "or", "pa", "ta", "te", "ur")

    fun alarmChannelId(sound: String): String = "$ALARM_CHANNEL_PREFIX$sound"

    /** Alarm-stream channel for one spoken file. The raw name stays ring_<lang>_<type>. */
    fun ensureAlarmChannel(context: Context, sound: String, label: String) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
      if (!soundName.matches(sound)) return
      val manager = context.getSystemService(NotificationManager::class.java) ?: return
      val channelId = alarmChannelId(sound)
      if (manager.getNotificationChannel(channelId) != null) return
      val channel = NotificationChannel(channelId, label, NotificationManager.IMPORTANCE_HIGH)
      val resId = context.resources.getIdentifier(sound, "raw", context.packageName)
      if (resId != 0) {
        val audio =
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        channel.setSound(Uri.parse("android.resource://${context.packageName}/raw/$sound"), audio)
      }
      channel.enableVibration(true)
      channel.setBypassDnd(true)
      manager.createNotificationChannel(channel)
    }

    fun resolveSound(extras: android.os.Bundle): String? {
      listOf("sound", "gcm.notification.sound", "gcm.notification.android_channel_id").forEach { key ->
        val value = extras.getString(key)?.removePrefix(ALARM_CHANNEL_PREFIX)
        if (value != null && soundName.matches(value)) return value
      }
      val liveWork = extras.getString("live_work")?.trim()?.lowercase()
      if (liveWork == "true" || liveWork == "1" || liveWork == "yes") return null
      val language = extras.getString("language")?.substringBefore('-')?.lowercase()
      val lang = if (language != null && language in languages) language else "en"
      return when (extras.getString("kind")) {
        "live_request" -> "ring_${lang}_new_work"
        "live_worker_accepted" -> "ring_${lang}_worker_accepted"
        else -> null
      }
    }
  }
}

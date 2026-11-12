package `in`.kaaamnow.app

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Handler
import android.os.Looper
import android.os.PowerManager

/** Plays a bundled spoken ringtone. Safe to call when the activity is gone. */
object RingPlayback {
  private val soundName = Regex("ring_[a-z]{2}_(new_work|worker_accepted)")
  private val main = Handler(Looper.getMainLooper())
  private var player: MediaPlayer? = null

  fun play(context: Context, name: String, onDone: () -> Unit = {}) {
    if (!soundName.matches(name)) {
      onDone()
      return
    }
    val app = context.applicationContext
    main.post {
      player?.release()
      player = null
      val next = MediaPlayer()
      try {
        val resId = app.resources.getIdentifier(name, "raw", app.packageName)
        if (resId == 0) {
          next.release()
          onDone()
          return@post
        }
        next.setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build(),
        )
        next.setWakeMode(app, PowerManager.PARTIAL_WAKE_LOCK)
        val descriptor = app.resources.openRawResourceFd(resId)
        next.setDataSource(descriptor.fileDescriptor, descriptor.startOffset, descriptor.length)
        descriptor.close()
        next.setOnCompletionListener {
          it.release()
          if (player == it) player = null
          onDone()
        }
        next.prepare()
        player = next
        next.start()
      } catch (_: Exception) {
        next.release()
        onDone()
      }
    }
  }
}

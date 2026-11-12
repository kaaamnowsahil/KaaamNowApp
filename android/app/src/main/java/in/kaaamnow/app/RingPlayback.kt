package `in`.kaaamnow.app

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Handler
import android.os.Looper
import android.os.PowerManager

/**
 * Plays a bundled spoken ringtone on the alarm stream, at full alarm volume.
 * Each file is two rings; playback runs 1.5× so the worker or business hears three,
 * matching the web. Safe to call when the activity is gone.
 */
object RingPlayback {
  private val soundName = Regex("ring_[a-z]{2}_(new_work|worker_accepted)")
  private val main = Handler(Looper.getMainLooper())
  private var player: MediaPlayer? = null
  private var stop: Runnable? = null
  private var savedAlarmVolume: Int? = null

  private const val FILE_RINGS = 2
  private const val RINGS = 3

  fun play(context: Context, name: String, onDone: () -> Unit = {}) {
    if (!soundName.matches(name)) {
      main.post(onDone)
      return
    }
    val app = context.applicationContext
    main.post {
      stop?.let(main::removeCallbacks)
      player?.release()
      player = null
      raiseAlarmVolume(app)
      val next = MediaPlayer()
      try {
        val resId = app.resources.getIdentifier(name, "raw", app.packageName)
        if (resId == 0) {
          next.release()
          restoreAlarmVolume(app)
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
        next.isLooping = true
        next.prepare()
        player = next
        next.start()
        val playMs = next.duration.toLong() * RINGS / FILE_RINGS
        val finish = Runnable {
          if (player == next) {
            next.release()
            player = null
          }
          restoreAlarmVolume(app)
          onDone()
        }
        stop = finish
        if (playMs > 0) main.postDelayed(finish, playMs) else finish.run()
      } catch (_: Exception) {
        next.release()
        restoreAlarmVolume(app)
        onDone()
      }
    }
  }

  /** Silent mode and a low ringer do not affect the alarm stream. Raise it for this ring only. */
  private fun raiseAlarmVolume(context: Context) {
    try {
      val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      if (savedAlarmVolume == null) {
        savedAlarmVolume = audio.getStreamVolume(AudioManager.STREAM_ALARM)
      }
      audio.setStreamVolume(AudioManager.STREAM_ALARM, audio.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0)
    } catch (_: Exception) {
    }
  }

  private fun restoreAlarmVolume(context: Context) {
    val previous = savedAlarmVolume ?: return
    savedAlarmVolume = null
    try {
      val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      audio.setStreamVolume(AudioManager.STREAM_ALARM, previous, 0)
    } catch (_: Exception) {
    }
  }
}

package `in`.kaaamnow.app

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/** Plays a bundled spoken ringtone while the app is on screen. */
class RingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = NAME

  @ReactMethod
  fun play(name: String) {
    Handler(Looper.getMainLooper()).post { start(name) }
  }

  private fun start(name: String) {
    RingPlayback.play(reactApplicationContext, name)
  }

  companion object {
    const val NAME = "RingPlayer"
  }
}

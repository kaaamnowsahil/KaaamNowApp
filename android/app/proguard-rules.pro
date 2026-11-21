# Razorpay checkout looks up its classes and JavaScript bridge by name.
-keepattributes JavascriptInterface
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn com.razorpay.**
-keep class com.razorpay.** { *; }
-keepclasseswithmembers class * {
    public void onPayment*(...);
}

# React Native Firebase loads these entry points from the native module registry.
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# The app's own modules are registered by class name from MainApplication.
-keep class in.kaaamnow.app.** { *; }

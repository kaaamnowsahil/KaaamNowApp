package com.razorpay.rn;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReadableMap;
import com.razorpay.Checkout;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;
import com.razorpay.ExternalWalletListener;
import android.app.Activity;
import android.content.Intent;

/**
 * New architecture (TurboModule) implementation of RazorpayModule.
 * Extends the codegen-generated NativeRazorpayCheckoutSpec and delegates business logic to RazorpayModuleImpl.
 */
public class RazorpayModule extends NativeRazorpayCheckoutSpec implements ActivityEventListener, PaymentResultWithDataListener, ExternalWalletListener {

    private final RazorpayModuleImpl implementation;
    private final ReactApplicationContext reactContext;

    public RazorpayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.implementation = new RazorpayModuleImpl(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    @NonNull
    public String getName() {
        return "RNRazorpayCheckout";
    }

    @Override
    public void open(ReadableMap options) {
        implementation.open(options);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onNewIntent(Intent intent) {
        // No-op
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            implementation.onPaymentError(0, "Checkout closed unexpectedly", null);
            return;
        }
        try {
            Checkout.handleActivityResult(activity, requestCode, resultCode, data, this, this);
        } catch (Exception error) {
            implementation.onPaymentError(0, "Checkout closed unexpectedly", null);
        }
    }

    @Override
    public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        implementation.onPaymentSuccess(razorpayPaymentId, paymentData);
    }

    @Override
    public void onPaymentError(int code, String description, PaymentData paymentData) {
        implementation.onPaymentError(code, description, paymentData);
    }

    @Override
    public void onExternalWalletSelected(String walletName, PaymentData paymentData) {
        implementation.onExternalWalletSelected(walletName, paymentData);
    }
}

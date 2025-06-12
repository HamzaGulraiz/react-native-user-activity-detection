// UserActivityModule.kt

package com.yourapp.useractivity

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.ViewGroup
import android.view.ViewTreeObserver
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.atomic.AtomicBoolean

class UserActivityModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {
    
    private val initialized = AtomicBoolean(false)
    private val hasListeners = AtomicBoolean(false)
    private val mainHandler = Handler(Looper.getMainLooper())
    
    init {
        reactContext.addLifecycleEventListener(this)
    }
    
    override fun getName(): String {
        return "UserActivityModule"
    }
    
    @ReactMethod
    fun resetInactivityTimer() {
        emitUserActivityEvent()
    }
    
    @ReactMethod
    fun isAvailable(promise: Promise) {
        promise.resolve(true)
    }
    
    @ReactMethod
    fun addListener(eventName: String) {
        if (eventName == "UserActivityDetected") {
            hasListeners.set(true)
        }
    }
    
    @ReactMethod
    fun removeListeners(count: Int) {
        if (count == 0) {
            hasListeners.set(false)
        }
    }
    
    private fun emitUserActivityEvent() {
        if (hasListeners.get() && reactContext.hasActiveReactInstance()) {
            val params = com.facebook.react.bridge.Arguments.createMap().apply {
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("UserActivityDetected", params)
        }
    }
    
    // Setup touch detection on the activity
    private fun setupActivityTracking() {
        val currentActivity = currentActivity ?: return
        
        mainHandler.post {
            try {
                // Get the root view
                val rootView = currentActivity.window.decorView.findViewById<ViewGroup>(android.R.id.content)
                
                // Add a touch listener to the root view
                rootView.setOnTouchListener { _, event -> 
                    if (event.action == MotionEvent.ACTION_DOWN) {
                        emitUserActivityEvent()
                    }
                    false // Don't consume the event
                }
                
                // Also listen for layout changes (for scrolling detection)
                rootView.viewTreeObserver.addOnScrollChangedListener(ViewTreeObserver.OnScrollChangedListener {
                    emitUserActivityEvent()
                })
                
                // Create a custom activity touch interceptor
                currentActivity.window.callback = TouchInterceptorCallback(
                    currentActivity.window.callback,
                    this::emitUserActivityEvent
                )
                
                initialized.set(true)
            } catch (e: Exception) {
                // Log error but don't crash
                println("Error setting up activity tracking: ${e.message}")
            }
        }
    }
    
    // Lifecycle methods
    override fun onHostResume() {
        if (!initialized.get()) {
            setupActivityTracking()
        }
        // Also count resuming the app as user activity
        emitUserActivityEvent()
    }
    
    override fun onHostPause() {
        // No action needed
    }
    
    override fun onHostDestroy() {
        // Clean up if needed
    }
    
    // Helper class to intercept window callbacks
    private class TouchInterceptorCallback(
        private val originalCallback: android.view.Window.Callback,
        private val onUserActivity: () -> Unit
    ) : android.view.Window.Callback by originalCallback {
        
        override fun dispatchTouchEvent(event: MotionEvent): Boolean {
            if (event.action == MotionEvent.ACTION_DOWN) {
                onUserActivity()
            }
            return originalCallback.dispatchTouchEvent(event)
        }
    }
}
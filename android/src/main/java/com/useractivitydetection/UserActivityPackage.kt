// UserActivityPackage.kt

package com.useractivitydetection  // ✅ Update this

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class UserActivityPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(UserActivityModule(reactContext))  // ✅ Assuming class name is correct
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()  // ✅ Cleaner than Collections.emptyList()
    }
}

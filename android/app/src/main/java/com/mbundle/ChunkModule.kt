package com.mbundle

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ChunkModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "ChunkModule"
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun loadChunk(moduleId: String) {
        val context = this.reactApplicationContext
        val catalystInstance = context.catalystInstance
        val assetName = ("chunk-$moduleId").toString() + "-plain.bundle"

        val isExist = context.resources.assets.list("")?.asList()?.contains(assetName)

        if (isExist == true) {
            Log.i("ChunkModule", "start loadScriptFromAssets")
            catalystInstance.loadScriptFromAssets(context.assets, "assets://$assetName", true)
            Log.i("ChunkModule", "sync done loadScriptFromAssets")
        }
    }
}
package com.ampeco

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.util.Base64
import android.util.TypedValue
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.ByteArrayOutputStream
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.max
import kotlin.math.roundToInt

class ClusterBadgeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val countCache = ConcurrentHashMap<Int, String>()
  private val pinCache = ConcurrentHashMap<String, String>()

  override fun getName(): String = "ClusterBadgeModule"

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getBadgeUri(count: Double): String {
    val key = max(2, count.toInt())
    countCache[key]?.let { return it }
    val uri = renderCluster(key)
    countCache[key] = uri
    return uri
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getPinUri(label: String): String {
    pinCache[label]?.let { return it }
    val uri = renderPin(label)
    pinCache[label] = uri
    return uri
  }

  private fun formatCount(count: Int): String {
    if (count >= 1000) {
      val n = (count / 100.0).roundToInt() / 10.0
      return if (n == n.toInt().toDouble()) "${n.toInt()}k" else "${n}k"
    }
    return count.toString()
  }

  private fun dp(value: Float): Float =
    TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      value,
      reactContext.resources.displayMetrics,
    )

  private fun toDataUri(bitmap: Bitmap): String {
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    bitmap.recycle()
    val b64 = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    return "data:image/png;base64,$b64"
  }

  private fun renderCluster(count: Int): String {
    val label = formatCount(count)
    val sizeDp =
      when {
        count >= 1000 -> 52f
        count >= 100 -> 48f
        count >= 10 -> 40f
        else -> 36f
      }
    val size = dp(sizeDp).roundToInt().coerceAtLeast(1)
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val halo = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.argb(72, 14, 96, 195)
      style = Paint.Style.FILL
    }
    val ring = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.rgb(17, 17, 17)
      style = Paint.Style.FILL
    }
    val core = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.rgb(14, 96, 195)
      style = Paint.Style.FILL
    }
    val cx = size / 2f
    val cy = size / 2f
    canvas.drawCircle(cx, cy, size / 2f, halo)
    canvas.drawCircle(cx, cy, size / 2f - dp(3f), ring)
    canvas.drawCircle(cx, cy, size / 2f - dp(5.5f), core)

    val fontSp =
      when {
        count >= 1000 -> 14f
        count >= 100 -> 15f
        count >= 10 -> 16f
        else -> 17f
      }
    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      textSize = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_SP,
        fontSp,
        reactContext.resources.displayMetrics,
      )
      textAlign = Paint.Align.CENTER
    }
    val textY = cy - (textPaint.descent() + textPaint.ascent()) / 2f
    canvas.drawText(label, cx, textY, textPaint)

    return toDataUri(bitmap)
  }

  private fun renderPin(label: String): String {
    val body = BitmapFactory.decodeResource(reactContext.resources, R.drawable.pin_body)
      ?: return ""

    // Keep in sync with src/features/map/pinIconLayout.ts
    val width = dp(56f).roundToInt().coerceAtLeast(1)
    val pinHeight = (width * (370f / 300f)).roundToInt()
    val labelGap = dp(3f).roundToInt()
    val labelBoxHeight = dp(15f).roundToInt()
    val totalHeight = pinHeight + labelGap + labelBoxHeight
    val fontSize = dp(9f)

    val scaled = Bitmap.createScaledBitmap(body, width, pinHeight, true)
    if (scaled !== body) {
      body.recycle()
    }

    val bitmap = Bitmap.createBitmap(width, totalHeight, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    canvas.drawBitmap(scaled, 0f, 0f, null)
    scaled.recycle()

    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      textSize = fontSize
      textAlign = Paint.Align.CENTER
    }
    val textWidth = textPaint.measureText(label)
    val boxWidth = minOf(width - dp(4f), maxOf(textWidth + dp(10f), dp(22f)))
    val boxLeft = (width - boxWidth) / 2f
    val boxTop = (pinHeight + labelGap).toFloat()
    val boxRect = android.graphics.RectF(boxLeft, boxTop, boxLeft + boxWidth, boxTop + labelBoxHeight)

    val softBg = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.argb(46, 0, 0, 0)
      style = Paint.Style.FILL
    }
    canvas.drawRoundRect(
      android.graphics.RectF(
        boxRect.left - dp(2f),
        boxRect.top - dp(1.5f),
        boxRect.right + dp(2f),
        boxRect.bottom + dp(1.5f),
      ),
      dp(5f),
      dp(5f),
      softBg,
    )

    val boxPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.argb(235, 17, 17, 17)
      style = Paint.Style.FILL
    }
    canvas.drawRoundRect(boxRect, dp(4f), dp(4f), boxPaint)

    val textY = boxRect.centerY() - (textPaint.descent() + textPaint.ascent()) / 2f
    canvas.drawText(label, width / 2f, textY, textPaint)

    return toDataUri(bitmap)
  }
}

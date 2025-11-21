package expo.modules.smsreader

import android.content.Context
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmsReaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsReader")

    Function("getSms") { limit: Int ->
      val context = appContext.reactContext ?: return@Function emptyList<Map<String, String>>()
      val smsList = mutableListOf<Map<String, String>>()
      val uri = Uri.parse("content://sms/inbox")
      val projection = arrayOf("_id", "address", "date", "body")
      
      val cursor = context.contentResolver.query(
        uri,
        projection,
        null,
        null,
        "date DESC LIMIT $limit"
      )

      cursor?.use {
        val idIndex = it.getColumnIndex("_id")
        val addressIndex = it.getColumnIndex("address")
        val dateIndex = it.getColumnIndex("date")
        val bodyIndex = it.getColumnIndex("body")

        while (it.moveToNext()) {
          val sms = mapOf(
            "id" to it.getString(idIndex),
            "address" to it.getString(addressIndex),
            "date" to it.getString(dateIndex),
            "body" to it.getString(bodyIndex)
          )
          smsList.add(sms)
        }
      }
      
      return@Function smsList
    }
  }
}

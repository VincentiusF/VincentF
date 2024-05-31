import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.budiyev.android.codescanner.*
import com.google.zxing.BarcodeFormat

class MainActivity : AppCompatActivity() {
    private lateinit var codeScanner: CodeScanner
    private lateinit var resultTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        resultTextView = findViewById(R.id.resultTextView)
        val scanButton: Button = findViewById(R.id.scanButton)
        val absenButton: Button = findViewById(R.id.absenButton)

        scanButton.setOnClickListener {
            startScanning()
        }

        absenButton.setOnClickListener {
            val barcodeData = resultTextView.text.toString()
            if (barcodeData.isNotBlank()) {
                val employee = checkBarcode(barcodeData)
                if (employee != null) {
                    if (!checkAttendance(employee.name)) {
                        saveAttendance(employee.name)
                        resultTextView.text = "Absensi berhasil: ${employee.name}"
                    } else {
                        resultTextView.text = "Karyawan ini sudah melakukan absensi hari ini."
                    }
                } else {
                    resultTextView.text = "Barcode tidak valid."
                }
            } else {
                resultTextView.text = "Harap scan barcode karyawan terlebih dahulu."
            }
        }
    }

    private fun startScanning() {
        codeScanner = CodeScanner(this, findViewById(R.id.scanContainer))
        codeScanner.camera = CodeScanner.CAMERA_BACK
        codeScanner.formats = listOf(BarcodeFormat.QR_CODE)
        codeScanner.autoFocusMode = AutoFocusMode.SAFE
        codeScanner.scanMode = ScanMode.SINGLE
        codeScanner.isAutoFocusEnabled = true
        codeScanner.isFlashEnabled = false

        codeScanner.decodeCallback = DecodeCallback {
            runOnUiThread {
                resultTextView.text = it.text
            }
        }

        codeScanner.errorCallback = ErrorCallback {
            runOnUiThread {
                resultTextView.text = "Terjadi kesalahan: ${it.message}"
            }
        }

        findViewById<TextView>(R.id.resultTextView).text = ""
        codeScanner.startPreview()
    }

    private fun checkBarcode(barcode: String): Employee? {
        val employees = arrayListOf(
            Employee("123456", "John Doe"),
            Employee("234567", "Jane Doe"),
            Employee("345678", "Alice Smith"),
            Employee("456789", "Bob Smith")
        )

        return employees.find { it.barcode == barcode }
    }

    private fun checkAttendance(employeeName: String): Boolean {
        val attendanceList = getAttendanceList()
        val today = getCurrentDate()
        return attendanceList.any { it.name == employeeName && it.date == today }
    }

    private fun saveAttendance(employeeName: String) {
        val attendanceList = getAttendanceList()
        val today = getCurrentDate()
        attendanceList.add(Attendance(employeeName, today))
        saveAttendanceList(attendanceList)
    }

    private fun getAttendanceList(): ArrayList<Attendance> {
        val attendanceJson = getSharedPreferences("ATTENDANCE", MODE_PRIVATE).getString("ATTENDANCE_LIST", "[]")
        return Gson().fromJson(attendanceJson, object : TypeToken<ArrayList<Attendance>>() {}.type)
    }

    private fun saveAttendanceList(attendanceList: ArrayList<Attendance>) {
        val attendanceJson = Gson().toJson(attendanceList)
        getSharedPreferences("ATTENDANCE", MODE_PRIVATE).edit().putString("ATTENDANCE_LIST", attendanceJson).apply()
    }

    private fun getCurrentDate(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }
}

data class Employee(val barcode: String, val name: String)
data class Attendance(val name: String, val date: String)

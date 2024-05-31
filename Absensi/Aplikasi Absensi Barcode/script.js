// Data absensi karyawan
let dataAbsensi = [];

// Fungsi untuk melakukan absensi
function absen(event) {
    event.preventDefault();
    
    const barcode = document.getElementById('barcode').value;

    // Cek apakah barcode karyawan valid
    const karyawan = cekBarcode(barcode);
    if (!karyawan) {
        alert('Barcode tidak valid.');
        return false;
    }

    // Cek apakah karyawan sudah melakukan absen pada hari yang sama
    const today = new Date().toISOString().slice(0, 10);
    const sudahAbsen = dataAbsensi.some(absen => absen.nama === karyawan.nama && absen.tanggal === today);
    if (sudahAbsen) {
        alert('Karyawan ini sudah melakukan absensi hari ini.');
        return false;
    }

    // Tambahkan data absensi ke array
    dataAbsensi.push({
        nama: karyawan.nama,
        jamMasuk: karyawan.jamMasuk,
        tanggal: today
    });

    // Simpan data absensi ke database
    simpanKeDatabase(karyawan.nama, karyawan.jamMasuk, today);

    // Tampilkan pesan berhasil
    alert('Absensi berhasil!');

    // Kosongkan field input
    document.getElementById('barcode').value = '';

    // Cetak data absensi ke console (untuk pengujian)
    console.clear();
    console.log('Data Absensi Karyawan:');
    console.table(dataAbsensi);

    return false;
}

// Fungsi untuk mengecek barcode karyawan
function cekBarcode(barcode) {
    // Simulasi database karyawan dengan barcode
    const databaseKaryawan = [
        { barcode: '123456', nama: 'John Doe', jamMasuk: '08:00' },
        { barcode: '234567', nama: 'Jane Doe', jamMasuk: '08:30' },
        { barcode: '345678', nama: 'Alice Smith', jamMasuk: '09:00' },
        { barcode: '456789', nama: 'Bob Smith', jamMasuk: '09:30' }
    ];

    // Cari karyawan berdasarkan barcode
    const karyawan = databaseKaryawan.find(karyawan => karyawan.barcode === barcode);
    return karyawan;
}

// Fungsi untuk menyimpan data absensi ke database (simulasi)
function simpanKeDatabase(nama, jamMasuk, tanggal) {
    // Simulasi menyimpan data ke database
    // Di sini kamu dapat menggunakan metode yang sesuai dengan kebutuhan aplikasimu,
    // seperti mengirim data ke backend atau menyimpan ke local storage.
    // Contoh sederhana ini hanya untuk tujuan demonstrasi.
    const data = {
        nama: nama,
        jamMasuk: jamMasuk,
        tanggal: tanggal
    };

    // Simpan ke local storage
    let absensi = JSON.parse(localStorage.getItem('absensi')) || [];
    absensi.push(data);
    localStorage.setItem('absensi', JSON.stringify(absensi));
}

// Tambahkan event listener untuk form absensi
document.getElementById('form').addEventListener('submit', absen);

// Konfigurasi JSQR untuk membaca barcode
let video = document.createElement("video");
let canvasElement = document.getElementById("canvas");
let loadingMessage = document.getElementById("loadingMessage");
let outputContainer = document.getElementById("output");
let outputMessage = document.getElementById("outputMessage");
let outputData = document.getElementById("outputData");

function drawLine(begin, end, color) {
    let canvas = canvasElement.getContext("2d");
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
});

function tick() {
    loadingMessage.innerText = "⌛ Loading video..."
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        loadingMessage.hidden = true;
        canvasElement.hidden = false;
        outputContainer.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        let canvas = canvasElement.getContext("2d");
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        if (code) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
            outputMessage.hidden = true;
            outputData.parentElement.hidden = false;
            outputData.innerText = code.data;
            document.getElementById('barcode').value = code.data;
        } else {
            outputMessage.hidden = false;
            outputData.parentElement.hidden = true;
        }
    }
    requestAnimationFrame(tick);
}

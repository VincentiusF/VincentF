let dataAbsensi =[];

function absen(event) {
    event.preventDefault();

    const nama = document.getElementById('nama').value;
    const jamMasuk = document.getElementById('jamMasuk').value;

    const validasiJam = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if(!validasiJam.test(jamMasuk)) {
        alert('Format jam masuk tidak valid. Gunakan format HH:MM (24 jam).');
        return false;
    }

    const today = new Date().toISOString().slice(0,10);
    const sudahAbsen = dataAbsensi.some(absen=>absen.nama === nama&&absen.tanggal === today);
    if(sudahAbsen) {
        alert("Karyawan ini sudah absen");
        return false;
    }

    dataAbsensi.push({
        nama:nama,
        jamMasuk:jamMasuk,
        tanggal:today
    });

    alert("Absensi berhasil");

    document.getElementById('nama').value = '';
    document.getElementById('jamMasuk').value = '';

    console.clear();
    console.log('Data Absensi Karyawan');
    console.table(dataAbsensi);

    return false;
}

function simpanKeDatabase(nama,jamaMasuk,tanggal) {
    const data = {
        nama:nama,
        jamaMasuk:jamaMasuk,
        tanggal:tanggal
    };

    let absensi = JSON.parse(localStorage.getItem('absensi')) || [];
    absensi.push(data);
    localStorage.setItem('absensi', JSON.stringify(absensi));
}

document.getElementById('form').addEventListener('submit',absen);
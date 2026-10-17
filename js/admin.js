import { db } from './firebase.js';
import { collection, onSnapshot, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const loginAdminArea = document.getElementById('login-admin');
const dashboardAdminArea = document.getElementById('dashboard-admin');
const inputKey = document.getElementById('input-key');
const btnLoginAdmin = document.getElementById('btn-login-admin');
const btnLogoutAdmin = document.getElementById('btn-logout-admin');
const errorKey = document.getElementById('error-key');

// ==========================================
// LOGIKA LOGIN ADMIN
// ==========================================
btnLoginAdmin.addEventListener('click', async () => {
    const keyMasuk = inputKey.value.trim();
    
    if (!keyMasuk) {
        errorKey.innerText = "Kunci rahasia tidak boleh kosong!";
        errorKey.classList.remove('hidden');
        return;
    }

    try {
        btnLoginAdmin.innerText = "Memeriksa Sandi...";
        btnLoginAdmin.disabled = true;
        errorKey.classList.add('hidden');

        // Tarik kunci dari Firestore
        const docRef = doc(db, "settings", "config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const adminKeyFirebase = docSnap.data().adminKey; 

            if (keyMasuk === adminKeyFirebase) {
                // BERHASIL MASUK
                loginAdminArea.classList.add('hidden');
                dashboardAdminArea.classList.remove('hidden');
                inputKey.value = ""; 
                mulaiTarikData(); // Panggil fungsi grafik
            } else {
                errorKey.innerText = "Kunci yang kamu masukkan salah!";
                errorKey.classList.remove('hidden');
            }
        } else {
            errorKey.innerText = "Error: Pengaturan kunci belum dibuat di Firebase!";
            errorKey.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Gagal login:", error);
        errorKey.innerText = "Gagal terhubung ke database. Cek koneksi internet.";
        errorKey.classList.remove('hidden');
    } finally {
        btnLoginAdmin.innerText = "Buka Dashboard";
        btnLoginAdmin.disabled = false;
    }
});

// ==========================================
// LOGIKA LOGOUT
// ==========================================
btnLogoutAdmin.addEventListener('click', () => {
    dashboardAdminArea.classList.add('hidden');
    loginAdminArea.classList.remove('hidden');
});

// ==========================================
// LOGIKA UPLOAD MASSAL TOKEN
// ==========================================
const inputMassal = document.getElementById('input-massal');
const btnUploadToken = document.getElementById('btn-upload-token');
const uploadStatus = document.getElementById('upload-status');

if (btnUploadToken) {
    btnUploadToken.addEventListener('click', async () => {
        const teks = inputMassal.value.trim();
        if (!teks) {
            uploadStatus.innerText = "Kotak teks masih kosong! Silakan paste token dari Excel.";
            uploadStatus.style.color = "#dc3545";
            return;
        }

        const daftarToken = teks.split('\n').map(t => t.trim()).filter(t => t !== "");
        const yakin = confirm(`Ditemukan ${daftarToken.length} token. Yakin ingin mengunggahnya ke database?`);
        if (!yakin) return;

        btnUploadToken.innerText = "Mengunggah... ⏳";
        btnUploadToken.disabled = true;
        uploadStatus.innerText = "";

        try {
            let berhasil = 0;
            for (const token of daftarToken) {
                await addDoc(collection(db, "tokens"), {
                    kode: token,
                    isUsed: false
                });
                berhasil++;
            }
            uploadStatus.innerText = `Sukses! ${berhasil} token berhasil dimasukkan ke database.`;
            uploadStatus.style.color = "#28a745";
            inputMassal.value = ""; 
        } catch (error) {
            console.error("Gagal upload token:", error);
            uploadStatus.innerText = "Terjadi kesalahan sistem saat mengunggah token.";
            uploadStatus.style.color = "#dc3545";
        } finally {
            btnUploadToken.innerText = "Upload Semua Token";
            btnUploadToken.disabled = false;
        }
    });
}

// ==========================================
// LOGIKA GRAFIK CHART.JS
// ==========================================
const ctx = document.getElementById('voteChart').getContext('2d');
let voteChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Paslon 1', 'Paslon 2', 'Paslon 3'],
        datasets: [{
            label: 'Jumlah Suara',
            data: [0, 0, 0],
            backgroundColor: ['#007bff', '#28a745', '#dc3545'],
            borderWidth: 1
        }]
    },
    options: { responsive: true }
});

const totalSuaraDisplay = document.getElementById('total-suara');

function mulaiTarikData() {
    onSnapshot(collection(db, "votes"), (snapshot) => {
        let suara1 = 0, suara2 = 0, suara3 = 0;
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.paslon === "1") suara1++;
            if (data.paslon === "2") suara2++;
            if (data.paslon === "3") suara3++;
        });

        totalSuaraDisplay.innerText = (suara1 + suara2 + suara3);
        voteChart.data.datasets[0].data = [suara1, suara2, suara3];
        voteChart.update();
    });
}

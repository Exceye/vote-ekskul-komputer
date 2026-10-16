// Import koneksi database dari firebase.js yang sudah kita buat
import { db } from './firebase.js';
// Import fungsi Firestore untuk mencari data
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Mengambil elemen-elemen dari HTML
const btnLogin = document.getElementById('btn-login');
const loginSection = document.getElementById('login-section');
const voteSection = document.getElementById('vote-section');
const errorMsg = document.getElementById('login-error');
const welcomeMsg = document.getElementById('welcome-msg');
const inputNama = document.getElementById('input-nama');
const inputToken = document.getElementById('input-token');

// Fungsi untuk menampilkan pesan error
function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove('hidden');
}

// Aksi ketika tombol Login diklik
btnLogin.addEventListener('click', async () => {
    const nama = inputNama.value.trim();
    const token = inputToken.value.trim();

    // Cek apakah kolom kosong
    if (!nama || !token) {
        showError("Nama dan token harus diisi!");
        return;
    }

    try {
        // Ubah teks tombol agar terlihat sedang memproses
        btnLogin.innerText = "Mengecek Token...";
        btnLogin.disabled = true;

        // Mencari token di koleksi "tokens" di Firestore
        const q = query(collection(db, "tokens"), where("kode", "==", token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showError("Token tidak ditemukan atau salah!");
        } else {
            // Jika token ketemu, kita cek statusnya
            let tokenData;
            let tokenId;
            querySnapshot.forEach((doc) => {
                tokenData = doc.data();
                tokenId = doc.id; // ID unik dokumen di Firestore
            });

            if (tokenData.isUsed) {
                showError("Maaf, token ini sudah digunakan untuk memilih!");
            } else {
                // TOKEN VALID & BISA DIPAKAI
                // Simpan sesi sementara di browser
                sessionStorage.setItem('voterName', nama);
                sessionStorage.setItem('tokenId', tokenId);

                // Sembunyikan form login, tampilkan area voting
                loginSection.classList.add('hidden');
                voteSection.classList.remove('hidden');
                welcomeMsg.innerText = `Selamat datang, ${nama}!`;
                errorMsg.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error(error);
        showError("Terjadi kesalahan koneksi ke database.");
    } finally {
        // Kembalikan tombol seperti semula
        btnLogin.innerText = "Masuk & Mulai Vote";
        btnLogin.disabled = false;
    }
});

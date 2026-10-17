import { db } from './firebase.js';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
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

//PERUBAHAN
// --- 4. LOGIKA TAMPILAN KARTU PASLON ---

// Database lokal untuk teks dan foto
const dataPaslon = {
    "1": {
        nama: "Paslon 1: Nama Ketua & Wakil",
        visimisi: "Memfokuskan ekskul pada fundamental web development (HTML, CSS, JS) serta eksplorasi UI/UX responsif.",
        foto: "assets/paslon1.png"
    },
    "2": {
        nama: "Paslon 2: Nama Ketua & Wakil",
        visimisi: "Membentuk divisi khusus pembuatan game 2D berbasis browser, lengkap dengan mekanik dan audio visual efek.",
        foto: "assets/paslon2.png"
    },
    "3": {
        nama: "Paslon 3: Nama Ketua & Wakil",
        visimisi: "Menyelenggarakan program bootcamp intensif dan memfasilitasi kolaborasi proyek tim menggunakan GitHub.",
        foto: "assets/paslon3.png"
    }
};

// Ambil elemen-elemen UI
const boxes = document.querySelectorAll('.box');
const displayNama = document.getElementById('display-nama');
const displayVisiMisi = document.getElementById('display-visimisi');
const displayFoto = document.getElementById('display-foto');
const btnVoteMain = document.getElementById('btn-vote-main');

// Fungsi saat kotak pilihan dipencet
boxes.forEach(box => {
    box.addEventListener('click', (e) => {
        // Hapus warna biru dari semua kotak
        boxes.forEach(b => b.classList.remove('active'));
        // Tambahkan warna biru ke kotak yang sedang diklik
        e.target.classList.add('active');

        // Ambil nomor paslon dari kotak
        const targetId = e.target.getAttribute('data-target');
        const paslon = dataPaslon[targetId];

        // Ubah isi layar utama sesuai nomor paslon
        displayNama.innerText = paslon.nama;
        displayVisiMisi.innerHTML = `<strong>Visi & Misi:</strong><br>${paslon.visimisi}`;
        displayFoto.src = paslon.foto;
        
        // Ubah target tombol VOTE
        btnVoteMain.innerText = `VOTE PASLON ${targetId}`;
        btnVoteMain.setAttribute('data-paslon', targetId);
    });
});

// Perbarui logika klik tombol VOTE UTAMA
// (Gantikan kode btnVotes.forEach lama dengan ini)
btnVoteMain.addEventListener('click', async (e) => {
    const paslonPilihan = e.target.getAttribute('data-paslon');
    const tokenId = sessionStorage.getItem('tokenId');

    const yakin = confirm(`Kamu yakin ingin memberikan suara untuk Paslon ${paslonPilihan}?`);
    if (!yakin) return;

    try {
        // Tampilkan loading
        document.querySelector('.paslon-card').innerHTML = `<h3 style="color: #007bff; padding: 40px 0;">Memproses suara... ⏳</h3>`;
        document.querySelector('.bottom-selector').classList.add('hidden');
        document.getElementById('btn-logout').classList.add('hidden');

        // SIMPAN SUARA KE FIRESTORE (Koleksi 'votes')
        await addDoc(collection(db, "votes"), {
            paslon: paslonPilihan,
            waktu: serverTimestamp()
        });

        // UBAH STATUS TOKEN JADI TERPAKAI
        const tokenRef = doc(db, "tokens", tokenId);
        await updateDoc(tokenRef, { isUsed: true });

        // Tunggu 3 detik, lalu berhasil
        setTimeout(() => {
            alert("Terima kasih! Suaramu berhasil direkam.");
            sessionStorage.clear(); // Hapus sesi
            window.location.reload(); // Refresh halaman (Auto-logout)
        }, 3000);

    } catch (error) {
        console.error("Gagal mengirim suara:", error); // Cek Inspect Element > Console jika masih error
        alert("Terjadi kesalahan sistem. Coba cek internetmu.");
    }
});

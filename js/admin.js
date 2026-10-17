import { db } from './firebase.js';
// Kita gunakan onSnapshot untuk Live Data
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Siapkan Grafik menggunakan Chart.js
const ctx = document.getElementById('voteChart').getContext('2d');
let voteChart = new Chart(ctx, {
    type: 'pie', // Tipe grafik lingkaran
    data: {
        labels: ['Paslon 1', 'Paslon 2', 'Paslon 3'],
        datasets: [{
            label: 'Jumlah Suara',
            data: [0, 0, 0], // Data awal
            backgroundColor: ['#007bff', '#28a745', '#dc3545'],
            borderWidth: 1
        }]
    },
    options: { responsive: true }
});

const totalSuaraDisplay = document.getElementById('total-suara');

// Tarik data secara REALTIME dari koleksi 'votes'
onSnapshot(collection(db, "votes"), (snapshot) => {
    let suara1 = 0, suara2 = 0, suara3 = 0;
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.paslon === "1") suara1++;
        if (data.paslon === "2") suara2++;
        if (data.paslon === "3") suara3++;
    });

    // Update total suara
    const total = suara1 + suara2 + suara3;
    totalSuaraDisplay.innerText = total;

    // Update data grafik
    voteChart.data.datasets[0].data = [suara1, suara2, suara3];
    voteChart.update(); // Minta grafik menggambar ulang
});

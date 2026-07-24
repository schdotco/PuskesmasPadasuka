// Import Firebase dari CDN Google (Versi Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// TAMBAHAN: Import Realtime Database untuk mengecek Role
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Konfigurasi Firebase Project Anda
const firebaseConfig = {
    apiKey: "AIzaSyCVldfmqyfy2y4c695qyjPagVbir0LnoZw",
    authDomain: "assetpdsk.firebaseapp.com",
    databaseURL: "https://assetpdsk-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "assetpdsk",
    storageBucket: "assetpdsk.firebasestorage.app",
    messagingSenderId: "808070903178",
    appId: "1:808070903178:web:93b279880c01372f71c473",
    measurementId: "G-LWGLJ00M3C"
};

// Inisialisasi Firebase, Auth, dan Database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ----------------------------------------------------
// UI INTERACTION LOGIC (Mata Password)
// ----------------------------------------------------
document.querySelector('#togglePassword').addEventListener('click', function () {
    const passwordInput = document.querySelector('#password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// ----------------------------------------------------
// FIREBASE AUTHENTICATION & REDIRECT LOGIC
// ----------------------------------------------------
const loginForm = document.getElementById('loginForm');
const btnLogin = document.getElementById('btnLogin');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Set status tombol loading
    btnLogin.disabled = true;
    btnText.innerHTML = 'Memproses...';
    btnIcon.className = 'fa-solid fa-circle-notch fa-spin';

    // Konfigurasi Session (Ingat Saya)
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;

    setPersistence(auth, persistenceType)
        .then(() => {
            // 1. Eksekusi Login ke Authentication
            return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
            // 2. Jika login berhasil, ambil UID User
            const user = userCredential.user;
            
            // 3. Cari data user ini di Realtime Database untuk melihat Role-nya
            const dbRef = ref(db);
            return get(child(dbRef, `users/${user.uid}`));
        })
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userRole = userData.role; // Ambil nilai Role dari database

                // Notifikasi Sukses
                Swal.fire({
                    icon: 'success',
                    title: 'Akses Diberikan',
                    text: `Selamat datang, ${userData.nama || 'Pengguna'}!`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    
// -------------------------------------------------
// LOGIKA REDIRECT BERDASARKAN ROLE
// -------------------------------------------------
switch(userRole) {
    case 'admin':
        // Arahkan ke halaman Admin
        window.location.href = 'admin-user.html';
        break;
        
    case 'user1':
        // Arahkan ke Dashboard untuk User 1
        window.location.href = 'dashboard-user1.html';
        break;
        
    case 'user2':
        // Arahkan ke Dashboard untuk User 2
        window.location.href = 'dashboard-user2.html';
        break;
        
    case 'user3':
        // Arahkan ke Dashboard untuk User 3
        window.location.href = 'dashboard-user3.html';
        break;
        
    case 'user4':
        // Arahkan ke Dashboard untuk User 4
        window.location.href = 'dashboard-user4.html';
        break;
        
    case 'user5':
        // Arahkan ke Dashboard untuk User 5
        window.location.href = 'dashboard-user5.html';
        break;
        
    default:
        // Jika role tidak dikenali atau kosong
        Swal.fire('Error', 'Peran (Role) tidak dikenali oleh sistem.', 'error');
        auth.signOut(); // Paksa logout
        resetButton();
}
                    
                });

            } else {
                // Kasus langka: Punya akun Auth tapi tidak ada di Database Users
                Swal.fire('Data Tidak Lengkap', 'Akun Anda belum dikonfigurasi dengan peran (Role) yang valid.', 'warning');
                auth.signOut(); // Paksa logout
                resetButton();
            }
        })
        .catch((error) => {
            // JIKA GAGAL LOGIN
            let errorMessage = 'Gagal terhubung ke server.';
            
            if(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Email atau Kata Sandi Anda salah!';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Terlalu banyak percobaan. Coba lagi nanti.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Format Email tidak valid.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: errorMessage,
                confirmButtonColor: '#059669'
            });

            resetButton();
        });
});

// Fungsi untuk mengembalikan tombol ke keadaan semula
function resetButton() {
    btnLogin.disabled = false;
    btnText.innerHTML = 'Masuk';
    btnIcon.className = 'fa-solid fa-arrow-right-to-bracket';
}

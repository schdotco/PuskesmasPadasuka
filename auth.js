// Import Firebase dari CDN Google (Versi Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// Inisialisasi Firebase & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ----------------------------------------------------
// UI INTERACTION LOGIC
// ----------------------------------------------------

// Fitur Tampilkan/Sembunyikan Password
document.querySelector('#togglePassword').addEventListener('click', function () {
    const passwordInput = document.querySelector('#password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});


// ----------------------------------------------------
// FIREBASE AUTHENTICATION LOGIC
// ----------------------------------------------------

// Tangkap Elemen Form
const loginForm = document.getElementById('loginForm');
const btnLogin = document.getElementById('btnLogin');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Mencegah reload halaman
    
    let email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Trik NIP ke Email untuk kompatibilitas Firebase
    if (!email.includes('@')) {
        email = email + '@padasuka.go.id';
    }

    // Set Loading State pada Tombol
    btnLogin.disabled = true;
    btnText.innerHTML = 'Memproses...';
    btnIcon.className = 'fa-solid fa-circle-notch fa-spin';

    // Konfigurasi Session (Ingat Saya)
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;

    setPersistence(auth, persistenceType)
        .then(() => {
            // Eksekusi Login ke Firebase
            return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
            // JIKA BERHASIL LOGIN
            Swal.fire({
                icon: 'success',
                title: 'Akses Diberikan',
                text: 'Selamat datang di Sistem Asset Puskesmas!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Arahkan ke halaman utama/dashboard
                window.location.href = 'dashboard.html'; 
            });
        })
        .catch((error) => {
            // JIKA GAGAL LOGIN
            let errorMessage = 'Gagal terhubung ke server.';
            
            if(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Email/NIP atau Kata Sandi Anda salah!';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Terlalu banyak percobaan. Coba lagi nanti.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Format Email/NIP tidak valid.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: errorMessage,
                confirmButtonColor: '#059669'
            });

            // Reset tombol ke keadaan awal
            btnLogin.disabled = false;
            btnText.innerHTML = 'Masuk';
            btnIcon.className = 'fa-solid fa-arrow-right-to-bracket';
        });
});

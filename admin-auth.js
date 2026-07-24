// Import Firebase Modular (V10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

// =========================================================================
// TRIK CANGGIH: INISIALISASI 2 APLIKASI FIREBASE DI 1 HALAMAN
// =========================================================================

// 1. App Utama (Untuk mempertahankan sesi Login Admin)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 2. App Kedua (MESIN KHUSUS PEMBUAT AKUN - Agar Admin tidak ter-logout)
const secondaryApp = initializeApp(firebaseConfig, "MesinPembuatAkun");
const secondaryAuth = getAuth(secondaryApp);

// =========================================================================

// PROTEKSI HALAMAN (HANYA ADMIN YANG BOLEH BUKA)
onAuthStateChanged(auth, (user) => {
    if (user) {
        const dbRef = ref(db);
        get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.role !== 'admin') {
                    Swal.fire('Akses Ditolak', 'Anda bukan Administrator!', 'error').then(() => {
                        window.location.href = 'login.html';
                    });
                }
            } else {
                window.location.href = 'login.html';
            }
        });
    } else {
        window.location.href = 'login.html';
    }
});


// LOGIKA TAMBAH PENGGUNA TANPA LOGOUT
document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    let nip = document.getElementById('nip').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const btnSubmit = document.getElementById('btnSubmit');
    
    // Konversi NIP ke Email
    const email = nip + '@padasuka.go.id';

    Swal.fire({
        title: 'Konfirmasi',
        text: `Apakah Anda yakin ingin membuat akun untuk ${nama}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#059669',
        confirmButtonText: 'Ya, Buat Akun!'
    }).then((result) => {
        if (result.isConfirmed) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = 'Menyimpan...';

            // KUNCI PERUBAHAN: Gunakan 'secondaryAuth' BUKAN 'auth' utama
            createUserWithEmailAndPassword(secondaryAuth, email, password)
                .then((userCredential) => {
                    const newUser = userCredential.user;

                    // Setelah akun dibuat, segera 'logout' dari secondary app 
                    // agar mesin bersih untuk pembuatan akun berikutnya.
                    signOut(secondaryAuth);

                    // Simpan data Role ke Database menggunakan App Utama (yang login sebagai admin)
                    return set(ref(db, 'users/' + newUser.uid), {
                        nama: nama,
                        email: email,
                        nip: nip,
                        role: role,
                        created_at: new Date().toISOString()
                    });
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Akun berhasil dibuat. Anda BISA langsung menambah akun lain.'
                    });
                    
                    // Reset Form
                    document.getElementById('addUserForm').reset();
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = 'Simpan Pengguna';
                    
                    // TIDAK ADA LAGI SCRIPT REDIRECT KE HALAMAN LOGIN! Admin tetap bisa di halaman ini.
                })
                .catch((error) => {
                    let msg = error.message;
                    if(error.code === 'auth/email-already-in-use') msg = 'NIP/Email tersebut sudah terdaftar!';
                    
                    Swal.fire('Gagal', msg, 'error');
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = 'Simpan Pengguna';
                });
        }
    });
});

// FUNGSI LOGOUT ADMIN
document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    });
});

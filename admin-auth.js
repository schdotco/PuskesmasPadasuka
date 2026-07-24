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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ----------------------------------------------------
// 1. PROTEKSI HALAMAN (HANYA ADMIN YANG BOLEH BUKA)
// ----------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Cek Role di Database
        const dbRef = ref(db);
        get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.role !== 'admin') {
                    // Jika bukan admin, tendang ke login
                    Swal.fire('Akses Ditolak', 'Anda bukan Administrator!', 'error').then(() => {
                        window.location.href = 'login.html';
                    });
                }
            } else {
                // User tidak ada di database
                window.location.href = 'login.html';
            }
        });
    } else {
        // Belum login sama sekali
        window.location.href = 'login.html';
    }
});


// ----------------------------------------------------
// 2. LOGIKA TAMBAH PENGGUNA
// ----------------------------------------------------
document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    let nip = document.getElementById('nip').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;

    const btnSubmit = document.getElementById('btnSubmit');
    
    // Konversi NIP ke format Email
    const email = nip + '@padasuka.go.id';

    // Konfirmasi sebelum menyimpan
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

            // PROSES 1: Simpan Sesi Admin Saat Ini
            // (Karena saat CreateUser, Firebase akan menimpa login saat ini dengan akun baru)
            const currentAdminUser = auth.currentUser; 
            
            // PROSES 2: Buat Akun di Authentication
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const newUser = userCredential.user;

                    // PROSES 3: Simpan Data Profil & Role di Realtime Database
                    return set(ref(db, 'users/' + newUser.uid), {
                        nama: nama,
                        email: email,
                        nip: nip,
                        role: role,
                        created_at: new Date().toISOString()
                    });
                })
                .then(() => {
                    // Berhasil! 
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Akun berhasil dibuat. Pastikan mencatat sandi sementara tersebut.'
                    });
                    document.getElementById('addUserForm').reset();
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = 'Simpan Pengguna';
                    
                    // Catatan: Karena limitasi Client SDK Firebase, Admin saat ini
                    // otomatis ter-logout dan digantikan sesi user baru. 
                    // Oleh karena itu, kita paksa kembali ke halaman login agar admin login ulang.
                    // (Untuk menghindarinya, di sistem besar biasanya menggunakan Firebase Admin SDK via Node.js Backend)
                    setTimeout(() => {
                        auth.signOut().then(() => {
                            window.location.href = 'login.html';
                        });
                    }, 3000);
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

// ----------------------------------------------------
// 3. FUNGSI LOGOUT
// ----------------------------------------------------
document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    });
});

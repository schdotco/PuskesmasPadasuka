// Import Firebase Modular (V10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// Perhatikan tambahan onValue (baca realtime) dan update (edit data) di bawah ini
import { getDatabase, ref, set, get, child, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
// INISIALISASI APLIKASI
// =========================================================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const secondaryApp = initializeApp(firebaseConfig, "MesinPembuatAkun");
const secondaryAuth = getAuth(secondaryApp);

// =========================================================================
// 1. PROTEKSI HALAMAN & LOAD DATA AWAL
// =========================================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        get(child(ref(db), `users/${user.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                if (snapshot.val().role !== 'admin') {
                    Swal.fire('Akses Ditolak', 'Anda bukan Administrator!', 'error').then(() => {
                        window.location.href = 'login.html';
                    });
                } else {
                    // Jika benar admin, panggil fungsi untuk menampilkan tabel
                    tampilkanDaftarPengguna();
                }
            } else {
                window.location.href = 'login.html';
            }
        });
    } else {
        window.location.href = 'login.html';
    }
});

// =========================================================================
// 2. MENAMPILKAN DAFTAR PENGGUNA DI TABEL (REALTIME)
// =========================================================================
function tampilkanDaftarPengguna() {
    const tableBody = document.getElementById('userTableBody');
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
        tableBody.innerHTML = ''; // Bersihkan isi tabel lama
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const uid = childSnapshot.key;
                const data = childSnapshot.val();

                // Ubah kode role menjadi nama klinik agar rapi di tabel
                let roleName = data.role;
                if(roleName === 'admin') roleName = 'Administrator';
                if(roleName === 'user1') roleName = 'Mutiara Cikutra';
                if(roleName === 'user2') roleName = 'Asri Husada I';
                if(roleName === 'user3') roleName = 'Seno Medika';
                if(roleName === 'user4') roleName = 'RSIA Al Islam';
                if(roleName === 'user5') roleName = 'Klinik Pussenif';
                if(roleName === 'user6') roleName = 'RS Santo Yusup';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${data.nama}</strong></td>
                    <td>${data.nip || '-'}</td>
                    <td><span style="background:#e5e7eb; padding:3px 8px; border-radius:12px; font-size:12px; font-weight:500;">${roleName}</span></td>
                    <td>${data.email}</td>
                    <td>
                        <button class="btn-action btn-edit-user" data-uid="${uid}" data-nama="${data.nama}" data-nip="${data.nip}" data-role="${data.role}" data-email="${data.email}">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Pasang event listener untuk semua tombol edit di tabel
            document.querySelectorAll('.btn-edit-user').forEach(btn => {
                btn.addEventListener('click', function() {
                    masukModeEdit(this.dataset);
                });
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada data pengguna.</td></tr>';
        }
    });
}

// =========================================================================
// 3. FUNGSI MASUK & KELUAR MODE EDIT (MENGUBAH TAMPILAN FORM)
// =========================================================================
function masukModeEdit(data) {
    // Ubah Judul & Tombol Form
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Profil Pengguna';
    document.getElementById('btnSubmit').innerHTML = 'Update Pengguna';
    document.getElementById('btnSubmit').style.backgroundColor = '#eab308';
    document.getElementById('btnCancelEdit').style.display = 'block';
    
    // Isi form dengan data yang ditarik dari tabel
    document.getElementById('editUid').value = data.uid;
    document.getElementById('nama').value = data.nama;
    document.getElementById('nip').value = data.nip;
    document.getElementById('role').value = data.role;
    document.getElementById('email').value = data.email;
    
    // Kunci kolom Email dan Password (karena ini hanya untuk edit profil)
    document.getElementById('email').readOnly = true;
    document.getElementById('email').style.backgroundColor = '#e5e7eb';
    document.getElementById('emailHelp').style.display = 'inline';
    
    document.getElementById('password').removeAttribute('required');
    document.getElementById('password').readOnly = true;
    document.getElementById('password').style.backgroundColor = '#e5e7eb';
    document.getElementById('password').value = '********';
    document.getElementById('passHelp').style.display = 'inline';

    // Gulir layar ke atas menuju form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tombol Batal Edit
document.getElementById('btnCancelEdit').addEventListener('click', keluarModeEdit);

function keluarModeEdit() {
    // Kembalikan Judul & Tombol Form seperti semula
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Tambah Pengguna Baru';
    document.getElementById('btnSubmit').innerHTML = 'Simpan Pengguna';
    document.getElementById('btnSubmit').style.backgroundColor = 'var(--primary)';
    document.getElementById('btnCancelEdit').style.display = 'none';
    
    // Bersihkan isi form
    document.getElementById('addUserForm').reset();
    document.getElementById('editUid').value = '';
    
    // Buka kembali kunci kolom Email & Password
    document.getElementById('email').readOnly = false;
    document.getElementById('email').style.backgroundColor = '';
    document.getElementById('emailHelp').style.display = 'none';
    
    document.getElementById('password').setAttribute('required', 'true');
    document.getElementById('password').readOnly = false;
    document.getElementById('password').style.backgroundColor = '';
    document.getElementById('password').value = '';
    document.getElementById('passHelp').style.display = 'none';
}

// =========================================================================
// 4. LOGIKA SIMPAN (MENGGABUNGKAN TAMBAH BARU & UPDATE)
// =========================================================================
document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const uidEdit = document.getElementById('editUid').value; // Mengambil hidden UID
    const nama = document.getElementById('nama').value.trim();
    const nip = document.getElementById('nip').value.trim();
    const role = document.getElementById('role').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btnSubmit = document.getElementById('btnSubmit');

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Memproses...';

    // -----------------------------------------------------------------
    // A. JIKA MODE EDIT (UID Terisi / Tidak Kosong)
    // -----------------------------------------------------------------
    if (uidEdit !== '') {
        const updates = {
            nama: nama,
            nip: nip,
            role: role
        };

        update(ref(db, 'users/' + uidEdit), updates)
            .then(() => {
                Swal.fire('Berhasil!', 'Profil pengguna berhasil diperbarui.', 'success');
                keluarModeEdit(); // Kembalikan form ke mode Tambah Baru
                btnSubmit.disabled = false;
            })
            .catch((error) => {
                Swal.fire('Gagal', error.message, 'error');
                btnSubmit.disabled = false;
            });
            
    // -----------------------------------------------------------------
    // B. JIKA MODE TAMBAH BARU (UID Kosong)
    // -----------------------------------------------------------------
    } else {
        createUserWithEmailAndPassword(secondaryAuth, email, password)
            .then((userCredential) => {
                const newUser = userCredential.user;
                signOut(secondaryAuth); // Bersihkan mesin pembuat akun

                // Simpan ke Realtime Database
                return set(ref(db, 'users/' + newUser.uid), {
                    nama: nama,
                    email: email,
                    nip: nip,
                    role: role,
                    created_at: new Date().toISOString()
                });
            })
            .then(() => {
                Swal.fire('Berhasil!', 'Akun baru berhasil dibuat.', 'success');
                keluarModeEdit(); // Bersihkan form
                btnSubmit.disabled = false;
            })
            .catch((error) => {
                let msg = error.message;
                if(error.code === 'auth/email-already-in-use') msg = 'Email tersebut sudah terdaftar!';
                if(error.code === 'auth/invalid-email') msg = 'Format email tidak valid!';
                
                Swal.fire('Gagal', msg, 'error');
                btnSubmit.disabled = false;
                keluarModeEdit();
            });
    }
});

// =========================================================================
// FUNGSI LOGOUT ADMIN
// =========================================================================
document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    });
});

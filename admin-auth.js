// Import Firebase Modular (V10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// TAMBAHAN: Import remove untuk fitur hapus data
import { getDatabase, ref, set, get, child, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

const secondaryApp = initializeApp(firebaseConfig, "MesinPembuatAkun");
const secondaryAuth = getAuth(secondaryApp);

// =========================================================================
// 1. PROTEKSI HALAMAN
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
// 2. MENAMPILKAN TABEL & TOMBOL AKSI (EDIT & HAPUS)
// =========================================================================
function tampilkanDaftarPengguna() {
    const tableBody = document.getElementById('userTableBody');
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
        tableBody.innerHTML = '';
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const uid = childSnapshot.key;
                const data = childSnapshot.val();

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
                        <div style="display: flex; gap: 5px;">
                            <button class="btn-action btn-edit-user" data-uid="${uid}" data-nama="${data.nama}" data-nip="${data.nip}" data-role="${data.role}" data-email="${data.email}">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button class="btn-action btn-delete-user" data-uid="${uid}" data-nama="${data.nama}">
                                <i class="fa-solid fa-trash"></i> Hapus
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Event listener untuk tombol Edit
            document.querySelectorAll('.btn-edit-user').forEach(btn => {
                btn.addEventListener('click', function() {
                    masukModeEdit(this.dataset);
                });
            });

            // Event listener untuk tombol Hapus
            document.querySelectorAll('.btn-delete-user').forEach(btn => {
                btn.addEventListener('click', function() {
                    hapusPengguna(this.dataset.uid, this.dataset.nama);
                });
            });

        } else {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada data pengguna.</td></tr>';
        }
    });
}

// =========================================================================
// 3. FUNGSI HAPUS PENGGUNA
// =========================================================================
function hapusPengguna(uid, nama) {
    Swal.fire({
        title: 'Konfirmasi Hapus',
        text: `Apakah Anda yakin ingin menghapus akses untuk ${nama}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            remove(ref(db, 'users/' + uid))
                .then(() => {
                    Swal.fire('Terhapus!', 'Data pengguna berhasil dihapus dari sistem.', 'success');
                })
                .catch((error) => {
                    Swal.fire('Gagal', error.message, 'error');
                });
        }
    });
}

// =========================================================================
// 4. FUNGSI EDIT & SIMPAN (SAMA SEPERTI SEBELUMNYA)
// =========================================================================
function masukModeEdit(data) {
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Profil Pengguna';
    document.getElementById('btnSubmit').innerHTML = 'Update Pengguna';
    document.getElementById('btnSubmit').style.backgroundColor = '#eab308';
    document.getElementById('btnCancelEdit').style.display = 'block';
    
    document.getElementById('editUid').value = data.uid;
    document.getElementById('nama').value = data.nama;
    document.getElementById('nip').value = data.nip;
    document.getElementById('role').value = data.role;
    document.getElementById('email').value = data.email;
    
    document.getElementById('email').readOnly = true;
    document.getElementById('email').style.backgroundColor = '#e5e7eb';
    document.getElementById('emailHelp').style.display = 'inline';
    
    document.getElementById('password').removeAttribute('required');
    document.getElementById('password').readOnly = true;
    document.getElementById('password').style.backgroundColor = '#e5e7eb';
    document.getElementById('password').value = '********';
    document.getElementById('passHelp').style.display = 'inline';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('btnCancelEdit').addEventListener('click', keluarModeEdit);

function keluarModeEdit() {
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Tambah Pengguna Baru';
    document.getElementById('btnSubmit').innerHTML = 'Simpan Pengguna';
    document.getElementById('btnSubmit').style.backgroundColor = 'var(--primary)';
    document.getElementById('btnCancelEdit').style.display = 'none';
    
    document.getElementById('addUserForm').reset();
    document.getElementById('editUid').value = '';
    
    document.getElementById('email').readOnly = false;
    document.getElementById('email').style.backgroundColor = '';
    document.getElementById('emailHelp').style.display = 'none';
    
    document.getElementById('password').setAttribute('required', 'true');
    document.getElementById('password').readOnly = false;
    document.getElementById('password').style.backgroundColor = '';
    document.getElementById('password').value = '';
    document.getElementById('passHelp').style.display = 'none';
}

document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const uidEdit = document.getElementById('editUid').value;
    const nama = document.getElementById('nama').value.trim();
    const nip = document.getElementById('nip').value.trim();
    const role = document.getElementById('role').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btnSubmit = document.getElementById('btnSubmit');

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Memproses...';

    if (uidEdit !== '') {
        const updates = { nama: nama, nip: nip, role: role };
        update(ref(db, 'users/' + uidEdit), updates)
            .then(() => {
                Swal.fire('Berhasil!', 'Profil pengguna berhasil diperbarui.', 'success');
                keluarModeEdit();
                btnSubmit.disabled = false;
            })
            .catch((error) => {
                Swal.fire('Gagal', error.message, 'error');
                btnSubmit.disabled = false;
            });
    } else {
        createUserWithEmailAndPassword(secondaryAuth, email, password)
            .then((userCredential) => {
                const newUser = userCredential.user;
                signOut(secondaryAuth);
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
                keluarModeEdit();
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

// LOGOUT
document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => { window.location.href = 'login.html'; });
});

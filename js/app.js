// KKMA 04 Jember - Main Application
(function() {
    'use strict';

    const app = document.getElementById('app');

    // ============ ROUTER ============
    function getRoute() {
        const hash = location.hash.slice(1) || '/';
        const parts = hash.split('/').filter(Boolean);
        return { path: '/' + (parts[0] || ''), params: parts.slice(1) };
    }

    function navigate() {
        const { path, params } = getRoute();
        // Update active nav
        document.querySelectorAll('[data-nav]').forEach(el => {
            el.classList.toggle('active', '#' + (path === '/' ? '/' : path) === el.getAttribute('href'));
        });

        switch(path) {
            case '/': renderBeranda(); break;
            case '/madrasah':
                if (params[0]) renderMadrasahDetail(params[0]);
                else renderMadrasah();
                break;
            case '/madrasah-form':
                renderMadrasahForm(params[0] || null);
                break;
            case '/guru':
                if (params[0] === 'tambah') renderGuruForm();
                else if (params[0] === 'edit' && params[1]) renderGuruForm(params[1]);
                else renderGuru();
                break;
            case '/siswa':
                if (params[0] === 'tambah') renderSiswaForm();
                else if (params[0] === 'edit' && params[1]) renderSiswaForm(params[1]);
                else renderSiswa();
                break;
            case '/tentang': renderTentang(); break;
            default: renderNotFound();
        }
        window.scrollTo(0, 0);
    }

    window.addEventListener('hashchange', navigate);
    window.addEventListener('DOMContentLoaded', navigate);

    // ============ HELPERS ============
    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

    function getMadrasahByNsm(nsm) {
        return KKMA_DATA.madrasah.find(m => m.nsm === nsm);
    }

    function getGuruByMadrasah(nsm) {
        return KKMA_DATA.guru.filter(g => g.nsm === nsm);
    }

    function getSiswaByMadrasah(nsm) {
        return KKMA_DATA.siswa.filter(s => s.nsm === nsm);
    }

    function totalGuru() { return KKMA_DATA.guru.length; }
    function totalSiswa() { return KKMA_DATA.siswa.length; }
    function totalSiswaL() { return KKMA_DATA.siswa.filter(s => s.jk === 'L').length; }
    function totalSiswaP() { return KKMA_DATA.siswa.filter(s => s.jk === 'P').length; }

    function saveMadrasah() { kkmaSave('madrasah', KKMA_DATA.madrasah); }
    function saveGuru() { kkmaSave('guru', KKMA_DATA.guru); }
    function saveSiswa() { kkmaSave('siswa', KKMA_DATA.siswa); }

    function escHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
    }

    // ============ BERANDA ============
    function renderBeranda() {
        app.innerHTML = `
        <div class="hero-section text-center">
            <h1><i class="bi bi-building"></i> KKMA 04 Jember</h1>
            <p class="lead mb-1">Kelompok Kerja Madrasah Aliyah</p>
            <p class="mb-0 opacity-75">Kecamatan Sukowono — Kabupaten Jember — Jawa Timur</p>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body d-flex align-items-center gap-3">
                        <div class="stat-icon bg-success bg-opacity-10 text-success"><i class="bi bi-building"></i></div>
                        <div>
                            <div class="fw-bold fs-4">${KKMA_DATA.madrasah.length}</div>
                            <small class="text-muted">Madrasah</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body d-flex align-items-center gap-3">
                        <div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-people"></i></div>
                        <div>
                            <div class="fw-bold fs-4">${totalGuru()}</div>
                            <small class="text-muted">Guru</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body d-flex align-items-center gap-3">
                        <div class="stat-icon bg-info bg-opacity-10 text-info"><i class="bi bi-mortarboard"></i></div>
                        <div>
                            <div class="fw-bold fs-4">${totalSiswa()}</div>
                            <small class="text-muted">Siswa</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body d-flex align-items-center gap-3">
                        <div class="stat-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-person-badge"></i></div>
                        <div>
                            <div class="fw-bold fs-4">1</div>
                            <small class="text-muted">Pengawas</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-md-8">
                <div class="form-section">
                    <h5 class="mb-3"><i class="bi bi-building text-primary me-2"></i>Daftar Madrasah Binaan</h5>
                    <div class="table-responsive">
                        <table class="table table-sm table-data table-hover mb-0">
                            <thead><tr><th>No</th><th>Nama Madrasah</th><th>Kepala Madrasah</th><th>Aksi</th></tr></thead>
                            <tbody>
                                ${KKMA_DATA.madrasah.slice(0, 10).map((m, i) => `
                                <tr>
                                    <td>${i+1}</td>
                                    <td><strong>${escHtml(m.nama)}</strong></td>
                                    <td>${escHtml(m.kepala)}</td>
                                    <td><a href="#/madrasah/${m.nsm}" class="btn btn-sm btn-outline-primary py-0 px-2">Detail</a></td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${KKMA_DATA.madrasah.length > 10 ? `<div class="text-center mt-3"><a href="#/madrasah" class="btn btn-outline-primary btn-sm">Lihat Semua →</a></div>` : ''}
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-section">
                    <h5 class="mb-3"><i class="bi bi-person-badge text-primary me-2"></i>Pengawas Pembina</h5>
                    <div class="text-center mb-3">
                        <div class="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center" style="width:80px;height:80px">
                            <i class="bi bi-person-fill text-success" style="font-size:2.5rem"></i>
                        </div>
                    </div>
                    <p class="text-center fw-bold mb-1">${KKMA_DATA.profil.pengawas}</p>
                    <p class="text-center text-muted small mb-3">NIP. ${KKMA_DATA.profil.nip_pengawas}</p>
                    <hr>
                    <p class="small mb-1"><i class="bi bi-geo-alt me-1"></i>Wilayah: ${KKMA_DATA.profil.wilayah}</p>
                    <p class="small mb-1"><i class="bi bi-buildings me-1"></i>${KKMA_DATA.profil.kabupaten}, ${KKMA_DATA.profil.provinsi}</p>
                    <p class="small mb-0"><i class="bi bi-calendar me-1"></i>Tahun: ${KKMA_DATA.profil.tahun_aktif}</p>
                </div>

                <div class="form-section mt-3">
                    <h5 class="mb-3"><i class="bi bi-bar-chart text-primary me-2"></i>Statistik Cepat</h5>
                    <ul class="list-unstyled small mb-0">
                        <li class="mb-2 d-flex justify-content-between">
                            <span>Total Guru</span><strong>${totalGuru()}</strong>
                        </li>
                        <li class="mb-2 d-flex justify-content-between">
                            <span>Total Siswa</span><strong>${totalSiswa()}</strong>
                        </li>
                        <li class="mb-2 d-flex justify-content-between">
                            <span>Siswa Laki-laki</span><strong>${totalSiswaL()}</strong>
                        </li>
                        <li class="d-flex justify-content-between">
                            <span>Siswa Perempuan</span><strong>${totalSiswaP()}</strong>
                        </li>
                    </ul>
                </div>
            </div>
        </div>`;
    }

    // ============ MADRASAH ============
    function renderMadrasah() {
        app.innerHTML = `
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h4 class="mb-0"><i class="bi bi-building text-primary me-2"></i>Data Madrasah</h4>
            <div class="d-flex gap-2">
                <div class="search-box" style="min-width:250px">
                    <i class="bi bi-search"></i>
                    <input type="text" class="form-control" id="searchMadrasah" placeholder="Cari madrasah...">
                </div>
                <button class="btn btn-primary btn-sm" id="btnTambahMadrasah"><i class="bi bi-plus-lg me-1"></i>Tambah</button>
            </div>
        </div>
        <div class="row g-3" id="madrasahGrid">
            ${KKMA_DATA.madrasah.map((m, i) => `
            <div class="col-md-6 col-lg-4 madrasah-item" data-nama="${escHtml(m.nama.toLowerCase())}">
                <div class="card madrasah-card h-100">
                    <div class="card-header py-2 px-3 d-flex justify-content-between align-items-center">
                        <small class="opacity-75">NSM: ${m.nsm}</small>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-light btn-sm py-0 px-1 btn-edit-madrasah" data-nsm="${m.nsm}" title="Edit"><i class="bi bi-pencil text-primary"></i></button>
                            <button class="btn btn-light btn-sm py-0 px-1 btn-hapus-madrasah" data-nsm="${m.nsm}" title="Hapus"><i class="bi bi-trash text-danger"></i></button>
                        </div>
                    </div>
                    <div class="card-body" style="cursor:pointer" onclick="location.hash='#/madrasah/${m.nsm}'">
                        <h6 class="card-title mb-2">${escHtml(m.nama)}</h6>
                        <p class="card-text small text-muted mb-1"><i class="bi bi-person me-1"></i>${escHtml(m.kepala)}</p>
                        <p class="card-text small text-muted mb-0"><i class="bi bi-geo-alt me-1"></i>${escHtml(m.alamat)}</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 pt-0 pb-2 px-3">
                        <div class="d-flex gap-3 small text-muted">
                            <span><i class="bi bi-people me-1"></i>${getGuruByMadrasah(m.nsm).length} guru</span>
                            <span><i class="bi bi-mortarboard me-1"></i>${getSiswaByMadrasah(m.nsm).length} siswa</span>
                        </div>
                    </div>
                </div>
            </div>`).join('')}
        </div>`;

        document.getElementById('searchMadrasah').addEventListener('input', function() {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.madrasah-item').forEach(el => {
                el.style.display = el.dataset.nama.includes(q) ? '' : 'none';
            });
        });

        // Tambah madrasah
        document.getElementById('btnTambahMadrasah').addEventListener('click', function() {
            location.hash = '#/madrasah-form';
        });

        // Edit madrasah
        app.querySelectorAll('.btn-edit-madrasah').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                location.hash = '#/madrasah-form/' + this.dataset.nsm;
            });
        });

        // Hapus madrasah
        app.querySelectorAll('.btn-hapus-madrasah').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const nsm = this.dataset.nsm;
                const m = getMadrasahByNsm(nsm);
                if (confirm('Hapus madrasah "' + m.nama + '"? Data guru & siswa terkait juga akan dihapus.')) {
                    KKMA_DATA.madrasah = KKMA_DATA.madrasah.filter(x => x.nsm !== nsm);
                    KKMA_DATA.guru = KKMA_DATA.guru.filter(g => g.nsm !== nsm);
                    KKMA_DATA.siswa = KKMA_DATA.siswa.filter(s => s.nsm !== nsm);
                    saveMadrasah(); saveGuru(); saveSiswa();
                    renderMadrasah();
                }
            });
        });
    }

    function renderMadrasahForm(nsm) {
        const isEdit = !!nsm;
        const m = isEdit ? getMadrasahByNsm(nsm) : null;
        if (isEdit && !m) { renderNotFound(); return; }

        app.innerHTML = `
        <a href="#/madrasah" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>
        <div class="form-section" style="max-width:700px">
            <h5 class="mb-4"><i class="bi bi-${isEdit?'pencil':'building'} text-primary me-2"></i>${isEdit ? 'Edit' : 'Tambah'} Madrasah</h5>
            <form id="formMadrasah">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nama Madrasah <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="nama" value="${escHtml(m?.nama || '')}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">NSM <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="nsm" value="${escHtml(m?.nsm || '')}" ${isEdit?'readonly':''} required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Kepala Madrasah</label>
                        <input type="text" class="form-control" name="kepala" value="${escHtml(m?.kepala || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Alamat/Kecamatan</label>
                        <input type="text" class="form-control" name="alamat" value="${escHtml(m?.alamat || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Telepon</label>
                        <input type="text" class="form-control" name="telp" value="${escHtml(m?.telp || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="email" value="${escHtml(m?.email || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Akreditasi</label>
                        <select class="form-select" name="akreditasi">
                            <option value="-" ${(m?.akreditasi||'-')==='-'?'selected':''}>-</option>
                            <option value="A" ${m?.akreditasi==='A'?'selected':''}>A</option>
                            <option value="B" ${m?.akreditasi==='B'?'selected':''}>B</option>
                            <option value="C" ${m?.akreditasi==='C'?'selected':''}>C</option>
                            <option value="Belum" ${m?.akreditasi==='Belum'?'selected':''}>Belum Akreditasi</option>
                        </select>
                    </div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>${isEdit ? 'Simpan Perubahan' : 'Simpan'}</button>
                </div>
            </form>
        </div>`;

        document.getElementById('formMadrasah').addEventListener('submit', function(e) {
            e.preventDefault();
            const fd = new FormData(this);
            const data = Object.fromEntries(fd.entries());

            if (isEdit) {
                Object.assign(m, data);
            } else {
                // Check duplicate NSM
                if (getMadrasahByNsm(data.nsm)) {
                    alert('NSM sudah ada! Gunakan NSM yang berbeda.');
                    return;
                }
                data.siswa_l = 0; data.siswa_p = 0;
                data.guru_total = 0; data.guru_pns = 0; data.guru_non_pns = 0;
                KKMA_DATA.madrasah.push(data);
            }
            saveMadrasah();
            location.hash = '#/madrasah';
        });
    }

    function renderMadrasahDetail(nsm) {
        const m = getMadrasahByNsm(nsm);
        if (!m) { renderNotFound(); return; }
        const guruList = getGuruByMadrasah(nsm);
        const siswaList = getSiswaByMadrasah(nsm);

        app.innerHTML = `
        <a href="#/madrasah" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>

        <div class="detail-header">
            <h4 class="mb-1"><i class="bi bi-building me-2"></i>${escHtml(m.nama)}</h4>
            <p class="mb-0 opacity-75">NSM: ${m.nsm} | ${escHtml(m.alamat)}</p>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="form-section">
                    <h6 class="mb-3">Identitas Madrasah</h6>
                    <table class="table table-sm table-borderless mb-0">
                        <tr><td class="text-muted" style="width:40%">Nama</td><td><strong>${escHtml(m.nama)}</strong></td></tr>
                        <tr><td class="text-muted">NSM</td><td>${m.nsm}</td></tr>
                        <tr><td class="text-muted">Kepala Madrasah</td><td>${escHtml(m.kepala)}</td></tr>
                        <tr><td class="text-muted">Alamat</td><td>${escHtml(m.alamat)}</td></tr>
                        <tr><td class="text-muted">Telepon</td><td>${escHtml(m.telp) || '-'}</td></tr>
                        <tr><td class="text-muted">Email</td><td>${escHtml(m.email) || '-'}</td></tr>
                        <tr><td class="text-muted">Akreditasi</td><td>${escHtml(m.akreditasi) || '-'}</td></tr>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-section">
                    <h6 class="mb-3">Statistik</h6>
                    <div class="row g-2 text-center">
                        <div class="col-4">
                            <div class="p-2 bg-success bg-opacity-10 rounded">
                                <div class="fw-bold fs-5 text-success">${guruList.length}</div>
                                <small class="text-muted">Guru</small>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="p-2 bg-info bg-opacity-10 rounded">
                                <div class="fw-bold fs-5 text-info">${siswaList.filter(s=>s.jk==='L').length}</div>
                                <small class="text-muted">Siswa L</small>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="p-2 bg-warning bg-opacity-10 rounded">
                                <div class="fw-bold fs-5 text-warning">${siswaList.filter(s=>s.jk==='P').length}</div>
                                <small class="text-muted">Siswa P</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-section mt-3">
                    <h6 class="mb-3">Aksi Cepat</h6>
                    <a href="#/guru/tambah?nsm=${nsm}" class="btn btn-sm btn-outline-primary me-2 mb-2"><i class="bi bi-person-plus me-1"></i>Tambah Guru</a>
                    <a href="#/siswa/tambah?nsm=${nsm}" class="btn btn-sm btn-outline-success mb-2"><i class="bi bi-person-plus me-1"></i>Tambah Siswa</a>
                </div>
            </div>
        </div>

        ${guruList.length ? `
        <div class="form-section">
            <h6 class="mb-3"><i class="bi bi-people text-primary me-2"></i>Daftar Guru (${guruList.length})</h6>
            <div class="table-responsive">
                <table class="table table-sm table-data table-hover mb-0">
                    <thead><tr><th>No</th><th>Nama</th><th>NIP/NUPTK</th><th>Mapel</th><th>Status</th><th>Aksi</th></tr></thead>
                    <tbody>
                        ${guruList.map((g, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${escHtml(g.nama)}</td>
                            <td>${escHtml(g.nip || g.nuptk || '-')}</td>
                            <td>${escHtml(g.mapel || '-')}</td>
                            <td><span class="badge ${g.status_kepegawaian==='PNS'?'bg-success':'bg-secondary'}">${escHtml(g.status_kepegawaian || '-')}</span></td>
                            <td>
                                <a href="#/guru/edit/${g.id}" class="btn btn-sm btn-outline-primary py-0 px-1" title="Edit"><i class="bi bi-pencil"></i></a>
                                <button class="btn btn-sm btn-outline-danger py-0 px-1 btn-hapus-guru" data-id="${g.id}" title="Hapus"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>` : ''}

        ${siswaList.length ? `
        <div class="form-section mt-3">
            <h6 class="mb-3"><i class="bi bi-mortarboard text-primary me-2"></i>Daftar Siswa (${siswaList.length})</h6>
            <div class="table-responsive">
                <table class="table table-sm table-data table-hover mb-0">
                    <thead><tr><th>No</th><th>Nama</th><th>NISN</th><th>Kelas</th><th>JK</th><th>Aksi</th></tr></thead>
                    <tbody>
                        ${siswaList.map((s, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${escHtml(s.nama)}</td>
                            <td>${escHtml(s.nisn || '-')}</td>
                            <td>${escHtml(s.kelas || '-')}</td>
                            <td>${s.jk || '-'}</td>
                            <td>
                                <a href="#/siswa/edit/${s.id}" class="btn btn-sm btn-outline-primary py-0 px-1" title="Edit"><i class="bi bi-pencil"></i></a>
                                <button class="btn btn-sm btn-outline-danger py-0 px-1 btn-hapus-siswa" data-id="${s.id}" title="Hapus"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>` : ''}
        `;

        // Delete guru handler
        app.querySelectorAll('.btn-hapus-guru').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Hapus data guru ini?')) {
                    KKMA_DATA.guru = KKMA_DATA.guru.filter(g => g.id !== this.dataset.id);
                    saveGuru();
                    renderMadrasahDetail(nsm);
                }
            });
        });

        // Delete siswa handler
        app.querySelectorAll('.btn-hapus-siswa').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Hapus data siswa ini?')) {
                    KKMA_DATA.siswa = KKMA_DATA.siswa.filter(s => s.id !== this.dataset.id);
                    saveSiswa();
                    renderMadrasahDetail(nsm);
                }
            });
        });
    }

    // ============ GURU ============
    function renderGuru() {
        app.innerHTML = `
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h4 class="mb-0"><i class="bi bi-people text-primary me-2"></i>Data Guru</h4>
            <div class="d-flex gap-2">
                <div class="search-box">
                    <i class="bi bi-search"></i>
                    <input type="text" class="form-control" id="searchGuru" placeholder="Cari guru...">
                </div>
                <a href="#/guru/tambah" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i>Tambah</a>
            </div>
        </div>

        <div class="form-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted small">Total: <strong>${totalGuru()}</strong> guru</span>
                <select class="form-select form-select-sm" style="width:auto" id="filterMadrasahGuru">
                    <option value="">Semua Madrasah</option>
                    ${KKMA_DATA.madrasah.map(m => `<option value="${m.nsm}">${escHtml(m.nama)}</option>`).join('')}
                </select>
            </div>
            ${KKMA_DATA.guru.length ? `
            <div class="table-responsive">
                <table class="table table-sm table-data table-hover mb-0">
                    <thead><tr><th>No</th><th>Nama Guru</th><th>NIP/NUPTK</th><th>Madrasah</th><th>Mapel</th><th>Status</th><th>Aksi</th></tr></thead>
                    <tbody id="guruTableBody">
                        ${KKMA_DATA.guru.map((g, i) => {
                            const m = getMadrasahByNsm(g.nsm);
                            return `
                            <tr data-nsm="${g.nsm}" data-nama="${escHtml((g.nama||'').toLowerCase())}">
                                <td>${i+1}</td>
                                <td><strong>${escHtml(g.nama)}</strong></td>
                                <td>${escHtml(g.nip || g.nuptk || '-')}</td>
                                <td><small>${m ? escHtml(m.nama) : '-'}</small></td>
                                <td>${escHtml(g.mapel || '-')}</td>
                                <td><span class="badge ${g.status_kepegawaian==='PNS'?'bg-success':'bg-secondary'}">${escHtml(g.status_kepegawaian || 'Non-PNS')}</span></td>
                                <td>
                                    <a href="#/guru/edit/${g.id}" class="btn btn-sm btn-outline-primary py-0 px-1"><i class="bi bi-pencil"></i></a>
                                    <button class="btn btn-sm btn-outline-danger py-0 px-1 btn-hapus-guru" data-id="${g.id}"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>` : `
            <div class="empty-state">
                <i class="bi bi-people"></i>
                <p>Belum ada data guru</p>
                <a href="#/guru/tambah" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i>Tambah Guru</a>
            </div>`}
        </div>`;

        // Search & filter
        const searchEl = document.getElementById('searchGuru');
        const filterEl = document.getElementById('filterMadrasahGuru');
        function filterGuru() {
            const q = (searchEl.value || '').toLowerCase();
            const nsm = filterEl.value;
            document.querySelectorAll('#guruTableBody tr').forEach(tr => {
                const matchNama = tr.dataset.nama.includes(q);
                const matchNsm = !nsm || tr.dataset.nsm === nsm;
                tr.style.display = (matchNama && matchNsm) ? '' : 'none';
            });
        }
        if (searchEl) searchEl.addEventListener('input', filterGuru);
        if (filterEl) filterEl.addEventListener('change', filterGuru);

        // Delete
        app.querySelectorAll('.btn-hapus-guru').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Hapus data guru ini?')) {
                    KKMA_DATA.guru = KKMA_DATA.guru.filter(g => g.id !== this.dataset.id);
                    saveGuru();
                    renderGuru();
                }
            });
        });
    }

    function renderGuruForm(editId) {
        const guru = editId ? KKMA_DATA.guru.find(g => g.id === editId) : null;
        const qNsm = new URLSearchParams(location.hash.split('?')[1] || '').get('nsm') || '';
        const isEdit = !!guru;

        app.innerHTML = `
        <a href="${isEdit ? 'javascript:history.back()' : '#/guru'}" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>
        <div class="form-section" style="max-width:700px">
            <h5 class="mb-4"><i class="bi bi-${isEdit?'pencil':'person-plus'} text-primary me-2"></i>${isEdit ? 'Edit' : 'Tambah'} Data Guru</h5>
            <form id="formGuru">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="nama" value="${escHtml(guru?.nama || '')}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Madrasah <span class="text-danger">*</span></label>
                        <select class="form-select" name="nsm" required>
                            <option value="">-- Pilih Madrasah --</option>
                            ${KKMA_DATA.madrasah.map(m => `<option value="${m.nsm}" ${(guru?.nsm||qNsm)===m.nsm?'selected':''}>${escHtml(m.nama)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">NIP</label>
                        <input type="text" class="form-control" name="nip" value="${escHtml(guru?.nip || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">NUPTK</label>
                        <input type="text" class="form-control" name="nuptk" value="${escHtml(guru?.nuptk || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Mata Pelajaran</label>
                        <input type="text" class="form-control" name="mapel" value="${escHtml(guru?.mapel || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Status Kepegawaian</label>
                        <select class="form-select" name="status_kepegawaian">
                            <option value="Non-PNS" ${(guru?.status_kepegawaian||'')!=='PNS'?'selected':''}>Non-PNS</option>
                            <option value="PNS" ${guru?.status_kepegawaian==='PNS'?'selected':''}>PNS</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Jenis Kelamin</label>
                        <select class="form-select" name="jk">
                            <option value="L" ${(guru?.jk||'L')==='L'?'selected':''}>Laki-laki</option>
                            <option value="P" ${guru?.jk==='P'?'selected':''}>Perempuan</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Pendidikan Terakhir</label>
                        <select class="form-select" name="pendidikan">
                            <option value="">-- Pilih --</option>
                            ${['SMA/MA','D1','D2','D3','S1','S2','S3'].map(p => `<option value="${p}" ${guru?.pendidikan===p?'selected':''}>${p}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-12">
                        <label class="form-label">No. HP</label>
                        <input type="text" class="form-control" name="telp" value="${escHtml(guru?.telp || '')}">
                    </div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>${isEdit ? 'Simpan Perubahan' : 'Simpan'}</button>
                </div>
            </form>
        </div>`;

        document.getElementById('formGuru').addEventListener('submit', function(e) {
            e.preventDefault();
            const fd = new FormData(this);
            const data = Object.fromEntries(fd.entries());

            if (isEdit) {
                Object.assign(guru, data);
            } else {
                data.id = uid();
                KKMA_DATA.guru.push(data);
            }
            saveGuru();
            location.hash = '#/guru';
        });
    }

    // ============ SISWA ============
    function buildRekapSiswa() {
        // Rekap per lembaga
        const rekapLembaga = KKMA_DATA.madrasah.map(m => {
            const siswaM = getSiswaByMadrasah(m.nsm);
            const kX = siswaM.filter(s => s.kelas === 'X');
            const kXI = siswaM.filter(s => s.kelas === 'XI');
            const kXII = siswaM.filter(s => s.kelas === 'XII');
            return {
                nsm: m.nsm,
                nama: m.nama,
                x_l: kX.filter(s=>s.jk==='L').length,
                x_p: kX.filter(s=>s.jk==='P').length,
                xi_l: kXI.filter(s=>s.jk==='L').length,
                xi_p: kXI.filter(s=>s.jk==='P').length,
                xii_l: kXII.filter(s=>s.jk==='L').length,
                xii_p: kXII.filter(s=>s.jk==='P').length,
                total_l: siswaM.filter(s=>s.jk==='L').length,
                total_p: siswaM.filter(s=>s.jk==='P').length,
                total: siswaM.length
            };
        });
        return rekapLembaga;
    }

    function renderSiswa() {
        const rekap = buildRekapSiswa();
        const grandL = rekap.reduce((s,r)=>s+r.total_l,0);
        const grandP = rekap.reduce((s,r)=>s+r.total_p,0);
        const grandTotal = grandL + grandP;

        app.innerHTML = `
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h4 class="mb-0"><i class="bi bi-mortarboard text-primary me-2"></i>Data Siswa</h4>
            <div class="d-flex gap-2">
                <div class="search-box">
                    <i class="bi bi-search"></i>
                    <input type="text" class="form-control" id="searchSiswa" placeholder="Cari siswa...">
                </div>
                <a href="#/siswa/tambah" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i>Tambah</a>
            </div>
        </div>

        <!-- REKAP SISWA PER LEMBAGA -->
        <div class="form-section mb-4">
            <h5 class="mb-3"><i class="bi bi-table text-primary me-2"></i>Rekapitulasi Siswa Per Lembaga</h5>
            <div class="table-responsive">
                <table class="table table-sm table-data table-bordered mb-0">
                    <thead>
                        <tr>
                            <th rowspan="2" class="align-middle text-center">No</th>
                            <th rowspan="2" class="align-middle">Nama Madrasah</th>
                            <th colspan="2" class="text-center">Kelas X</th>
                            <th colspan="2" class="text-center">Kelas XI</th>
                            <th colspan="2" class="text-center">Kelas XII</th>
                            <th colspan="3" class="text-center">Jumlah</th>
                        </tr>
                        <tr>
                            <th class="text-center">L</th><th class="text-center">P</th>
                            <th class="text-center">L</th><th class="text-center">P</th>
                            <th class="text-center">L</th><th class="text-center">P</th>
                            <th class="text-center">L</th><th class="text-center">P</th><th class="text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rekap.map((r, i) => `
                        <tr>
                            <td class="text-center">${i+1}</td>
                            <td>${escHtml(r.nama)}</td>
                            <td class="text-center">${r.x_l || '-'}</td>
                            <td class="text-center">${r.x_p || '-'}</td>
                            <td class="text-center">${r.xi_l || '-'}</td>
                            <td class="text-center">${r.xi_p || '-'}</td>
                            <td class="text-center">${r.xii_l || '-'}</td>
                            <td class="text-center">${r.xii_p || '-'}</td>
                            <td class="text-center fw-bold">${r.total_l || '-'}</td>
                            <td class="text-center fw-bold">${r.total_p || '-'}</td>
                            <td class="text-center fw-bold">${r.total || '-'}</td>
                        </tr>`).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="table-success fw-bold">
                            <td colspan="2" class="text-center">JUMLAH KKMA 04</td>
                            <td class="text-center">${rekap.reduce((s,r)=>s+r.x_l,0) || '-'}</td>
                            <td class="text-center">${rekap.reduce((s,r)=>s+r.x_p,0) || '-'}</td>
                            <td class="text-center">${rekap.reduce((s,r)=>s+r.xi_l,0) || '-'}</td>
                            <td class="text-center">${rekap.reduce((s,r)=>s+r.xi_p,0) || '-'}</td>
                            <td class="text-center">${rekap.reduce((s,r)=>s+r.xii_l,0) || '-'}</td>
                            <td class="text-center">${rekap.reduce((s,r)=>s+r.xii_p,0) || '-'}</td>
                            <td class="text-center">${grandL || '-'}</td>
                            <td class="text-center">${grandP || '-'}</td>
                            <td class="text-center">${grandTotal || '-'}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- DAFTAR SISWA -->
        <div class="form-section">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <h5 class="mb-0"><i class="bi bi-list-ul text-primary me-2"></i>Daftar Siswa</h5>
                <div class="d-flex gap-2">
                    <select class="form-select form-select-sm" style="width:auto" id="filterMadrasahSiswa">
                        <option value="">Semua Madrasah</option>
                        ${KKMA_DATA.madrasah.map(m => `<option value="${m.nsm}">${escHtml(m.nama)}</option>`).join('')}
                    </select>
                    <select class="form-select form-select-sm" style="width:auto" id="filterKelasSiswa">
                        <option value="">Semua Kelas</option>
                        <option value="X">X</option>
                        <option value="XI">XI</option>
                        <option value="XII">XII</option>
                    </select>
                </div>
            </div>
            ${KKMA_DATA.siswa.length ? `
            <div class="table-responsive">
                <table class="table table-sm table-data table-hover mb-0">
                    <thead><tr><th>No</th><th>Nama Siswa</th><th>NISN</th><th>Madrasah</th><th>Kelas</th><th>JK</th><th>Aksi</th></tr></thead>
                    <tbody id="siswaTableBody">
                        ${KKMA_DATA.siswa.map((s, i) => {
                            const m = getMadrasahByNsm(s.nsm);
                            return `
                            <tr data-nsm="${s.nsm}" data-kelas="${escHtml(s.kelas||'')}" data-nama="${escHtml((s.nama||'').toLowerCase())}">
                                <td>${i+1}</td>
                                <td><strong>${escHtml(s.nama)}</strong></td>
                                <td>${escHtml(s.nisn || '-')}</td>
                                <td><small>${m ? escHtml(m.nama) : '-'}</small></td>
                                <td>${escHtml(s.kelas || '-')}</td>
                                <td>${s.jk || '-'}</td>
                                <td>
                                    <a href="#/siswa/edit/${s.id}" class="btn btn-sm btn-outline-primary py-0 px-1"><i class="bi bi-pencil"></i></a>
                                    <button class="btn btn-sm btn-outline-danger py-0 px-1 btn-hapus-siswa" data-id="${s.id}"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>` : `
            <div class="empty-state">
                <i class="bi bi-mortarboard"></i>
                <p>Belum ada data siswa. Rekap di atas akan terisi otomatis setelah data siswa ditambahkan.</p>
                <a href="#/siswa/tambah" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i>Tambah Siswa</a>
            </div>`}
        </div>`;

        // Search & filter
        const searchEl = document.getElementById('searchSiswa');
        const filterMadrasah = document.getElementById('filterMadrasahSiswa');
        const filterKelas = document.getElementById('filterKelasSiswa');
        function filterSiswa() {
            const q = (searchEl?.value || '').toLowerCase();
            const nsm = filterMadrasah?.value || '';
            const kelas = filterKelas?.value || '';
            document.querySelectorAll('#siswaTableBody tr').forEach(tr => {
                const matchNama = tr.dataset.nama.includes(q);
                const matchNsm = !nsm || tr.dataset.nsm === nsm;
                const matchKelas = !kelas || tr.dataset.kelas === kelas;
                tr.style.display = (matchNama && matchNsm && matchKelas) ? '' : 'none';
            });
        }
        if (searchEl) searchEl.addEventListener('input', filterSiswa);
        if (filterMadrasah) filterMadrasah.addEventListener('change', filterSiswa);
        if (filterKelas) filterKelas.addEventListener('change', filterSiswa);

        // Delete
        app.querySelectorAll('.btn-hapus-siswa').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Hapus data siswa ini?')) {
                    KKMA_DATA.siswa = KKMA_DATA.siswa.filter(s => s.id !== this.dataset.id);
                    saveSiswa();
                    renderSiswa();
                }
            });
        });
    }

    function renderSiswaForm(editId) {
        const siswa = editId ? KKMA_DATA.siswa.find(s => s.id === editId) : null;
        const qNsm = new URLSearchParams(location.hash.split('?')[1] || '').get('nsm') || '';
        const isEdit = !!siswa;

        app.innerHTML = `
        <a href="${isEdit ? 'javascript:history.back()' : '#/siswa'}" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>
        <div class="form-section" style="max-width:700px">
            <h5 class="mb-4"><i class="bi bi-${isEdit?'pencil':'person-plus'} text-primary me-2"></i>${isEdit ? 'Edit' : 'Tambah'} Data Siswa</h5>
            <form id="formSiswa">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="nama" value="${escHtml(siswa?.nama || '')}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Madrasah <span class="text-danger">*</span></label>
                        <select class="form-select" name="nsm" required>
                            <option value="">-- Pilih Madrasah --</option>
                            ${KKMA_DATA.madrasah.map(m => `<option value="${m.nsm}" ${(siswa?.nsm||qNsm)===m.nsm?'selected':''}>${escHtml(m.nama)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">NISN</label>
                        <input type="text" class="form-control" name="nisn" value="${escHtml(siswa?.nisn || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Kelas <span class="text-danger">*</span></label>
                        <select class="form-select" name="kelas" required>
                            <option value="">-- Pilih --</option>
                            ${['X','XI','XII'].map(k => `<option value="${k}" ${siswa?.kelas===k?'selected':''}>${k}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                        <select class="form-select" name="jk" required>
                            <option value="L" ${(siswa?.jk||'L')==='L'?'selected':''}>Laki-laki</option>
                            <option value="P" ${siswa?.jk==='P'?'selected':''}>Perempuan</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Tempat Lahir</label>
                        <input type="text" class="form-control" name="tempat_lahir" value="${escHtml(siswa?.tempat_lahir || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Tanggal Lahir</label>
                        <input type="date" class="form-control" name="tgl_lahir" value="${escHtml(siswa?.tgl_lahir || '')}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Nama Orang Tua/Wali</label>
                        <input type="text" class="form-control" name="ortu" value="${escHtml(siswa?.ortu || '')}">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Alamat</label>
                        <input type="text" class="form-control" name="alamat" value="${escHtml(siswa?.alamat || '')}">
                    </div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>${isEdit ? 'Simpan Perubahan' : 'Simpan'}</button>
                </div>
            </form>
        </div>`;

        document.getElementById('formSiswa').addEventListener('submit', function(e) {
            e.preventDefault();
            const fd = new FormData(this);
            const data = Object.fromEntries(fd.entries());

            if (isEdit) {
                Object.assign(siswa, data);
            } else {
                data.id = uid();
                KKMA_DATA.siswa.push(data);
            }
            saveSiswa();
            location.hash = '#/siswa';
        });
    }

    // ============ TENTANG ============
    function renderTentang() {
        app.innerHTML = `
        <div class="hero-section text-center">
            <h2>Tentang KKMA 04 Jember</h2>
            <p class="mb-0 opacity-75">Kelompok Kerja Madrasah Aliyah — Kecamatan Sukowono</p>
        </div>

        <div class="row g-4">
            <div class="col-md-6">
                <div class="form-section h-100">
                    <h5 class="mb-3"><i class="bi bi-info-circle text-primary me-2"></i>Profil</h5>
                    <table class="table table-sm table-borderless">
                        <tr><td class="text-muted" style="width:40%">Nama</td><td><strong>${KKMA_DATA.profil.nama}</strong></td></tr>
                        <tr><td class="text-muted">Wilayah</td><td>${KKMA_DATA.profil.wilayah}</td></tr>
                        <tr><td class="text-muted">Kabupaten</td><td>${KKMA_DATA.profil.kabupaten}</td></tr>
                        <tr><td class="text-muted">Provinsi</td><td>${KKMA_DATA.profil.provinsi}</td></tr>
                        <tr><td class="text-muted">Jenjang</td><td>${KKMA_DATA.profil.jenjang}</td></tr>
                        <tr><td class="text-muted">Status</td><td>${KKMA_DATA.profil.status_semua}</td></tr>
                        <tr><td class="text-muted">Jumlah Madrasah</td><td><strong>${KKMA_DATA.profil.jumlah_madrasah}</strong></td></tr>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-section h-100">
                    <h5 class="mb-3"><i class="bi bi-person-badge text-primary me-2"></i>Pengawas Pembina</h5>
                    <div class="text-center mb-3">
                        <div class="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center" style="width:100px;height:100px">
                            <i class="bi bi-person-fill text-success" style="font-size:3rem"></i>
                        </div>
                    </div>
                    <p class="text-center fw-bold fs-5 mb-1">${KKMA_DATA.profil.pengawas}</p>
                    <p class="text-center text-muted mb-3">NIP. ${KKMA_DATA.profil.nip_pengawas}</p>
                    <p class="text-center small text-muted">Pengawas Madrasah — Kementerian Agama Kabupaten Jember</p>
                </div>
            </div>
            <div class="col-12">
                <div class="form-section">
                    <h5 class="mb-3"><i class="bi bi-bullseye text-primary me-2"></i>Visi & Misi</h5>
                    <h6>Visi</h6>
                    <p>Terwujudnya madrasah aliyah yang bermutu, berdaya saing, dan berakhlak mulia di Kecamatan Sukowono.</p>
                    <h6>Misi</h6>
                    <ul>
                        <li>Meningkatkan mutu pembelajaran dan lulusan madrasah aliyah</li>
                        <li>Mengembangkan profesionalisme guru dan tenaga kependidikan</li>
                        <li>Memperkuat tata kelola madrasah yang transparan dan akuntabel</li>
                        <li>Membangun kerjasama antar madrasah dalam pengembangan mutu</li>
                        <li>Mengintegrasikan nilai-nilai keislaman dalam seluruh kegiatan pendidikan</li>
                    </ul>
                </div>
            </div>
        </div>`;
    }

    // ============ 404 ============
    function renderNotFound() {
        app.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-question-circle"></i>
            <h5>Halaman Tidak Ditemukan</h5>
            <p>Halaman yang Anda cari tidak tersedia.</p>
            <a href="#/" class="btn btn-primary btn-sm">Kembali ke Beranda</a>
        </div>`;
    }

    // Initial render
    navigate();
})();

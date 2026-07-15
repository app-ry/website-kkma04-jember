// KKMA 04 Jember - App v2.0 (Firebase multi-user)
(function(){
'use strict';
const $=id=>document.getElementById(id);
const app=$('app');
const H=s=>s?s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])):'';
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fmt=d=>{if(!d)return'-';const p=d.split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d;};

// NAV
const MENUS=[
    {id:'beranda',href:'#/',icon:'house-door',label:'Beranda'},
    {id:'madrasah',href:'#/madrasah',icon:'building',label:'Madrasah'},
    {id:'guru',href:'#/guru',icon:'people',label:'Guru'},
    {id:'siswa',href:'#/siswa',icon:'mortarboard',label:'Siswa'},
    {id:'rekap-siswa',href:'#/rekap-siswa',icon:'clipboard2-data',label:'Rekap Data Siswa'},
    {id:'supervisi',href:'#/supervisi',icon:'clipboard-check',label:'Supervisi'},
    {id:'upload-dokumen',href:'#/upload-dokumen',icon:'cloud-arrow-up',label:'Upload Dokumen'},
    {id:'informasi',href:'#/informasi',icon:'newspaper',label:'Informasi'},
    {id:'download',href:'#/download',icon:'download',label:'Download'},
    {id:'direktori',href:'#/direktori',icon:'person-lines-fill',label:'Direktori'},
    {id:'dashboard',href:'#/dashboard',icon:'speedometer2',label:'Dashboard'},
    {id:'kontak',href:'#/kontak',icon:'telephone',label:'Kontak'},
    {id:'tentang',href:'#/tentang',icon:'info-circle',label:'Tentang'},
];

function renderNav(){
    const nl=$('navLinks');
    const u=Session.getUser();
    let menuHtml=MENUS.map(m=>`<li class="nav-item"><a class="nav-link" href="${m.href}" data-nav="${m.id}"><i class="bi bi-${m.icon} me-1"></i>${m.label}</a></li>`).join('');
    if(u){
        menuHtml+=`<li class="nav-item"><a class="nav-link text-warning" href="#" onclick="Session.logout();return false;"><i class="bi bi-box-arrow-right me-1"></i>Logout</a></li>`;
    }
    nl.innerHTML=menuHtml;
    $('navUser').innerHTML=u?`<span class="badge bg-light text-dark"><i class="bi bi-person-circle me-1"></i>${H(u.nama)} (${u.role})</span>`
        :`<a href="#/login" class="btn btn-sm btn-outline-light"><i class="bi bi-box-arrow-in-right me-1"></i>Login</a>`;
}

// ROUTER
function getRoute(){
    const h=location.hash.slice(1)||'/';
    const [p,...rest]=h.split('/').filter(Boolean);
    return {path:'/'+( p||''),params:rest};
}

let _data={madrasah:[],guru:[],siswa:[],berita:[],supervisi:[],laporan:[],dokumen:[],galeri:[],pkkm:[],pkg:[],rapor_mutu:[],aspirasi:[],uploads:[],rekap_siswa:{}};
let _profil={...KKMA.profil};
let _ready=false;

// Listen to all data
function initListeners(){
    DB.listen('profil',v=>{if(v)_profil=v;if(_ready)navigate();});
    ['madrasah','guru','siswa','berita','supervisi','laporan','dokumen','galeri','pkkm','pkg','rapor_mutu','aspirasi','uploads'].forEach(k=>{
        DB.listen(k,v=>{_data[k]=DB.toArray(v);if(_ready)navigate();});
    });
    // Special: madrasah keyed by nsm
    DB.listen('madrasah',v=>{
        if(v){_data.madrasah=Object.keys(v).map(k=>({_id:k,...v[k]}));}else{_data.madrasah=[];}
        if(_ready)navigate();
    });
    // Special: rekap_siswa keyed by nsm, keep as object
    DB.listen('rekap_siswa',v=>{
        if(v){_data.rekap_siswa=v;}else{_data.rekap_siswa={};}
        if(_ready)navigate();
    });
}

async function boot(){
    renderNav();
    try{await DB.initDefaults();}catch(e){console.warn('Firebase init:',e);}
    initListeners();
    setTimeout(()=>{_ready=true;navigate();},1500);
}

function navigate(){
    const{path,params}=getRoute();
    document.querySelectorAll('[data-nav]').forEach(el=>el.classList.toggle('active',el.getAttribute('href')===location.hash||el.dataset.nav===path.slice(1)));
    // Close mobile nav
    const c=document.querySelector('.navbar-collapse.show');
    if(c)bootstrap.Collapse.getOrCreateInstance(c).hide();

    switch(path){
        case '/':renderBeranda();break;
        case '/madrasah':params[0]?renderMadrasahDetail(params[0]):renderMadrasah();break;
        case '/madrasah-form':renderMadrasahForm(params[0]);break;
        case '/guru':params[0]==='tambah'?renderGuruForm():params[0]==='edit'?renderGuruForm(params[1]):renderGuru();break;
        case '/siswa':params[0]==='tambah'?renderSiswaForm():params[0]==='edit'?renderSiswaForm(params[1]):renderSiswa();break;
        case '/rekap-siswa':renderRekapSiswa();break;
        case '/supervisi':renderSupervisi();break;
        case '/upload-dokumen':renderUploadDokumen();break;
        case '/informasi':renderInformasi();break;
        case '/download':renderDownload();break;
        case '/direktori':renderDirektori();break;
        case '/dashboard':renderDashboard();break;
        case '/kontak':renderKontak();break;
        case '/tentang':renderTentang();break;
        case '/login':renderLogin();break;
        default:app.innerHTML=`<div class="text-center py-5"><h4>404</h4><p>Halaman tidak ditemukan</p><a href="#/" class="btn btn-primary btn-sm">Beranda</a></div>`;
    }
    window.scrollTo(0,0);
}
window.addEventListener('hashchange',navigate);

// Helpers
function getMadrasah(nsm){return _data.madrasah.find(m=>(m._id||m.nsm)===nsm);}
function guruByNsm(nsm){return _data.guru.filter(g=>g.nsm===nsm);}
function siswaByNsm(nsm){return _data.siswa.filter(s=>s.nsm===nsm);}
function canEdit(){return Session.isLoggedIn();}

// ============ LOGIN ============
function renderLogin(){
    app.innerHTML=`<div class="row justify-content-center"><div class="col-md-5"><div class="form-section">
    <h4 class="text-center mb-4"><i class="bi bi-box-arrow-in-right text-primary me-2"></i>Login</h4>
    <form id="fLogin"><div class="mb-3"><label class="form-label">Nama</label><input type="text" class="form-control" name="nama" required></div>
    <div class="mb-3"><label class="form-label">Kode Akses</label><input type="password" class="form-control" name="kode" required>
    <small class="text-muted">Hubungi pengawas untuk mendapatkan kode akses</small></div>
    <button type="submit" class="btn btn-primary w-100">Masuk</button></form>
    <div id="loginErr" class="text-danger text-center mt-2 small"></div></div></div></div>`;
    $('fLogin').addEventListener('submit',e=>{
        e.preventDefault();
        const fd=new FormData(e.target);
        const nama=fd.get('nama').trim(),kode=fd.get('kode').trim();
        if(kode===Session.ADMIN_CODE){Session.login(nama,'admin');renderNav();location.hash='#/';}
        else if(kode===Session.OPERATOR_CODE){Session.login(nama,'operator');renderNav();location.hash='#/';}
        else{$('loginErr').textContent='Kode akses salah!';}
    });
}

// ============ BERANDA ============
function renderBeranda(){
    const berita=_data.berita.sort((a,b)=>(b.tanggal||'').localeCompare(a.tanggal||'')).slice(0,3);
    app.innerHTML=`
    <div class="hero-section text-center">
        <h1><i class="bi bi-building"></i> KKMA 04 Jember</h1>
        <p class="lead mb-1">Kelompok Kerja Madrasah Aliyah</p>
        <p class="mb-0 opacity-75">Kecamatan Sukowono | Kabupaten Jember | Jawa Timur</p>
    </div>
    <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body d-flex align-items-center gap-3"><div class="stat-icon bg-success bg-opacity-10 text-success"><i class="bi bi-building"></i></div><div><div class="fw-bold fs-4">${_data.madrasah.length}</div><small class="text-muted">Madrasah</small></div></div></div></div>
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body d-flex align-items-center gap-3"><div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-people"></i></div><div><div class="fw-bold fs-4">${_data.guru.length}</div><small class="text-muted">Guru</small></div></div></div></div>
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body d-flex align-items-center gap-3"><div class="stat-icon bg-info bg-opacity-10 text-info"><i class="bi bi-mortarboard"></i></div><div><div class="fw-bold fs-4">${_data.siswa.length}</div><small class="text-muted">Siswa</small></div></div></div></div>
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body d-flex align-items-center gap-3"><div class="stat-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-person-badge"></i></div><div><div class="fw-bold fs-4">1</div><small class="text-muted">Pengawas</small></div></div></div></div>
    </div>
    <div class="row g-4">
        <div class="col-lg-7">
            <div class="form-section sambutan-card">
                <h5 class="mb-3"><i class="bi bi-chat-quote text-primary me-2"></i>Sambutan Pengawas Pembina</h5>
                <p class="small" style="white-space:pre-line">${H(_profil.sambutan)}</p>
                <p class="fw-bold mb-0 small text-end">- ${H(_profil.pengawas)}</p>
            </div>
            <div class="form-section">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0"><i class="bi bi-newspaper text-primary me-2"></i>Berita Terbaru</h5>
                    <a href="#/informasi" class="btn btn-sm btn-outline-primary">Semua &raquo;</a>
                </div>
                ${berita.length?berita.map(b=>`<div class="berita-card p-3 mb-2 bg-light rounded"><h6 class="mb-1">${H(b.judul)}</h6><small class="text-muted"><i class="bi bi-calendar me-1"></i>${fmt(b.tanggal)} | ${H(b.kategori||'')}</small><p class="small mt-1 mb-0 text-truncate">${H(b.isi)}</p></div>`).join(''):'<p class="text-muted small">Belum ada berita.</p>'}
            </div>
        </div>
        <div class="col-lg-5">
            <div class="form-section">
                <h5 class="mb-3"><i class="bi bi-bullseye text-primary me-2"></i>Visi & Misi</h5>
                <p class="fw-bold small">${H(_profil.visi)}</p>
                <ol class="small mb-0">${(_profil.misi||[]).map(m=>`<li>${H(m)}</li>`).join('')}</ol>
            </div>
            <div class="form-section">
                <h5 class="mb-3"><i class="bi bi-person-badge text-primary me-2"></i>Pengawas Pembina</h5>
                <div class="text-center"><div class="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style="width:70px;height:70px"><i class="bi bi-person-fill text-success fs-2"></i></div>
                <p class="fw-bold mb-0">${H(_profil.pengawas)}</p><p class="text-muted small">NIP. ${H(_profil.nip_pengawas)}</p></div>
            </div>
        </div>
    </div>`;
}

// ============ MADRASAH ============
let _viewMdr='card';
function renderMadrasah(){
    const viewBtns=`<div class="btn-group btn-group-sm me-1" role="group"><button class="btn btn-sm ${_viewMdr==='card'?'btn-primary':'btn-outline-primary'}" id="btnViewCard"><i class="bi bi-grid-3x3-gap"></i></button><button class="btn btn-sm ${_viewMdr==='table'?'btn-primary':'btn-outline-primary'}" id="btnViewTable"><i class="bi bi-table"></i></button></div>`;
    const renderCards=()=>`<div class="row g-3" id="mdrGrid">${_data.madrasah.map(m=>`
        <div class="col-md-6 col-lg-4 mdr-item" data-q="${H((m.nama||'').toLowerCase())}">
            <div class="card madrasah-card h-100">
                <div class="card-header py-2 px-3 d-flex justify-content-between align-items-center">
                    <small class="opacity-75">NSM: ${m.nsm||m._id}</small>
                    ${canEdit()?`<div><button class="btn btn-sm btn-light py-0 px-1" onclick="event.stopPropagation();location.hash='#/madrasah-form/${m._id||m.nsm}'"><i class="bi bi-pencil text-primary"></i></button> <button class="btn btn-sm btn-light py-0 px-1 btnDelMdr" data-id="${m._id||m.nsm}"><i class="bi bi-trash text-danger"></i></button></div>`:''}
                </div>
                <div class="card-body" style="cursor:pointer" onclick="location.hash='#/madrasah/${m._id||m.nsm}'">
                    <h6 class="mb-1">${H(m.nama)}</h6>
                    <p class="small text-muted mb-1"><i class="bi bi-person me-1"></i>${H(m.kepala)}</p>
                    <p class="small text-muted mb-0"><i class="bi bi-geo-alt me-1"></i>${H(m.alamat)}</p>
                </div>
                <div class="card-footer bg-transparent small text-muted">${guruByNsm(m._id||m.nsm).length} guru | ${siswaByNsm(m._id||m.nsm).length} siswa</div>
            </div>
        </div>`).join('')}</div>`;
    const renderTabel=()=>`<div class="table-responsive" id="mdrGrid"><table class="table table-sm table-hover table-data"><thead><tr><th>No</th><th>NSM</th><th>Nama Madrasah</th><th>Kepala</th><th>Alamat</th><th>Guru</th><th>Siswa</th>${canEdit()?`<th></th>`:''}</tr></thead><tbody>${_data.madrasah.map((m,i)=>`<tr class="mdr-item" data-q="${H((m.nama||'').toLowerCase())}" style="cursor:pointer" onclick="location.hash='#/madrasah/${m._id||m.nsm}'"><td>${i+1}</td><td>${m.nsm||m._id}</td><td><strong>${H(m.nama)}</strong></td><td>${H(m.kepala)}</td><td>${H(m.alamat)}</td><td class="text-center">${guruByNsm(m._id||m.nsm).length}</td><td class="text-center">${siswaByNsm(m._id||m.nsm).length}</td>${canEdit()?`<td class="text-end" onclick="event.stopPropagation()"><button class="btn btn-sm btn-light py-0 px-1" onclick="location.hash='#/madrasah-form/${m._id||m.nsm}'"><i class="bi bi-pencil text-primary"></i></button> <button class="btn btn-sm btn-light py-0 px-1 btnDelMdr" data-id="${m._id||m.nsm}"><i class="bi bi-trash text-danger"></i></button></td>`:''}</tr>`).join('')}</tbody></table></div>`;
    app.innerHTML=`<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h4 class="mb-0"><i class="bi bi-building text-primary me-2"></i>Data Madrasah</h4>
        <div class="d-flex gap-2">
            <div class="search-box"><i class="bi bi-search"></i><input type="text" class="form-control form-control-sm" id="sMdr" placeholder="Cari..."></div>
            ${viewBtns}
            ${canEdit()?`<button class="btn btn-primary btn-sm" onclick="location.hash='#/madrasah-form'"><i class="bi bi-plus-lg"></i></button>`:''}<button class="btn btn-outline-secondary btn-sm" id="btnCetakMdr"><i class="bi bi-printer me-1"></i>Cetak</button>
        </div></div>
    <div id="mdrContent">${_viewMdr==='table'?renderTabel():renderCards()}</div>`;
    $('sMdr').addEventListener('input',function(){const q=this.value.toLowerCase();document.querySelectorAll('.mdr-item').forEach(el=>{el.style.display=el.dataset.q.includes(q)?'':'none';});});
    document.querySelectorAll('.btnDelMdr').forEach(b=>b.addEventListener('click',function(e){e.stopPropagation();if(confirm('Hapus madrasah ini beserta data guru & siswa terkait?')){const id=this.dataset.id;DB.remove('madrasah/'+id);_data.guru.filter(g=>g.nsm===id).forEach(g=>DB.remove('guru/'+g._id));_data.siswa.filter(s=>s.nsm===id).forEach(s=>DB.remove('siswa/'+s._id));}}));
    $('btnViewCard')?.addEventListener('click',()=>{_viewMdr='card';renderMadrasah();});
    $('btnViewTable')?.addEventListener('click',()=>{_viewMdr='table';renderMadrasah();});
    $('btnCetakMdr')?.addEventListener('click',()=>{window.print();});
}

function renderMadrasahDetail(nsm){
    const m=getMadrasah(nsm);if(!m){app.innerHTML='<p>Tidak ditemukan</p>';return;}
    const gl=guruByNsm(nsm),sl=siswaByNsm(nsm);
    app.innerHTML=`<a href="#/madrasah" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>
    <div class="detail-header"><h4 class="mb-1">${H(m.nama)}</h4><p class="mb-0 opacity-75">NSM: ${m.nsm||m._id} | ${H(m.alamat)}</p></div>
    <div class="row g-3 mb-3"><div class="col-md-6"><div class="form-section"><h6>Identitas</h6><table class="table table-sm table-borderless small mb-0">
        <tr><td class="text-muted w-40">Kepala Madrasah</td><td>${H(m.kepala)}</td></tr>
        <tr><td class="text-muted">Akreditasi</td><td>${H(m.akreditasi||'-')}</td></tr>
        <tr><td class="text-muted">Telp</td><td>${H(m.telp||'-')}</td></tr>
        <tr><td class="text-muted">Email</td><td>${H(m.email||'-')}</td></tr>
    </table></div></div>
    <div class="col-md-6"><div class="form-section"><h6>Statistik</h6><div class="row text-center g-2">
        <div class="col-4"><div class="p-2 bg-success bg-opacity-10 rounded"><div class="fw-bold fs-5 text-success">${gl.length}</div><small>Guru</small></div></div>
        <div class="col-4"><div class="p-2 bg-info bg-opacity-10 rounded"><div class="fw-bold fs-5 text-info">${sl.filter(s=>s.jk==='L').length}</div><small>Siswa L</small></div></div>
        <div class="col-4"><div class="p-2 bg-warning bg-opacity-10 rounded"><div class="fw-bold fs-5 text-warning">${sl.filter(s=>s.jk==='P').length}</div><small>Siswa P</small></div></div>
    </div></div></div></div>
    ${gl.length?`<div class="form-section"><h6><i class="bi bi-people text-primary me-1"></i>Guru (${gl.length})</h6><div class="table-responsive"><table class="table table-sm table-data"><thead><tr><th>No</th><th>Nama</th><th>Mapel</th><th>Status</th></tr></thead><tbody>${gl.map((g,i)=>`<tr><td>${i+1}</td><td>${H(g.nama)}</td><td>${H(g.mapel||'-')}</td><td><span class="badge ${g.status_kepegawaian==='PNS'?'bg-success':'bg-secondary'}">${H(g.status_kepegawaian||'Non-PNS')}</span></td></tr>`).join('')}</tbody></table></div></div>`:''}
    ${sl.length?`<div class="form-section"><h6><i class="bi bi-mortarboard text-primary me-1"></i>Siswa (${sl.length})</h6><div class="table-responsive"><table class="table table-sm table-data"><thead><tr><th>No</th><th>Nama</th><th>Kelas</th><th>JK</th></tr></thead><tbody>${sl.map((s,i)=>`<tr><td>${i+1}</td><td>${H(s.nama)}</td><td>${H(s.kelas||'-')}</td><td>${s.jk||'-'}</td></tr>`).join('')}</tbody></table></div></div>`:''}`;
}

function renderMadrasahForm(nsm){
    if(!canEdit()){location.hash='#/login';return;}
    const m=nsm?getMadrasah(nsm):null;
    app.innerHTML=`<a href="#/madrasah" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>
    <div class="form-section" style="max-width:700px"><h5 class="mb-3">${m?'Edit':'Tambah'} Madrasah</h5>
    <form id="fMdr"><div class="row g-3">
        <div class="col-md-6"><label class="form-label">Nama *</label><input class="form-control" name="nama" value="${H(m?.nama||'')}" required></div>
        <div class="col-md-6"><label class="form-label">NSM *</label><input class="form-control" name="nsm" value="${H(m?.nsm||m?._id||'')}" ${m?'readonly':''} required></div>
        <div class="col-md-6"><label class="form-label">Kepala Madrasah</label><input class="form-control" name="kepala" value="${H(m?.kepala||'')}"></div>
        <div class="col-md-6"><label class="form-label">Alamat</label><input class="form-control" name="alamat" value="${H(m?.alamat||'')}"></div>
        <div class="col-md-4"><label class="form-label">Telp</label><input class="form-control" name="telp" value="${H(m?.telp||'')}"></div>
        <div class="col-md-4"><label class="form-label">Email</label><input class="form-control" name="email" value="${H(m?.email||'')}"></div>
        <div class="col-md-4"><label class="form-label">Akreditasi</label><select class="form-select" name="akreditasi"><option value="-">-</option>${['A','B','C','Belum'].map(v=>`<option ${(m?.akreditasi||'')=== v?'selected':''}>${v}</option>`).join('')}</select></div>
    </div><button type="submit" class="btn btn-primary mt-3">Simpan</button></form></div>`;
    $('fMdr').addEventListener('submit',e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));const key=fd.nsm;delete fd.nsm;fd.nsm=key;DB.set('madrasah/'+key,fd);location.hash='#/madrasah';});
}

// ============ GURU ============
function renderGuru(){
    app.innerHTML=`<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h4 class="mb-0"><i class="bi bi-people text-primary me-2"></i>Data Guru <span class="badge bg-secondary">${_data.guru.length}</span></h4>
        <div class="d-flex gap-2 flex-wrap"><div class="search-box"><i class="bi bi-search"></i><input class="form-control form-control-sm" id="sGuru" placeholder="Cari..."></div>
        ${canEdit()?`<a href="#/guru/tambah" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i></a><button class="btn btn-success btn-sm" id="btnTemplateGuru"><i class="bi bi-file-earmark-excel me-1"></i>Template</button><button class="btn btn-warning btn-sm" id="btnImportGuru"><i class="bi bi-upload me-1"></i>Import</button><input type="file" id="inputImportGuru" accept=".xlsx,.xls" style="display:none">`:''}<select class="form-select form-select-sm" style="width:auto" id="fExportGuru"><option value="">Semua Lembaga</option>${_data.madrasah.map(m=>`<option value="${m._id||m.nsm}">${H(m.nama)}</option>`).join('')}</select><button class="btn btn-info btn-sm" id="btnExportGuru"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Export Excel</button><button class="btn btn-outline-secondary btn-sm" id="btnCetakGuru"><i class="bi bi-printer me-1"></i>Cetak</button></div></div>
    <div class="form-section"><div class="table-responsive"><table class="table table-sm table-data"><thead><tr><th>No</th><th>Nama</th><th>Madrasah</th><th>Mapel</th><th>Status</th>${canEdit()?'<th>Aksi</th>':''}</tr></thead>
    <tbody id="tGuru">${_data.guru.map((g,i)=>{const m=getMadrasah(g.nsm);return`<tr data-nsm="${g.nsm}" data-q="${H((g.nama||'').toLowerCase())}"><td>${i+1}</td><td><strong>${H(g.nama)}</strong></td><td class="small">${m?H(m.nama):'-'}</td><td>${H(g.mapel||'-')}</td><td><span class="badge ${g.status_kepegawaian==='PNS'?'bg-success':'bg-secondary'}">${H(g.status_kepegawaian||'Non-PNS')}</span></td>${canEdit()?`<td><a href="#/guru/edit/${g._id}" class="btn btn-sm btn-outline-primary py-0 px-1"><i class="bi bi-pencil"></i></a> <button class="btn btn-sm btn-outline-danger py-0 px-1 dGuru" data-id="${g._id}"><i class="bi bi-trash"></i></button></td>`:''}</tr>`;}).join('')}</tbody></table></div>
    ${!_data.guru.length?'<p class="text-center text-muted">Belum ada data guru</p>':''}</div>`;
    const sEl=$('sGuru'),fEl=$('fExportGuru');
    function fil(){const q=(sEl?.value||'').toLowerCase(),n=fEl?.value||'';document.querySelectorAll('#tGuru tr').forEach(r=>{r.style.display=(r.dataset.q.includes(q)&&(!n||r.dataset.nsm===n))?'':'none';});}
    sEl?.addEventListener('input',fil);fEl?.addEventListener('change',fil);
    document.querySelectorAll('.dGuru').forEach(b=>b.addEventListener('click',function(){if(confirm('Hapus guru ini?'))DB.remove('guru/'+this.dataset.id);}));
    $('btnCetakGuru')?.addEventListener('click',()=>{window.print();});
    // Template Excel Guru
    $('btnTemplateGuru')?.addEventListener('click',async()=>{
        const wb=new ExcelJS.Workbook();
        const ws=wb.addWorksheet('Data Guru');
        ws.columns=[{header:'NSM Madrasah',key:'nsm',width:16},{header:'Nama Guru',key:'nama',width:30},{header:'NIP',key:'nip',width:20},{header:'NUPTK',key:'nuptk',width:18},{header:'Mapel',key:'mapel',width:20},{header:'Status (PNS/Non-PNS)',key:'status_kepegawaian',width:18},{header:'JK (L/P)',key:'jk',width:8},{header:'Pendidikan',key:'pendidikan',width:12},{header:'No HP',key:'telp',width:15}];
        ws.getRow(1).font={bold:true};
        // Add NSM reference sheet
        const ws2=wb.addWorksheet('Ref Madrasah');
        ws2.columns=[{header:'NSM',key:'nsm',width:16},{header:'Nama Madrasah',key:'nama',width:35}];
        ws2.getRow(1).font={bold:true};
        _data.madrasah.forEach(m=>ws2.addRow({nsm:m._id||m.nsm,nama:m.nama}));
        const buf=await wb.xlsx.writeBuffer();
        const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Template_Guru_KKMA04.xlsx';a.click();
    });
    // Import Excel Guru
    $('btnImportGuru')?.addEventListener('click',()=>{$('inputImportGuru').click();});
    $('inputImportGuru')?.addEventListener('change',async function(){
        const file=this.files[0];if(!file)return;
        const wb=new ExcelJS.Workbook();
        await wb.xlsx.load(await file.arrayBuffer());
        const ws=wb.worksheets[0];let count=0;
        ws.eachRow((row,i)=>{
            if(i===1)return;// skip header
            const nsm=String(row.getCell(1).value||'').trim();
            const nama=String(row.getCell(2).value||'').trim();
            if(!nsm||!nama)return;
            const data={nsm,nama,nip:String(row.getCell(3).value||'').trim(),nuptk:String(row.getCell(4).value||'').trim(),mapel:String(row.getCell(5).value||'').trim(),status_kepegawaian:String(row.getCell(6).value||'Non-PNS').trim(),jk:String(row.getCell(7).value||'L').trim(),pendidikan:String(row.getCell(8).value||'').trim(),telp:String(row.getCell(9).value||'').trim()};
            DB.push('guru',data);count++;
        });
        alert('Import selesai: '+count+' guru ditambahkan');this.value='';
    });
    // Export Excel Guru
    $('btnExportGuru')?.addEventListener('click',async()=>{
        const nsm=$('fExportGuru')?.value||'';
        const md=getMadrasah(nsm);
        const label=md?md.nama.replace(/[^a-zA-Z0-9]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,''):'Semua_Lembaga';
        const data=nsm?_data.guru.filter(g=>g.nsm===nsm):_data.guru;
        const wb=new ExcelJS.Workbook();
        const ws=wb.addWorksheet('Data Guru');
        ws.columns=[{header:'No',key:'no',width:5},{header:'NSM',key:'nsm',width:16},{header:'Nama Guru',key:'nama',width:30},{header:'NIP',key:'nip',width:20},{header:'NUPTK',key:'nuptk',width:18},{header:'Madrasah',key:'madrasah',width:30},{header:'Mapel',key:'mapel',width:20},{header:'Status',key:'status_kepegawaian',width:15},{header:'JK',key:'jk',width:8},{header:'Pendidikan',key:'pendidikan',width:12},{header:'No HP',key:'telp',width:15}];
        ws.getRow(1).font={bold:true};
        data.forEach((g,i)=>{
            const m=getMadrasah(g.nsm);
            ws.addRow({no:i+1,nsm:g.nsm,nama:g.nama,nip:g.nip||'',nuptk:g.nuptk||'',madrasah:m?m.nama:'',mapel:g.mapel||'',status_kepegawaian:g.status_kepegawaian||'Non-PNS',jk:g.jk||'',pendidikan:g.pendidikan||'',telp:g.telp||''});
        });
        const buf=await wb.xlsx.writeBuffer();
        const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Data_Guru_${label}.xlsx`;a.click();
    });
}

function renderGuruForm(editId){
    if(!canEdit()){location.hash='#/login';return;}
    const g=editId?_data.guru.find(x=>x._id===editId):null;
    const qNsm=new URLSearchParams(location.hash.split('?')[1]||'').get('nsm')||'';
    app.innerHTML=`<a href="#/guru" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>
    <div class="form-section" style="max-width:700px"><h5 class="mb-3">${g?'Edit':'Tambah'} Guru</h5>
    <form id="fGuru"><div class="row g-3">
        <div class="col-md-6"><label class="form-label">Nama *</label><input class="form-control" name="nama" value="${H(g?.nama||'')}" required></div>
        <div class="col-md-6"><label class="form-label">Madrasah *</label><select class="form-select" name="nsm" required><option value="">--Pilih--</option>${_data.madrasah.map(m=>`<option value="${m._id||m.nsm}" ${(g?.nsm||qNsm)===(m._id||m.nsm)?'selected':''}>${H(m.nama)}</option>`).join('')}</select></div>
        <div class="col-md-6"><label class="form-label">NIP</label><input class="form-control" name="nip" value="${H(g?.nip||'')}"></div>
        <div class="col-md-6"><label class="form-label">NUPTK</label><input class="form-control" name="nuptk" value="${H(g?.nuptk||'')}"></div>
        <div class="col-md-6"><label class="form-label">Mapel</label><input class="form-control" name="mapel" value="${H(g?.mapel||'')}"></div>
        <div class="col-md-3"><label class="form-label">Status</label><select class="form-select" name="status_kepegawaian"><option ${g?.status_kepegawaian!=='PNS'?'selected':''}>Non-PNS</option><option ${g?.status_kepegawaian==='PNS'?'selected':''}>PNS</option></select></div>
        <div class="col-md-3"><label class="form-label">JK</label><select class="form-select" name="jk"><option value="L" ${(g?.jk||'L')==='L'?'selected':''}>L</option><option value="P" ${g?.jk==='P'?'selected':''}>P</option></select></div>
        <div class="col-md-6"><label class="form-label">Pendidikan</label><select class="form-select" name="pendidikan"><option value="">--</option>${['SMA','D3','S1','S2','S3'].map(p=>`<option ${g?.pendidikan===p?'selected':''}>${p}</option>`).join('')}</select></div>
        <div class="col-md-6"><label class="form-label">No. HP</label><input class="form-control" name="telp" value="${H(g?.telp||'')}"></div>
    </div><button type="submit" class="btn btn-primary mt-3">Simpan</button></form></div>`;
    $('fGuru').addEventListener('submit',e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));if(g){DB.update('guru/'+g._id,fd);}else{DB.push('guru',fd);}location.hash='#/guru';});
}

// ============ SISWA ============
function renderSiswa(){
    // Rekap
    const rekap=_data.madrasah.map(m=>{const s=siswaByNsm(m._id||m.nsm);return{nama:m.nama,x_l:s.filter(x=>x.kelas==='X'&&x.jk==='L').length,x_p:s.filter(x=>x.kelas==='X'&&x.jk==='P').length,xi_l:s.filter(x=>x.kelas==='XI'&&x.jk==='L').length,xi_p:s.filter(x=>x.kelas==='XI'&&x.jk==='P').length,xii_l:s.filter(x=>x.kelas==='XII'&&x.jk==='L').length,xii_p:s.filter(x=>x.kelas==='XII'&&x.jk==='P').length,total:s.length};});
    const tot=k=>rekap.reduce((s,r)=>s+r[k],0);

    app.innerHTML=`<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 no-print">
        <h4 class="mb-0"><i class="bi bi-mortarboard text-primary me-2"></i>Data Siswa <span class="badge bg-secondary">${_data.siswa.length}</span></h4>
        <div class="d-flex gap-2 flex-wrap"><div class="search-box"><i class="bi bi-search"></i><input class="form-control form-control-sm" id="sSiswa" placeholder="Cari..."></div>
        ${canEdit()?`<a href="#/siswa/tambah" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i></a><button class="btn btn-success btn-sm" id="btnTemplateSiswa"><i class="bi bi-file-earmark-excel me-1"></i>Template</button><button class="btn btn-warning btn-sm" id="btnImportSiswa"><i class="bi bi-upload me-1"></i>Import</button><input type="file" id="inputImportSiswa" accept=".xlsx,.xls" style="display:none">`:''}<button class="btn btn-outline-secondary btn-sm" id="btnCetakRekap"><i class="bi bi-printer me-1"></i>Cetak Rekap</button></div></div>
    <div class="section-rekap"><div class="print-only" style="text-align:center;margin-bottom:10px;"><h5>REKAPITULASI DATA SISWA KKMA 04 JEMBER</h5><p class="small">Kecamatan Sukowono, Kabupaten Jember</p></div><div class="form-section mb-4"><h5 class="mb-3 no-print"><i class="bi bi-table text-primary me-2"></i>Rekapitulasi Per Lembaga</h5>
    <div class="table-responsive"><table class="table table-sm table-bordered table-data"><thead><tr><th rowspan="2" class="align-middle text-center">No</th><th rowspan="2" class="align-middle">Madrasah</th><th colspan="2" class="text-center">X</th><th colspan="2" class="text-center">XI</th><th colspan="2" class="text-center">XII</th><th class="text-center">Total</th></tr><tr><th class="text-center">L</th><th class="text-center">P</th><th class="text-center">L</th><th class="text-center">P</th><th class="text-center">L</th><th class="text-center">P</th><th class="text-center">Jml</th></tr></thead>
    <tbody>${rekap.map((r,i)=>`<tr><td class="text-center">${i+1}</td><td class="small">${H(r.nama)}</td><td class="text-center">${r.x_l||'-'}</td><td class="text-center">${r.x_p||'-'}</td><td class="text-center">${r.xi_l||'-'}</td><td class="text-center">${r.xi_p||'-'}</td><td class="text-center">${r.xii_l||'-'}</td><td class="text-center">${r.xii_p||'-'}</td><td class="text-center fw-bold">${r.total||'-'}</td></tr>`).join('')}</tbody>
    <tfoot><tr class="table-success fw-bold"><td colspan="2" class="text-center">TOTAL KKMA 04</td><td class="text-center">${tot('x_l')||'-'}</td><td class="text-center">${tot('x_p')||'-'}</td><td class="text-center">${tot('xi_l')||'-'}</td><td class="text-center">${tot('xi_p')||'-'}</td><td class="text-center">${tot('xii_l')||'-'}</td><td class="text-center">${tot('xii_p')||'-'}</td><td class="text-center">${_data.siswa.length||'-'}</td></tr></tfoot></table></div></div>
    <div class="section-daftar"><div class="form-section"><div class="d-flex flex-wrap gap-2 mb-3"><select class="form-select form-select-sm" style="width:auto" id="fSMdr"><option value="">Semua Madrasah</option>${_data.madrasah.map(m=>`<option value="${m._id||m.nsm}">${H(m.nama)}</option>`).join('')}</select><select class="form-select form-select-sm" style="width:auto" id="fSKls"><option value="">Semua Kelas</option><option>X</option><option>XI</option><option>XII</option></select><button class="btn btn-outline-secondary btn-sm no-print" id="btnCetakDaftar"><i class="bi bi-printer me-1"></i>Cetak Daftar Nama</button></div>
    <div class="table-responsive"><table class="table table-sm table-data"><thead><tr><th>No</th><th>Nama</th><th>Madrasah</th><th>Kelas</th><th>JK</th>${canEdit()?'<th>Aksi</th>':''}</tr></thead><tbody id="tSiswa">${_data.siswa.map((s,i)=>{const m=getMadrasah(s.nsm);return`<tr data-nsm="${s.nsm}" data-kls="${s.kelas||''}" data-q="${H((s.nama||'').toLowerCase())}"><td>${i+1}</td><td>${H(s.nama)}</td><td class="small">${m?H(m.nama):'-'}</td><td>${H(s.kelas||'-')}</td><td>${s.jk||'-'}</td>${canEdit()?`<td><a href="#/siswa/edit/${s._id}" class="btn btn-sm btn-outline-primary py-0 px-1"><i class="bi bi-pencil"></i></a> <button class="btn btn-sm btn-outline-danger py-0 px-1 dSiswa" data-id="${s._id}"><i class="bi bi-trash"></i></button></td>`:''}</tr>`;}).join('')}</tbody></table></div>
    ${!_data.siswa.length?'<p class="text-center text-muted small">Belum ada data siswa</p>':''}</div></div>`;
    const sEl=$('sSiswa'),fM=$('fSMdr'),fK=$('fSKls');
    function fil(){const q=(sEl?.value||'').toLowerCase(),n=fM?.value||'',k=fK?.value||'';document.querySelectorAll('#tSiswa tr').forEach(r=>{r.style.display=(r.dataset.q.includes(q)&&(!n||r.dataset.nsm===n)&&(!k||r.dataset.kls===k))?'':'none';});}
    sEl?.addEventListener('input',fil);fM?.addEventListener('change',fil);fK?.addEventListener('change',fil);
    document.querySelectorAll('.dSiswa').forEach(b=>b.addEventListener('click',function(){if(confirm('Hapus?'))DB.remove('siswa/'+this.dataset.id);}));
    // Template Excel Siswa
    $('btnTemplateSiswa')?.addEventListener('click',async()=>{
        const wb=new ExcelJS.Workbook();
        const ws=wb.addWorksheet('Data Siswa');
        ws.columns=[{header:'NSM Madrasah',key:'nsm',width:16},{header:'Nama Siswa',key:'nama',width:30},{header:'NISN',key:'nisn',width:14},{header:'Kelas (X/XI/XII)',key:'kelas',width:14},{header:'JK (L/P)',key:'jk',width:8},{header:'Tempat Lahir',key:'tempat_lahir',width:18},{header:'Tgl Lahir (YYYY-MM-DD)',key:'tgl_lahir',width:18},{header:'Nama Ortu/Wali',key:'ortu',width:25},{header:'Alamat',key:'alamat',width:30}];
        ws.getRow(1).font={bold:true};
        const ws2=wb.addWorksheet('Ref Madrasah');
        ws2.columns=[{header:'NSM',key:'nsm',width:16},{header:'Nama Madrasah',key:'nama',width:35}];
        ws2.getRow(1).font={bold:true};
        _data.madrasah.forEach(m=>ws2.addRow({nsm:m._id||m.nsm,nama:m.nama}));
        const buf=await wb.xlsx.writeBuffer();
        const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Template_Siswa_KKMA04.xlsx';a.click();
    });
    // Import Excel Siswa
    $('btnImportSiswa')?.addEventListener('click',()=>{$('inputImportSiswa').click();});
    $('inputImportSiswa')?.addEventListener('change',async function(){
        const file=this.files[0];if(!file)return;
        const wb=new ExcelJS.Workbook();
        await wb.xlsx.load(await file.arrayBuffer());
        const ws=wb.worksheets[0];let count=0;
        ws.eachRow((row,i)=>{
            if(i===1)return;
            const nsm=String(row.getCell(1).value||'').trim();
            const nama=String(row.getCell(2).value||'').trim();
            if(!nsm||!nama)return;
            const data={nsm,nama,nisn:String(row.getCell(3).value||'').trim(),kelas:String(row.getCell(4).value||'').trim(),jk:String(row.getCell(5).value||'L').trim(),tempat_lahir:String(row.getCell(6).value||'').trim(),tgl_lahir:String(row.getCell(7).value||'').trim(),ortu:String(row.getCell(8).value||'').trim(),alamat:String(row.getCell(9).value||'').trim()};
            DB.push('siswa',data);count++;
        });
        alert('Import selesai: '+count+' siswa ditambahkan');this.value='';
    });
    $('btnCetakRekap')?.addEventListener('click',()=>{
        document.querySelector('.section-daftar')?.classList.add('no-print');
        document.querySelector('.section-rekap')?.classList.add('print-area');
        window.print();
        document.querySelector('.section-daftar')?.classList.remove('no-print');
        document.querySelector('.section-rekap')?.classList.remove('print-area');
    });
    $('btnCetakDaftar')?.addEventListener('click',()=>{
        document.querySelector('.section-rekap')?.classList.add('no-print');
        document.querySelector('.section-daftar')?.classList.add('print-area');
        window.print();
        document.querySelector('.section-rekap')?.classList.remove('no-print');
        document.querySelector('.section-daftar')?.classList.remove('print-area');
    });
}

function renderSiswaForm(editId){
    if(!canEdit()){location.hash='#/login';return;}
    const s=editId?_data.siswa.find(x=>x._id===editId):null;
    const qNsm=new URLSearchParams(location.hash.split('?')[1]||'').get('nsm')||'';
    app.innerHTML=`<a href="#/siswa" class="btn btn-outline-secondary btn-sm mb-3"><i class="bi bi-arrow-left me-1"></i>Kembali</a>
    <div class="form-section" style="max-width:700px"><h5 class="mb-3">${s?'Edit':'Tambah'} Siswa</h5>
    <form id="fSiswa"><div class="row g-3">
        <div class="col-md-6"><label class="form-label">Nama *</label><input class="form-control" name="nama" value="${H(s?.nama||'')}" required></div>
        <div class="col-md-6"><label class="form-label">Madrasah *</label><select class="form-select" name="nsm" required><option value="">--Pilih--</option>${_data.madrasah.map(m=>`<option value="${m._id||m.nsm}" ${(s?.nsm||qNsm)===(m._id||m.nsm)?'selected':''}>${H(m.nama)}</option>`).join('')}</select></div>
        <div class="col-md-4"><label class="form-label">NISN</label><input class="form-control" name="nisn" value="${H(s?.nisn||'')}"></div>
        <div class="col-md-4"><label class="form-label">Kelas *</label><select class="form-select" name="kelas" required><option value="">--</option>${['X','XI','XII'].map(k=>`<option ${s?.kelas===k?'selected':''}>${k}</option>`).join('')}</select></div>
        <div class="col-md-4"><label class="form-label">JK *</label><select class="form-select" name="jk" required><option value="L" ${(s?.jk||'L')==='L'?'selected':''}>L</option><option value="P" ${s?.jk==='P'?'selected':''}>P</option></select></div>
        <div class="col-md-6"><label class="form-label">Tempat Lahir</label><input class="form-control" name="tempat_lahir" value="${H(s?.tempat_lahir||'')}"></div>
        <div class="col-md-6"><label class="form-label">Tgl Lahir</label><input type="date" class="form-control" name="tgl_lahir" value="${H(s?.tgl_lahir||'')}"></div>
        <div class="col-md-6"><label class="form-label">Nama Ortu/Wali</label><input class="form-control" name="ortu" value="${H(s?.ortu||'')}"></div>
        <div class="col-md-6"><label class="form-label">Alamat</label><input class="form-control" name="alamat" value="${H(s?.alamat||'')}"></div>
    </div><button type="submit" class="btn btn-primary mt-3">Simpan</button></form></div>`;
    $('fSiswa').addEventListener('submit',e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));if(s){DB.update('siswa/'+s._id,fd);}else{DB.push('siswa',fd);}location.hash='#/siswa';});
}

// ============ REKAP DATA SISWA ============
function renderRekapSiswa(){
    const rs = _data.rekap_siswa || {};
    const kelasList = ['10','11','12'];
    const tahunAjaran = rs._tahun_ajaran || new Date().getFullYear()+'/'+(new Date().getFullYear()+1);

    // Grand totals
    let grandL=0, grandP=0, grandTotal=0;
    const perMadrasah = _data.madrasah.map(m=>{
        const nsm = m._id||m.nsm;
        const d = rs[nsm] || {};
        let mL=0, mP=0;
        kelasList.forEach(k=>{
            mL += parseInt(d['k'+k+'_l']||0)||0;
            mP += parseInt(d['k'+k+'_p']||0)||0;
        });
        grandL+=mL; grandP+=mP; grandTotal+=mL+mP;
        return {nsm, nama:m.nama, data:d, totalL:mL, totalP:mP, total:mL+mP};
    });

    app.innerHTML=`
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h4 class="mb-0"><i class="bi bi-clipboard2-data text-primary me-2"></i>Rekap Data Siswa</h4>
        <div class="d-flex gap-2 align-items-center">
            <small class="text-muted">Tahun Ajaran:</small>
            <input type="text" class="form-control form-control-sm" style="width:120px" id="rekapTA" value="${H(tahunAjaran)}">
            ${canEdit()?`<button class="btn btn-success btn-sm" id="btnSimpanRekap"><i class="bi bi-save me-1"></i>Simpan Semua</button>`:''}
            <button class="btn btn-outline-secondary btn-sm" id="btnCetakRekap"><i class="bi bi-printer me-1"></i>Cetak</button>
        </div>
    </div>
    <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body text-center"><div class="fw-bold fs-4 text-primary">${_data.madrasah.length}</div><small class="text-muted">Madrasah</small></div></div></div>
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body text-center"><div class="fw-bold fs-4 text-info">${grandL}</div><small class="text-muted">Siswa Laki-laki</small></div></div></div>
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body text-center"><div class="fw-bold fs-4 text-warning">${grandP}</div><small class="text-muted">Siswa Perempuan</small></div></div></div>
        <div class="col-6 col-md-3"><div class="card stat-card h-100"><div class="card-body text-center"><div class="fw-bold fs-4 text-success">${grandTotal}</div><small class="text-muted">Total Siswa</small></div></div></div>
    </div>
    <div class="form-section">
        <div class="table-responsive">
            <table class="table table-sm table-data table-bordered align-middle mb-0" id="tblRekap">
                <thead class="table-dark">
                    <tr>
                        <th rowspan="2" class="text-center align-middle" style="min-width:30px">No</th>
                        <th rowspan="2" class="text-center align-middle" style="min-width:180px">Madrasah</th>
                        <th colspan="3" class="text-center">Kelas X</th>
                        <th colspan="3" class="text-center">Kelas XI</th>
                        <th colspan="3" class="text-center">Kelas XII</th>
                        <th colspan="3" class="text-center">Jumlah</th>
                    </tr>
                    <tr>
                        <th class="text-center" style="width:60px">L</th>
                        <th class="text-center" style="width:60px">P</th>
                        <th class="text-center" style="width:65px">Total</th>
                        <th class="text-center" style="width:60px">L</th>
                        <th class="text-center" style="width:60px">P</th>
                        <th class="text-center" style="width:65px">Total</th>
                        <th class="text-center" style="width:60px">L</th>
                        <th class="text-center" style="width:60px">P</th>
                        <th class="text-center" style="width:65px">Total</th>
                        <th class="text-center" style="width:60px">L</th>
                        <th class="text-center" style="width:60px">P</th>
                        <th class="text-center" style="width:70px">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${perMadrasah.map((m,i)=>{
                        const d=m.data;
                        return `<tr data-nsm="${H(m.nsm)}">
                            <td class="text-center">${i+1}</td>
                            <td class="small">${H(m.nama)}</td>
                            ${kelasList.map(k=>{
                                const vl=d['k'+k+'_l']||'', vp=d['k'+k+'_p']||'';
                                const tl=(parseInt(vl)||0)+(parseInt(vp)||0);
                                return `<td><input type="number" class="form-control form-control-sm text-center rekap-input" data-nsm="${H(m.nsm)}" data-field="k${k}_l" value="${vl}" min="0" style="width:50px" ${canEdit()?'':'disabled'}></td>
                                <td><input type="number" class="form-control form-control-sm text-center rekap-input" data-nsm="${H(m.nsm)}" data-field="k${k}_p" value="${vp}" min="0" style="width:50px" ${canEdit()?'':'disabled'}></td>
                                <td class="text-center fw-bold rekap-subtotal" data-nsm="${H(m.nsm)}" data-kelas="${k}">${tl||'-'}</td>`;
                            }).join('')}
                            <td class="text-center fw-bold bg-light">${m.totalL||'-'}</td>
                            <td class="text-center fw-bold bg-light">${m.totalP||'-'}</td>
                            <td class="text-center fw-bold bg-success bg-opacity-10">${m.total||'-'}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
                <tfoot class="table-secondary">
                    <tr class="fw-bold">
                        <td colspan="2" class="text-center">JUMLAH TOTAL</td>
                        ${kelasList.map(k=>{
                            let kL=0,kP=0;
                            perMadrasah.forEach(m=>{
                                kL+=parseInt(m.data['k'+k+'_l']||0)||0;
                                kP+=parseInt(m.data['k'+k+'_p']||0)||0;
                            });
                            return `<td class="text-center">${kL}</td><td class="text-center">${kP}</td><td class="text-center">${kL+kP}</td>`;
                        }).join('')}
                        <td class="text-center bg-light">${grandL}</td>
                        <td class="text-center bg-light">${grandP}</td>
                        <td class="text-center bg-success bg-opacity-10">${grandTotal}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
    <div id="rekapStatus" class="mt-2 small" style="display:none"></div>`;

    // Live update subtotals on input change
    document.querySelectorAll('.rekap-input').forEach(inp=>{
        inp.addEventListener('input',function(){
            const nsm=this.dataset.nsm;
            // Update per-kelas subtotal
            const kelas=this.dataset.field.slice(1,3);
            const row=document.querySelector(`tr[data-nsm="${nsm}"]`);
            if(!row) return;
            const vl=row.querySelector(`input[data-field="k${kelas}_l"]`);
            const vp=row.querySelector(`input[data-field="k${kelas}_p"]`);
            const sub=row.querySelector(`.rekap-subtotal[data-kelas="${kelas}"]`);
            if(vl&&vp&&sub) sub.textContent=(parseInt(vl.value)||0)+(parseInt(vp.value)||0)||'-';
            // Update row totals
            let rL=0,rP=0;
            ['10','11','12'].forEach(k=>{
                const il=row.querySelector(`input[data-field="k${k}_l"]`);
                const ip=row.querySelector(`input[data-field="k${k}_p"]`);
                rL+=parseInt(il?.value||0)||0;
                rP+=parseInt(ip?.value||0)||0;
            });
            const cells=row.querySelectorAll('td.fw-bold.bg-light, td.fw-bold.bg-success');
            if(cells[0]) cells[0].textContent=rL||'-';
            if(cells[1]) cells[1].textContent=rP||'-';
            if(cells[2]) cells[2].textContent=(rL+rP)||'-';
            // Update footer totals
            let gL=0,gP=0;
            document.querySelectorAll('tbody tr[data-nsm]').forEach(tr=>{
                ['10','11','12'].forEach(k=>{
                    const il=tr.querySelector(`input[data-field="k${k}_l"]`);
                    const ip=tr.querySelector(`input[data-field="k${k}_p"]`);
                    gL+=parseInt(il?.value||0)||0;
                    gP+=parseInt(ip?.value||0)||0;
                });
            });
            const ft=document.querySelectorAll('tfoot td');
            // recalc per-kelas footer
            let idx=2;
            ['10','11','12'].forEach(k=>{
                let ckL=0,ckP=0;
                document.querySelectorAll('tbody tr[data-nsm]').forEach(tr=>{
                    ckL+=parseInt(tr.querySelector(`input[data-field="k${k}_l"]`)?.value||0)||0;
                    ckP+=parseInt(tr.querySelector(`input[data-field="k${k}_p"]`)?.value||0)||0;
                });
                if(ft[idx]) ft[idx].textContent=ckL;
                if(ft[idx+1]) ft[idx+1].textContent=ckP;
                if(ft[idx+2]) ft[idx+2].textContent=ckL+ckP;
                idx+=3;
            });
            if(ft[idx]) ft[idx].textContent=gL;
            if(ft[idx+1]) ft[idx+1].textContent=gP;
            if(ft[idx+2]) ft[idx+2].textContent=gL+gP;
            // Update stat cards
            const cards=document.querySelectorAll('.stat-card .fs-4');
            if(cards[1]) cards[1].textContent=gL;
            if(cards[2]) cards[2].textContent=gP;
            if(cards[3]) cards[3].textContent=gL+gP;
        });
    });

    // Save all
    $('btnSimpanRekap')?.addEventListener('click',function(){
        this.disabled=true;
        this.innerHTML='<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';
        const update={};
        let promises=[];
        _data.madrasah.forEach(m=>{
            const nsm=m._id||m.nsm;
            const entry={};
            ['10','11','12'].forEach(k=>{
                const il=document.querySelector(`input[data-nsm="${nsm}"][data-field="k${k}_l"]`);
                const ip=document.querySelector(`input[data-nsm="${nsm}"][data-field="k${k}_p"]`);
                entry['k'+k+'_l']=parseInt(il?.value||0)||0;
                entry['k'+k+'_p']=parseInt(ip?.value||0)||0;
            });
            entry._updated=new Date().toISOString();
            update[nsm]=entry;
            promises.push(DB.set('rekap_siswa/'+nsm, entry));
        });
        // Save tahun ajaran
        const ta=$('rekapTA')?.value||'';
        if(ta) promises.push(DB.set('rekap_siswa/_tahun_ajaran', ta));
        Promise.all(promises).then(()=>{
            const st=$('rekapStatus');
            st.innerHTML='<div class="alert alert-success py-2 mb-0"><i class="bi bi-check-circle me-1"></i>Data rekap siswa berhasil disimpan!</div>';
            st.style.display='block';
            this.disabled=false;
            this.innerHTML='<i class="bi bi-save me-1"></i>Simpan Semua';
            setTimeout(()=>{st.style.display='none';},3000);
        }).catch(e=>{
            const st=$('rekapStatus');
            st.innerHTML='<div class="alert alert-danger py-2 mb-0"><i class="bi bi-exclamation-triangle me-1"></i>Gagal menyimpan: '+H(e.message)+'</div>';
            st.style.display='block';
            this.disabled=false;
            this.innerHTML='<i class="bi bi-save me-1"></i>Simpan Semua';
        });
    });

    // Print
    $('btnCetakRekap')?.addEventListener('click',()=>{window.print();});
}

// ============ SUPERVISI ============
function renderSupervisi(){
    const sv=_data.supervisi.sort((a,b)=>(b.tanggal||'').localeCompare(a.tanggal||''));
    const lp=_data.laporan||[];
    app.innerHTML=`<h4 class="mb-4"><i class="bi bi-clipboard-check text-primary me-2"></i>Supervisi & Pembinaan</h4>
    <ul class="nav nav-pills mb-3"><li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tabJadwal">Jadwal</button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tabLaporan">Laporan</button></li></ul>
    <div class="tab-content"><div class="tab-pane fade show active" id="tabJadwal">
        ${canEdit()?`<button class="btn btn-primary btn-sm mb-3" id="btnAddSv"><i class="bi bi-plus-lg me-1"></i>Tambah Jadwal</button>`:''}
        <div class="form-section"><div class="table-responsive"><table class="table table-sm table-data"><thead><tr><th>Tanggal</th><th>Madrasah</th><th>Jenis</th><th>Status</th>${canEdit()?'<th>Aksi</th>':''}</tr></thead><tbody>${sv.map(s=>{const m=getMadrasah(s.nsm);return`<tr><td>${fmt(s.tanggal)}</td><td>${m?H(m.nama):H(s.nsm)}</td><td><span class="badge ${s.jenis==='akademik'?'bg-info':'bg-warning'}">${H(s.jenis)}</span></td><td><span class="badge ${s.status==='selesai'?'bg-success':'bg-secondary'}">${H(s.status)}</span></td>${canEdit()?`<td><button class="btn btn-sm btn-outline-danger py-0 px-1 dSv" data-id="${s._id}"><i class="bi bi-trash"></i></button></td>`:''}</tr>`;}).join('')}</tbody></table></div>${!sv.length?'<p class="text-muted text-center small">Belum ada jadwal</p>':''}</div>
    </div><div class="tab-pane fade" id="tabLaporan">
        ${canEdit()?`<button class="btn btn-primary btn-sm mb-3" id="btnAddLp"><i class="bi bi-plus-lg me-1"></i>Tambah Laporan</button>`:''}
        <div class="form-section">${lp.length?lp.map(l=>{const m=getMadrasah(l.nsm);return`<div class="border-start border-3 border-primary ps-3 mb-3"><strong>${m?H(m.nama):'?'}</strong> <small class="text-muted">${fmt(l.tanggal)}</small><p class="small mb-1"><strong>Temuan:</strong> ${H(l.temuan)}</p><p class="small mb-1"><strong>Rekomendasi:</strong> ${H(l.rekomendasi)}</p><p class="small mb-0"><strong>Tindak Lanjut:</strong> ${H(l.tindak_lanjut)} <span class="badge ${l.status_tl==='selesai'?'bg-success':'bg-warning'}">${H(l.status_tl||'proses')}</span></p>${canEdit()?`<button class="btn btn-sm btn-outline-danger mt-1 dLp" data-id="${l._id}"><i class="bi bi-trash me-1"></i>Hapus</button>`:''}</div>`;}).join(''):'<p class="text-muted text-center small">Belum ada laporan</p>'}</div>
    </div></div>`;
    // Add jadwal
    $('btnAddSv')?.addEventListener('click',()=>{const nsm=prompt('NSM Madrasah:');const tgl=prompt('Tanggal (YYYY-MM-DD):');const jenis=prompt('Jenis (akademik/manajerial):','akademik');if(nsm&&tgl)DB.push('supervisi',{nsm,tanggal:tgl,jenis:jenis||'akademik',status:'rencana'});});
    // Add laporan
    $('btnAddLp')?.addEventListener('click',()=>{const nsm=prompt('NSM Madrasah:');const tgl=prompt('Tanggal (YYYY-MM-DD):');const temuan=prompt('Temuan:');const rek=prompt('Rekomendasi:');const tl=prompt('Tindak Lanjut:');if(nsm&&temuan)DB.push('laporan',{nsm,tanggal:tgl,temuan,rekomendasi:rek,tindak_lanjut:tl,status_tl:'proses'});});
    document.querySelectorAll('.dSv').forEach(b=>b.addEventListener('click',function(){if(confirm('Hapus?'))DB.remove('supervisi/'+this.dataset.id);}));
    document.querySelectorAll('.dLp').forEach(b=>b.addEventListener('click',function(){if(confirm('Hapus?'))DB.remove('laporan/'+this.dataset.id);}));
}

// ============ INFORMASI ============
function renderInformasi(){
    const berita=(_data.berita||[]).sort((a,b)=>(b.tanggal||'').localeCompare(a.tanggal||''));
    app.innerHTML=`<h4 class="mb-4"><i class="bi bi-newspaper text-primary me-2"></i>Informasi & Dokumentasi</h4>
    ${canEdit()?`<button class="btn btn-primary btn-sm mb-3" id="btnAddBerita"><i class="bi bi-plus-lg me-1"></i>Tambah Berita</button>`:''}
    <div class="row g-3">${berita.map(b=>`<div class="col-md-6"><div class="form-section berita-card"><h6>${H(b.judul)}</h6><small class="text-muted"><i class="bi bi-calendar me-1"></i>${fmt(b.tanggal)} Â· <span class="badge bg-primary">${H(b.kategori||'Lainnya')}</span></small><p class="small mt-2 mb-0">${H(b.isi)}</p>${canEdit()?`<button class="btn btn-sm btn-outline-danger mt-2 dBerita" data-id="${b._id}"><i class="bi bi-trash"></i></button>`:''}</div></div>`).join('')}</div>
    ${!berita.length?'<div class="form-section"><p class="text-center text-muted">Belum ada berita</p></div>':''}`;
    $('btnAddBerita')?.addEventListener('click',()=>{const judul=prompt('Judul:');const isi=prompt('Isi berita:');const kategori=prompt('Kategori (KKG/MGMP/Workshop/Rapat/Lainnya):','Lainnya');const tgl=new Date().toISOString().slice(0,10);if(judul&&isi)DB.push('berita',{judul,isi,kategori,tanggal:tgl});});
    document.querySelectorAll('.dBerita').forEach(b=>b.addEventListener('click',function(){if(confirm('Hapus?'))DB.remove('berita/'+this.dataset.id);}));
}

// ============ DOWNLOAD ============
function renderDownload(){
    const docs=_data.dokumen||[];
    const cats=['Instrumen','Template','Regulasi','Materi'];
    app.innerHTML=`<h4 class="mb-4"><i class="bi bi-download text-primary me-2"></i>Download & Dokumen</h4>
    ${canEdit()?`<button class="btn btn-primary btn-sm mb-3" id="btnAddDoc"><i class="bi bi-plus-lg me-1"></i>Tambah Dokumen</button>`:''}
    <div class="d-flex gap-2 mb-3 flex-wrap"><button class="btn btn-sm btn-outline-primary active fDoc" data-cat="">Semua</button>${cats.map(c=>`<button class="btn btn-sm btn-outline-primary fDoc" data-cat="${c}">${c}</button>`).join('')}</div>
    <div class="row g-3" id="docGrid">${docs.map(d=>`<div class="col-md-6 doc-item" data-cat="${H(d.kategori||'')}"><div class="form-section d-flex gap-3 align-items-start"><div class="stat-icon bg-primary bg-opacity-10 text-primary flex-shrink-0"><i class="bi bi-file-earmark-text"></i></div><div class="flex-grow-1"><h6 class="mb-1">${H(d.judul)}</h6><span class="badge bg-secondary mb-1">${H(d.kategori)}</span><p class="small text-muted mb-1">${H(d.deskripsi)}</p>${d.link_url?`<a href="${H(d.link_url)}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-download me-1"></i>Download</a>`:''}</div>${canEdit()?`<div class="d-flex flex-column gap-1"><button class="btn btn-sm btn-outline-primary eDoc" data-id="${d._id}" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger dDoc" data-id="${d._id}" title="Hapus"><i class="bi bi-trash"></i></button></div>`:''}</div></div>`).join('')}</div>
    ${!docs.length?'<div class="form-section"><p class="text-center text-muted">Belum ada dokumen</p></div>':''}`;
    document.querySelectorAll('.fDoc').forEach(b=>b.addEventListener('click',function(){document.querySelectorAll('.fDoc').forEach(x=>x.classList.remove('active'));this.classList.add('active');const cat=this.dataset.cat;document.querySelectorAll('.doc-item').forEach(el=>{el.style.display=(!cat||el.dataset.cat===cat)?'':'none';});}));
    $('btnAddDoc')?.addEventListener('click',()=>{const judul=prompt('Judul:');const kategori=prompt('Kategori (Instrumen/Template/Regulasi/Materi):','Instrumen');const deskripsi=prompt('Deskripsi:');const link_url=prompt('Link URL (kosongkan jika belum ada):','');if(judul)DB.push('dokumen',{judul,kategori,deskripsi,link_url});});
    document.querySelectorAll('.eDoc').forEach(b=>b.addEventListener('click',function(){const id=this.dataset.id;const d=(_data.dokumen||[]).find(x=>x._id===id);if(!d)return;const judul=prompt('Judul:',d.judul);if(!judul)return;const kategori=prompt('Kategori (Instrumen/Template/Regulasi/Materi):',d.kategori||'Instrumen');const deskripsi=prompt('Deskripsi:',d.deskripsi||'');const link_url=prompt('Link URL:',d.link_url||'');DB.update('dokumen/'+id,{judul,kategori,deskripsi,link_url});}));
    document.querySelectorAll('.dDoc').forEach(b=>b.addEventListener('click',function(){if(confirm('Hapus?'))DB.remove('dokumen/'+this.dataset.id);}));
}

// ============ DIREKTORI ============
function renderDirektori(){
    const foto = _profil.foto || '';
    app.innerHTML=`<h4 class="mb-4"><i class="bi bi-person-lines-fill text-primary me-2"></i>Direktori SDM</h4>
    <div class="row g-4"><div class="col-md-5">
        <div class="form-section"><h5 class="mb-3"><i class="bi bi-person-badge text-primary me-2"></i>Pengawas Pembina</h5>
        <div class="text-center mb-3">${foto?`<img src="${foto}" class="rounded-circle" style="width:100px;height:100px;object-fit:cover" alt="Foto Pengawas">`:`<div class="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center" style="width:100px;height:100px"><i class="bi bi-person-fill text-success fs-1"></i></div>`}</div>
        <table class="table table-sm table-borderless small"><tr><td class="text-muted">Nama</td><td><strong>${H(_profil.pengawas)}</strong></td></tr><tr><td class="text-muted">NIP</td><td>${H(_profil.nip_pengawas)}</td></tr><tr><td class="text-muted">Jabatan</td><td>${H(_profil.jabatan)}</td></tr><tr><td class="text-muted">Wilayah</td><td>${H(_profil.wilayah)}</td></tr><tr><td class="text-muted">HP</td><td>${H(_profil.hp||'(belum diisi)')}</td></tr><tr><td class="text-muted">Email</td><td>${H(_profil.email||'(belum diisi)')}</td></tr></table>
        ${canEdit()?`<button class="btn btn-sm btn-outline-primary" id="btnEditPengawas"><i class="bi bi-pencil me-1"></i>Edit Profil</button> <button class="btn btn-sm btn-outline-success" id="btnFotoPengawas"><i class="bi bi-camera me-1"></i>Upload Foto</button><input type="file" id="inputFoto" accept="image/*" style="display:none">`:''}</div>
        <div class="form-section"><h6><i class="bi bi-diagram-3 text-primary me-2"></i>Struktur Organisasi</h6>
        <div class="small"><p class="mb-1"><strong>Ketua Pokjawas:</strong> ${H(_profil.pengawas)}</p><p class="mb-1"><strong>Wilayah Binaan:</strong> KKMA 04 - ${H(_profil.wilayah)}</p><p class="mb-0"><strong>Jumlah Madrasah:</strong> ${_data.madrasah.length} lembaga</p></div></div>
    </div><div class="col-md-7">
        <div class="form-section"><h5 class="mb-3"><i class="bi bi-people text-primary me-2"></i>Kepala Madrasah</h5>
        <div class="table-responsive"><table class="table table-sm table-data"><thead><tr><th>No</th><th>Nama</th><th>Madrasah</th></tr></thead><tbody>${_data.madrasah.map((m,i)=>`<tr><td>${i+1}</td><td>${H(m.kepala)}</td><td class="small">${H(m.nama)}</td></tr>`).join('')}</tbody></table></div></div>
    </div></div>`;
    // Edit profil pengawas
    $('btnEditPengawas')?.addEventListener('click',()=>{
        const nama=prompt('Nama Pengawas:',_profil.pengawas);if(!nama)return;
        const nip=prompt('NIP:',_profil.nip_pengawas||'');
        const jabatan=prompt('Jabatan:',_profil.jabatan||'');
        const hp=prompt('No. HP:',_profil.hp||'');
        const email=prompt('Email:',_profil.email||'');
        const wilayah=prompt('Wilayah:',_profil.wilayah||'');
        DB.update('profil',{pengawas:nama,nip_pengawas:nip,jabatan,hp,email,wilayah});
    });
    // Upload foto
    $('btnFotoPengawas')?.addEventListener('click',()=>{$('inputFoto').click();});
    $('inputFoto')?.addEventListener('change',function(){
        const file=this.files[0];if(!file)return;
        if(file.size>500000){alert('Ukuran foto max 500KB');return;}
        const reader=new FileReader();
        reader.onload=function(e){
            const img=new Image();
            img.onload=function(){
                const canvas=document.createElement('canvas');
                const max=200;
                let w=img.width,h=img.height;
                if(w>h){h=h*(max/w);w=max;}else{w=w*(max/h);h=max;}
                canvas.width=w;canvas.height=h;
                canvas.getContext('2d').drawImage(img,0,0,w,h);
                const dataUrl=canvas.toDataURL('image/jpeg',0.8);
                DB.update('profil',{foto:dataUrl});
            };
            img.src=e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ============ DASHBOARD ============
function renderDashboard(){
    const akr={A:0,B:0,C:0,Belum:0,'-':0};_data.madrasah.forEach(m=>{const a=m.akreditasi||'-';akr[a]=(akr[a]||0)+1;});
    app.innerHTML=`<h4 class="mb-4"><i class="bi bi-speedometer2 text-primary me-2"></i>Dashboard</h4>
    <div class="row g-3 mb-4">
        <div class="col-md-4"><div class="form-section"><h6>Status Akreditasi</h6><ul class="list-unstyled small mb-0">${Object.entries(akr).filter(([k,v])=>v>0).map(([k,v])=>`<li class="d-flex justify-content-between mb-1"><span>Akreditasi ${k}</span><strong>${v}</strong></li>`).join('')}</ul></div></div>
        <div class="col-md-4"><div class="form-section"><h6>Rekap PKKM</h6>${_data.pkkm.length?`<div class="table-responsive"><table class="table table-sm small"><thead><tr><th>Madrasah</th><th>Nilai</th><th>Sebutan</th></tr></thead><tbody>${_data.pkkm.map(p=>{const m=getMadrasah(p.nsm);return`<tr><td>${m?H(m.nama):'-'}</td><td>${p.nilai}</td><td><span class="badge bg-primary">${H(p.sebutan)}</span></td></tr>`;}).join('')}</tbody></table></div>`:'<p class="text-muted small">Belum ada data PKKM</p>'}${canEdit()?`<button class="btn btn-sm btn-outline-primary" id="btnPkkm"><i class="bi bi-plus-lg me-1"></i>Tambah</button>`:''}</div></div>
        <div class="col-md-4"><div class="form-section"><h6>Rekap PKG</h6>${_data.pkg.length?`<div class="table-responsive"><table class="table table-sm small"><thead><tr><th>Guru</th><th>Nilai</th><th>Sebutan</th></tr></thead><tbody>${_data.pkg.map(p=>`<tr><td>${H(p.nama_guru)}</td><td>${p.nilai}</td><td><span class="badge bg-info">${H(p.sebutan)}</span></td></tr>`).join('')}</tbody></table></div>`:'<p class="text-muted small">Belum ada data PKG</p>'}${canEdit()?`<button class="btn btn-sm btn-outline-primary" id="btnPkg"><i class="bi bi-plus-lg me-1"></i>Tambah</button>`:''}</div></div>
    </div>`;
    $('btnPkkm')?.addEventListener('click',()=>{const nsm=prompt('NSM Madrasah:');const nilai=prompt('Nilai (0-100):');const sebutan=prompt('Sebutan (Amat Baik/Baik/Cukup/Sedang/Kurang):','Baik');if(nsm&&nilai)DB.push('pkkm',{nsm,nilai:+nilai,sebutan});});
    $('btnPkg')?.addEventListener('click',()=>{const nama_guru=prompt('Nama Guru:');const nilai=prompt('Nilai (0-100):');const sebutan=prompt('Sebutan (Amat Baik/Baik/Cukup/Sedang/Kurang):','Baik');if(nama_guru&&nilai)DB.push('pkg',{nama_guru,nilai:+nilai,sebutan});});
}

// ============ KONTAK ============
function renderKontak(){
    app.innerHTML=`<h4 class="mb-4"><i class="bi bi-telephone text-primary me-2"></i>Kontak & Komunikasi</h4>
    <div class="row g-4"><div class="col-md-5">
        <div class="form-section"><h5 class="mb-3">Info Kontak</h5><table class="table table-sm table-borderless small">
        <tr><td class="text-muted">Nama</td><td>${H(_profil.pengawas)}</td></tr>
        <tr><td class="text-muted">HP</td><td>${H(_profil.hp||'(belum diisi)')}</td></tr>
        <tr><td class="text-muted">Email</td><td>${H(_profil.email||'(belum diisi)')}</td></tr>
        <tr><td class="text-muted">Kantor</td><td>${H(_profil.alamat_kantor||'(belum diisi)')}</td></tr>
        <tr><td class="text-muted">Link WA</td><td>${_profil.link_wa?`<a href="${H(_profil.link_wa)}" target="_blank">${H(_profil.link_wa)}</a>`:'(belum diisi)'}</td></tr>
        </table>
        ${_profil.link_wa?`<a href="${H(_profil.link_wa)}" target="_blank" class="btn btn-success btn-sm mb-2"><i class="bi bi-whatsapp me-1"></i>Grup WhatsApp</a><br>`:''}
        ${Session.isAdmin()?`<button class="btn btn-sm btn-outline-primary" id="btnEditKontak"><i class="bi bi-pencil me-1"></i>Edit Info Kontak</button>`:''}</div>
    </div><div class="col-md-7">
        <div class="form-section"><h5 class="mb-3"><i class="bi bi-envelope text-primary me-2"></i>Form Aspirasi / Konsultasi</h5>
        <form id="fAspirasi"><div class="mb-3"><label class="form-label">Nama</label><input class="form-control" name="nama" required></div>
        <div class="mb-3"><label class="form-label">Asal Madrasah</label><select class="form-select" name="madrasah"><option value="">--Opsional--</option>${_data.madrasah.map(m=>`<option>${H(m.nama)}</option>`).join('')}</select></div>
        <div class="mb-3"><label class="form-label">Pesan / Aspirasi</label><textarea class="form-control" name="pesan" rows="4" required></textarea></div>
        <button type="submit" class="btn btn-primary"><i class="bi bi-send me-1"></i>Kirim</button></form>
        <div id="aspirasiOk" class="text-success mt-2 small" style="display:none">Pesan terkirim! Terima kasih.</div></div>
        ${Session.isAdmin()?`<div class="form-section mt-3"><h6>Aspirasi Masuk (${(_data.aspirasi||[]).length})</h6>${(_data.aspirasi||[]).map(a=>`<div class="border-start border-2 border-primary ps-2 mb-2 small"><strong>${H(a.nama)}</strong> <span class="text-muted">${H(a.madrasah||'')}</span><p class="mb-0">${H(a.pesan)}</p><small class="text-muted">${fmt(a.tanggal)}</small></div>`).join('')||'<p class="text-muted small">Kosong</p>'}</div>`:''}
    </div></div>`;
    $('fAspirasi').addEventListener('submit',e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));fd.tanggal=new Date().toISOString().slice(0,10);DB.push('aspirasi',fd);e.target.reset();$('aspirasiOk').style.display='block';setTimeout(()=>{$('aspirasiOk').style.display='none';},3000);});
    // Edit kontak
    $('btnEditKontak')?.addEventListener('click',()=>{
        const hp=prompt('No. HP:',_profil.hp||'');
        const email=prompt('Email:',_profil.email||'');
        const alamat_kantor=prompt('Alamat Kantor:',_profil.alamat_kantor||'');
        const link_wa=prompt('Link Grup WhatsApp:',_profil.link_wa||'');
        DB.update('profil',{hp,email,alamat_kantor,link_wa});
    });
}

// ============ TENTANG ============
function renderTentang(){
    const foto = _profil.foto || '';
    app.innerHTML=`<div class="hero-section text-center"><h2>Tentang KKMA 04 Jember</h2><p class="mb-0 opacity-75">Kelompok Kerja Madrasah Aliyah | Kecamatan Sukowono</p></div>
    <div class="row g-4"><div class="col-md-6"><div class="form-section h-100"><h5>Profil</h5><table class="table table-sm table-borderless small">
        <tr><td class="text-muted">Nama</td><td><strong>${H(_profil.nama)}</strong></td></tr>
        <tr><td class="text-muted">Wilayah</td><td>${H(_profil.wilayah)}</td></tr>
        <tr><td class="text-muted">Kabupaten</td><td>${H(_profil.kabupaten)}</td></tr>
        <tr><td class="text-muted">Provinsi</td><td>${H(_profil.provinsi)}</td></tr>
        <tr><td class="text-muted">Jenjang</td><td>Madrasah Aliyah</td></tr>
        <tr><td class="text-muted">Jumlah</td><td>${_data.madrasah.length} madrasah</td></tr>
    </table>${canEdit()?`<button class="btn btn-sm btn-outline-primary" id="btnEditProfil"><i class="bi bi-pencil me-1"></i>Edit Profil</button>`:''}</div></div>
    <div class="col-md-6"><div class="form-section h-100"><h5>Visi & Misi</h5><p class="fw-bold small">${H(_profil.visi)}</p><h6 class="small">Misi:</h6><ol class="small">${(_profil.misi||[]).map(m=>`<li>${H(m)}</li>`).join('')}</ol>${canEdit()?`<button class="btn btn-sm btn-outline-primary" id="btnEditVisiMisi"><i class="bi bi-pencil me-1"></i>Edit Visi & Misi</button>`:''}</div></div>
    <div class="col-12"><div class="form-section text-center"><h5>Pengawas Pembina</h5>${foto?`<img src="${foto}" class="rounded-circle mb-2" style="width:90px;height:90px;object-fit:cover">`:`<div class="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style="width:90px;height:90px"><i class="bi bi-person-fill text-success fs-1"></i></div>`}<p class="fw-bold fs-5 mb-0">${H(_profil.pengawas)}</p><p class="text-muted">NIP. ${H(_profil.nip_pengawas)}<br>${H(_profil.jabatan)}</p>
    ${canEdit()?`<button class="btn btn-sm btn-outline-primary" id="btnEditSambutan"><i class="bi bi-pencil me-1"></i>Edit Sambutan</button> <button class="btn btn-sm btn-outline-success" id="btnFotoTentang"><i class="bi bi-camera me-1"></i>Upload Foto</button><input type="file" id="inputFotoTentang" accept="image/*" style="display:none">`:''}</div></div></div>`;
    // Edit Profil
    $('btnEditProfil')?.addEventListener('click',()=>{
        const nama=prompt('Nama KKMA:',_profil.nama||'');if(!nama)return;
        const wilayah=prompt('Wilayah:',_profil.wilayah||'');
        const kabupaten=prompt('Kabupaten:',_profil.kabupaten||'');
        const provinsi=prompt('Provinsi:',_profil.provinsi||'');
        DB.update('profil',{nama,wilayah,kabupaten,provinsi});
    });
    // Edit Visi & Misi
    $('btnEditVisiMisi')?.addEventListener('click',()=>{
        const visi=prompt('Visi:',_profil.visi||'');if(!visi)return;
        const misiStr=prompt('Misi (pisahkan dengan |):',(_profil.misi||[]).join(' | '));
        const misi=misiStr?misiStr.split('|').map(m=>m.trim()).filter(m=>m):_profil.misi;
        DB.update('profil',{visi,misi});
    });
    // Edit Sambutan
    $('btnEditSambutan')?.addEventListener('click',()=>{
        const sambutan=prompt('Sambutan Pengawas:',(_profil.sambutan||'').replace(/\n/g,'\\n'));
        if(sambutan!==null) DB.update('profil',{sambutan:sambutan.replace(/\\n/g,'\n')});
    });
    // Upload Foto Pengawas
    $('btnFotoTentang')?.addEventListener('click',()=>{$('inputFotoTentang').click();});
    $('inputFotoTentang')?.addEventListener('change',function(){
        const file=this.files[0];if(!file)return;
        if(file.size>500000){alert('Ukuran foto max 500KB');return;}
        const reader=new FileReader();
        reader.onload=function(e){
            const img=new Image();
            img.onload=function(){
                const canvas=document.createElement('canvas');
                const max=200;
                let w=img.width,h=img.height;
                if(w>h){h=h*(max/w);w=max;}else{w=w*(max/h);h=max;}
                canvas.width=w;canvas.height=h;
                canvas.getContext('2d').drawImage(img,0,0,w,h);
                const dataUrl=canvas.toDataURL('image/jpeg',0.8);
                DB.update('profil',{foto:dataUrl});
            };
            img.src=e.target.result;
        };
        reader.readAsDataURL(file);
    });
}



// ============ UPLOAD DOKUMEN (Google Drive via Apps Script) ============
const UPLOAD_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFZohRheBJ4ss-HP3BHwtCAJqqes5ZSC7Zt5oVZjQYoqJfO-cLNUaENZFjbL9IbaF43Q/exec';

function renderUploadDokumen(){
    if(!canEdit()){location.hash='#/login';return;}
    const user=Session.getUser();
    const isAdmin=Session.isAdmin();

    let uploads=[];
    DB.get('uploads').then(v=>{
        uploads=DB.toArray(v)||[];
        if(!isAdmin){
            uploads=uploads.filter(u=>u.pengirim===user.nama);
        }
        uploads.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
        renderList();
    });

    const kategoriList=['Dokumen Kurikulum','Dokumen Akreditasi','Data Guru/Siswa','Laporan Bulanan','Proposal/Surat','Bukti Fisik Supervisi','Lainnya'];

    app.innerHTML=`<h4 class="mb-4"><i class="bi bi-cloud-arrow-up text-primary me-2"></i>Upload Dokumen</h4>
    <div class="row g-4">
        <div class="col-lg-5">
            <div class="form-section">
                <h5 class="mb-3"><i class="bi bi-upload text-primary me-2"></i>Kirim Dokumen</h5>
                <p class="small text-muted mb-3">Upload dokumen ke Google Drive Pengawas. Maks 10 MB per file.</p>
                <form id="fUpload">
                    <div class="mb-3">
                        <label class="form-label">Asal Madrasah <span class="text-danger">*</span></label>
                        <select class="form-select" name="madrasah" required>
                            <option value="">-- Pilih Madrasah --</option>
                            ${_data.madrasah.map(m=>`<option value="${H(m.nama)}">${H(m.nama)}</option>`).join('')}
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Kategori <span class="text-danger">*</span></label>
                        <select class="form-select" name="kategori" required>
                            <option value="">-- Pilih Kategori --</option>
                            ${kategoriList.map(k=>`<option value="${k}">${k}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Keterangan</label>
                        <input type="text" class="form-control" name="keterangan" placeholder="Jelaskan singkat isi dokumen...">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Pilih File <span class="text-danger">*</span></label>
                        <input type="file" class="form-control" id="inputUpFile" name="file" required
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar">
                        <small class="text-muted">PDF, Word, Excel, PPT, Gambar, ZIP (maks 10 MB)</small>
                    </div>
                    <button type="submit" class="btn btn-primary w-100" id="btnSubmitUpload">
                        <i class="bi bi-cloud-arrow-up me-1"></i>Upload ke Google Drive
                    </button>
                </form>
                <div id="uploadProgress" class="mt-3" style="display:none">
                    <div class="progress" style="height:6px"><div class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width:100%"></div></div>
                    <small class="text-muted">Mengirim ke Google Drive...</small>
                </div>
                <div id="uploadOk" class="alert alert-success mt-3 small" style="display:none">
                    <i class="bi bi-check-circle me-1"></i>Dokumen berhasil diupload ke Google Drive!
                </div>
                <div id="uploadErr" class="alert alert-danger mt-3 small" style="display:none"></div>
            </div>
        </div>
        <div class="col-lg-7">
            <div class="form-section">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0"><i class="bi bi-folder2-open text-primary me-2"></i>${isAdmin?'Semua Dokumen Masuk':'Dokumen Saya'}</h5>
                    <span class="badge bg-secondary" id="uploadCount">0</span>
                </div>
                ${isAdmin?`<div class="d-flex gap-2 mb-3 flex-wrap">
                    <select class="form-select form-select-sm" style="width:auto" id="fUpMdr"><option value="">Semua Madrasah</option>${_data.madrasah.map(m=>`<option value="${H(m.nama)}">${H(m.nama)}</option>`).join('')}</select>
                    <select class="form-select form-select-sm" style="width:auto" id="fUpKat"><option value="">Semua Kategori</option>${kategoriList.map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
                </div>`:''}
                <div id="uploadList"><div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div></div>
            </div>
        </div>
    </div>`;

    function renderList(){
        const fM=document.getElementById('fUpMdr');
        const fK=document.getElementById('fUpKat');
        let filtered=uploads;
        if(fM&&fM.value) filtered=filtered.filter(u=>u.madrasah===fM.value);
        if(fK&&fK.value) filtered=filtered.filter(u=>u.kategori===fK.value);

        const el=document.getElementById('uploadList');
        const cnt=document.getElementById('uploadCount');
        if(cnt) cnt.textContent=filtered.length;

        if(!filtered.length){
            el.innerHTML='<div class="text-center py-4 text-muted"><i class="bi bi-inbox" style="font-size:2rem"></i><p class="small mt-2">Belum ada dokumen diupload</p></div>';
            return;
        }
        el.innerHTML=filtered.map(u=>{
            const tgl=u.timestamp?new Date(u.timestamp).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-';
            const icon=getFileIcon(u.filename||'');
            const size=u.size?formatSize(u.size):'-';
            return `<div class="border rounded p-3 mb-2 d-flex align-items-start gap-3">
                <div class="stat-icon ${icon.bg} flex-shrink-0" style="width:42px;height:42px;font-size:1.1rem"><i class="bi ${icon.icon}"></i></div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong class="small">${H(u.filename||'file')}</strong>
                            <span class="badge bg-primary ms-1">${H(u.kategori||'-')}</span>
                        </div>
                        <small class="text-muted text-nowrap">${size}</small>
                    </div>
                    <p class="small text-muted mb-1">
                        <i class="bi bi-building me-1"></i>${H(u.madrasah||'-')}
                        ${isAdmin?` \u00b7 <i class="bi bi-person me-1"></i>${H(u.pengirim||'-')}`:''}
                    </p>
                    ${u.keterangan?`<p class="small mb-1 fst-italic">${H(u.keterangan)}</p>`:''}
                    <div class="d-flex gap-2 align-items-center">
                        <small class="text-muted"><i class="bi bi-clock me-1"></i>${tgl}</small>
                        ${u.driveUrl?`<a href="${H(u.driveUrl)}" target="_blank" class="btn btn-sm btn-outline-success py-0 px-2"><i class="bi bi-google me-1"></i>Drive</a>`:''}
                        ${u.downloadUrl?`<a href="${H(u.downloadUrl)}" target="_blank" class="btn btn-sm btn-outline-primary py-0 px-2"><i class="bi bi-download me-1"></i>Download</a>`:''}
                        ${isAdmin?`<button class="btn btn-sm btn-outline-danger py-0 px-2 btnDelUpload" data-id="${u._id}"><i class="bi bi-trash"></i></button>`:''}
                    </div>
                </div>
            </div>`;
        }).join('');

        // Delete buttons (remove metadata only, file stays in Drive)
        document.querySelectorAll('.btnDelUpload').forEach(b=>b.addEventListener('click',function(){
            if(!confirm('Hapus record ini? (File tetap ada di Google Drive)'))return;
            const id=this.dataset.id;
            DB.remove('uploads/'+id);
            uploads=uploads.filter(u=>u._id!==id);
            renderList();
        }));
    }

    // Filter listeners (admin only)
    setTimeout(()=>{
        const fM=document.getElementById('fUpMdr');
        const fK=document.getElementById('fUpKat');
        fM?.addEventListener('change',renderList);
        fK?.addEventListener('change',renderList);
    },100);

    // Upload form handler - send to Google Drive via Apps Script
    $('fUpload').addEventListener('submit',function(e){
        e.preventDefault();
        const fd=new FormData(e.target);
        const file=document.getElementById('inputUpFile').files[0];
        if(!file){alert('Pilih file dulu');return;}

        if(file.size>10*1024*1024){
            $('uploadErr').style.display='block';
            $('uploadErr').textContent='File terlalu besar! Maksimal 10 MB.';
            return;
        }

        const madrasah=fd.get('madrasah');
        const kategori=fd.get('kategori');
        const keterangan=fd.get('keterangan')||'';

        const btn=$('btnSubmitUpload');
        btn.disabled=true;
        btn.innerHTML='<span class="spinner-border spinner-border-sm me-1"></span>Mengupload...';
        $('uploadProgress').style.display='block';
        $('uploadOk').style.display='none';
        $('uploadErr').style.display='none';

        const reader=new FileReader();
        reader.onload=async function(ev){
            try{
                // Extract pure base64 (remove data:...;base64, prefix)
                const base64Full=ev.target.result;
                const base64Data=base64Full.split(',')[1];

                const payload={
                    filename:file.name,
                    fileData:base64Data,
                    mimeType:file.type,
                    madrasah,
                    kategori,
                    keterangan,
                    pengirim:user.nama
                };

                const resp=await fetch(UPLOAD_SCRIPT_URL,{
                    method:'POST',
                    headers:{'Content-Type':'text/plain;charset=utf-8'},
                    body:JSON.stringify(payload),
                    redirect:'follow'
                });
                const result=await resp.json();

                if(!result.success) throw new Error(result.error||'Upload gagal');

                // Save metadata to Firebase DB (tanpa file content)
                const ts=Date.now();
                const meta={
                    filename:file.name,
                    madrasah,
                    kategori,
                    keterangan,
                    pengirim:user.nama,
                    role:user.role,
                    size:file.size,
                    type:file.type,
                    driveUrl:result.url||'',
                    downloadUrl:result.downloadUrl||'',
                    fileId:result.fileId||'',
                    timestamp:ts
                };
                const newId=await DB.push('uploads',meta);
                uploads.unshift({_id:newId,...meta});

                e.target.reset();
                $('uploadProgress').style.display='none';
                $('uploadOk').style.display='block';
                setTimeout(()=>{$('uploadOk').style.display='none';},5000);
                btn.disabled=false;
                btn.innerHTML='<i class="bi bi-cloud-arrow-up me-1"></i>Upload ke Google Drive';
                renderList();
            }catch(err){
                $('uploadErr').style.display='block';
                $('uploadErr').textContent='Gagal upload: '+err.message;
                $('uploadProgress').style.display='none';
                btn.disabled=false;
                btn.innerHTML='<i class="bi bi-cloud-arrow-up me-1"></i>Upload ke Google Drive';
            }
        };
        reader.onerror=function(){
            $('uploadErr').style.display='block';
            $('uploadErr').textContent='Gagal membaca file';
            $('uploadProgress').style.display='none';
            btn.disabled=false;
            btn.innerHTML='<i class="bi bi-cloud-arrow-up me-1"></i>Upload ke Google Drive';
        };
        reader.readAsDataURL(file);
    });
}

function getFileIcon(filename){
    const ext=(filename.split('.').pop()||'').toLowerCase();
    if(['pdf'].includes(ext)) return {icon:'bi-file-earmark-pdf text-danger',bg:'bg-danger bg-opacity-10'};
    if(['doc','docx'].includes(ext)) return {icon:'bi-file-earmark-word text-primary',bg:'bg-primary bg-opacity-10'};
    if(['xls','xlsx'].includes(ext)) return {icon:'bi-file-earmark-excel text-success',bg:'bg-success bg-opacity-10'};
    if(['ppt','pptx'].includes(ext)) return {icon:'bi-file-earmark-ppt text-warning',bg:'bg-warning bg-opacity-10'};
    if(['jpg','jpeg','png','gif','webp'].includes(ext)) return {icon:'bi-file-earmark-image text-info',bg:'bg-info bg-opacity-10'};
    if(['zip','rar','7z'].includes(ext)) return {icon:'bi-file-earmark-zip text-secondary',bg:'bg-secondary bg-opacity-10'};
    return {icon:'bi-file-earmark text-muted',bg:'bg-light'};
}

function formatSize(bytes){
    if(bytes<1024) return bytes+' B';
    if(bytes<1024*1024) return (bytes/1024).toFixed(1)+' KB';
    return (bytes/(1024*1024)).toFixed(1)+' MB';
}

// Boot
boot();
})();

// KKMA 04 Jember - Data Layer v2.0 (Firebase + offline fallback)
window.KKMA = {
    profil: {
        nama: "KKMA 04 Jember",
        wilayah: "Kecamatan Sukowono",
        kabupaten: "Jember",
        provinsi: "Jawa Timur",
        pengawas: "SUBARIYANTO, S.Pd, M.Pd.I",
        nip_pengawas: "197002122005011004",
        jabatan: "Pengawas Madrasah / Ketua Pokjawas Madrasah Kab. Jember",
        hp: "", email: "",
        alamat_kantor: "Kantor Kementerian Agama Kab. Jember, Jl. KH. Sidiq No. 52, Jember",
        link_wa: "",
        visi: "Terwujudnya madrasah aliyah yang bermutu, berdaya saing, dan berakhlak mulia di Kecamatan Sukowono.",
        misi: ["Meningkatkan mutu pembelajaran dan lulusan madrasah aliyah","Mengembangkan profesionalisme guru dan tenaga kependidikan","Memperkuat tata kelola madrasah yang transparan dan akuntabel","Membangun kerjasama antar madrasah dalam pengembangan mutu","Mengintegrasikan nilai-nilai keislaman dalam seluruh kegiatan pendidikan"],
        sambutan: "Assalamu'alaikum Wr. Wb.\n\nPuji syukur kehadirat Allah SWT. Website ini merupakan wujud komitmen KKMA 04 Jember dalam transparansi informasi dan peningkatan mutu madrasah.\n\nMelalui website ini, seluruh stakeholder dapat mengakses informasi supervisi, pembinaan, dan perkembangan madrasah di wilayah binaan KKMA 04 Kecamatan Sukowono.\n\nSemoga bermanfaat bagi kemajuan pendidikan madrasah di Kabupaten Jember.\n\nWassalamu'alaikum Wr. Wb."
    },
    // Default 20 madrasah
    defaultMadrasah: [
        {nsm:"131235090019",nama:"MAS Al-Badri",kepala:"Saifuddin, S.Pd.I",alamat:"Kec. Kalisat",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090020",nama:"MAS Al Mubarok",kepala:"Yuliana Anggraeni, S.Pd",alamat:"Kec. Kalisat",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090021",nama:"MAS Miftahul Ulum Kalisat",kepala:"Isfandiar",alamat:"Kec. Kalisat",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090027",nama:"MAS Nurul Ali",kepala:"Halik, S.Pd.I",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090028",nama:"MAS Miftahul Ulum Suren",kepala:"Muhammad Hazin Mudzhar, S.Hum",alamat:"Kec. Suren",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090049",nama:"MAS Nurul Qarnain",kepala:"Drs. H. Imam Syafi'i, M.Pd.I",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090053",nama:"MAS Nurul Islam Al-Hamidy",kepala:"Musthofa, S.Pd.I, M.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090054",nama:"MAS Baitul Azhar",kepala:"Mochammad Iswanto, S.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090066",nama:"MAS At-Taqwa",kepala:"Dr. Mohammad Erwan, S.Pd, M.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090072",nama:"MAS Ar-Rohmah",kepala:"Ali Rachamtulloh, S.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090081",nama:"MAS Raudlatul Ulum",kepala:"Nur Faridzah, S.Kg",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090086",nama:"MAS Kependidikan Nururrahman",kepala:"Abdullah",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090091",nama:"MAS Nurul Imam",kepala:"Rizqy Febri Puji Lestari, S.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090093",nama:"MAS Miftahul Ulum",kepala:"Lutfi Ghufron, S.Pd.I",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090094",nama:"MAS Habiburrohman",kepala:"Zaini",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090097",nama:"MAS Raudlatus Syabab",kepala:"H. Badrudin, S.Pd.I, M.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090105",nama:"MAS Plus Al Mahfudz",kepala:"Muhammad Ainul Fata Al Kiromi, S.H, M.Pd.I",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090114",nama:"MAS Bahrul Amin Al Kholili",kepala:"Ifrohatul Hasanah, S.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090115",nama:"MAS Miftahul Ulum (Plus)",kepala:"Mohammad Ramsi, SE",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"},
        {nsm:"131235090133",nama:"MAS Nurul Ulum",kepala:"Ahmad Ghovind, S.H, S.Pd",alamat:"Kec. Sukowono",telp:"",email:"",akreditasi:"-"}
    ]
};

// === Firebase DB helpers ===
window.DB = {
    _cache: {},
    _listeners: {},

    // Get reference
    ref: function(path) { return db.ref(path); },

    // Read once
    get: function(path) {
        return db.ref(path).once('value').then(snap => snap.val());
    },

    // Set data
    set: function(path, data) {
        return db.ref(path).set(data);
    },

    // Push (auto-id)
    push: function(path, data) {
        return db.ref(path).push(data).then(ref => ref.key);
    },

    // Update
    update: function(path, data) {
        return db.ref(path).update(data);
    },

    // Remove
    remove: function(path) {
        return db.ref(path).remove();
    },

    // Listen realtime
    listen: function(path, callback) {
        const ref = db.ref(path);
        ref.on('value', snap => {
            const val = snap.val();
            DB._cache[path] = val;
            callback(val);
        });
        DB._listeners[path] = ref;
    },

    // Stop listening
    unlisten: function(path) {
        if (DB._listeners[path]) {
            DB._listeners[path].off();
            delete DB._listeners[path];
        }
    },

    // Convert Firebase object to array
    toArray: function(obj) {
        if (!obj) return [];
        return Object.keys(obj).map(k => ({ _id: k, ...obj[k] }));
    },

    // Initialize default data if empty
    initDefaults: async function() {
        const madrasah = await DB.get('madrasah');
        if (!madrasah) {
            const batch = {};
            KKMA.defaultMadrasah.forEach(m => { batch[m.nsm] = m; });
            await DB.set('madrasah', batch);
        }
        const profil = await DB.get('profil');
        if (!profil) {
            await DB.set('profil', KKMA.profil);
        }
    }
};

// === Session (simple code-based auth) ===
window.Session = {
    ADMIN_CODE: 'admin2026',
    OPERATOR_CODE: 'kkma04',

    getUser: function() {
        const u = sessionStorage.getItem('kkma_user');
        return u ? JSON.parse(u) : null;
    },

    login: function(nama, role) {
        sessionStorage.setItem('kkma_user', JSON.stringify({ nama, role, ts: Date.now() }));
    },

    logout: function() {
        sessionStorage.removeItem('kkma_user');
        location.hash = '#/';
        location.reload();
    },

    isAdmin: function() {
        const u = this.getUser();
        return u && u.role === 'admin';
    },

    isLoggedIn: function() {
        return !!this.getUser();
    }
};

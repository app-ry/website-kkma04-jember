# Website KKMA 04 Jember

Website resmi Kelompok Kerja Madrasah Aliyah (KKMA) 04 Jember — Kecamatan Sukowono, Kabupaten Jember, Jawa Timur.

## Fitur

- **Data Madrasah** — Profil 20 madrasah binaan (NSM, kepala madrasah, alamat, akreditasi)
- **Data Guru** — CRUD data guru per madrasah (NIP, NUPTK, mapel, status kepegawaian)
- **Data Siswa** — CRUD data siswa per madrasah (NISN, kelas, jenis kelamin)
- **Beranda** — Dashboard statistik ringkas
- **Tentang** — Profil KKMA & Pengawas Pembina

## Tech Stack

- Vanilla JavaScript (no framework, no build step)
- Bootstrap 5 + Bootstrap Icons (CDN)
- localStorage untuk penyimpanan data
- Hash routing SPA
- Responsive & mobile-friendly

## Deploy

Static site — bisa deploy di GitHub Pages, Netlify, atau hosting manapun.

### GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Subariyanto/website-kkma04-jember.git
git push -u origin main
```

Aktifkan GitHub Pages dari Settings > Pages > Source: main branch.

### Local Development

```bash
node .serve.js
```

Buka http://localhost:3000

## Struktur File

```
├── index.html          # Entry point
├── css/style.css       # Custom styles
├── js/data.js          # Data madrasah + localStorage helpers
├── js/app.js           # Main application (router + views)
├── .serve.js           # Dev server (no dependencies)
├── .gitignore
└── README.md
```

## Pengawas Pembina

**SUBARIYANTO, S.Pd, M.Pd.I**
NIP. 197002122005011004

---

© 2026 KKMA 04 Jember — Kementerian Agama Kabupaten Jember

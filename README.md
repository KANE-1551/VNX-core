# VNX — Tier Dasar

## Struktur folder
```
vnx/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── chat.js
├── api/
│   └── chat.js        ← backend function (Vercel), panggil Groq
├── package.json
└── README.md
```

## Cara jalanin (via GitHub → Vercel, sesuai alur kerja kamu)

1. Push semua folder ini ke repo GitHub
2. Import repo itu di Vercel (New Project → pilih repo)
3. Saat setup, set **Root Directory** ke folder root project ini (bukan ke `frontend/` — karena `api/` harus ikut ke-deploy sebagai serverless function)
4. Di Vercel → Settings → Environment Variables, tambahkan:
   ```
   GROQ_API_KEY = (key Groq kamu)
   ```
5. Deploy

## Kenapa `/api/chat.js` otomatis jadi endpoint?

Vercel otomatis mengubah folder `api/` jadi serverless functions. File `api/chat.js`
otomatis bisa diakses di `https://domain-kamu.vercel.app/api/chat` — tidak perlu
konfigurasi tambahan.

## Status fitur (tier dasar)

- ✅ UI chat full-screen, dark mode
- ✅ Kirim pesan → Groq (llama-3.1-8b-instant) → balas
- ✅ Riwayat percakapan in-memory (hilang saat refresh)
- ✅ Sidebar (UI siap, penyimpanan riwayat asli belum — nyusul saat upgrade Firebase)
- ⬜ Firebase Auth + Firestore (riwayat tersimpan)
- ⬜ Model routing (gpt-oss-120b, qwen3.6-27b, Gemini)
- ⬜ Vision, image generation, 3D preview, web search, API key custom

## Langkah upgrade berikutnya

Begini urutan yang disaranin waktu mau nambah fitur:
1. Firebase Auth + Firestore → riwayat chat tersimpan
2. Tambah Gemini sebagai model kedua (`api/chat.js` di-upgrade jadi router sederhana)
3. Fitur-fitur lain menyusul satu per satu sesuai rancangan awal

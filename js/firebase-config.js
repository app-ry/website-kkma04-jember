// Firebase Configuration
// Pak Yanto perlu buat project di https://console.firebase.google.com
// 1. Create Project → nama: kkma04-jember
// 2. Build → Realtime Database → Create Database → Start in TEST MODE
// 3. Project Settings → General → Your apps → Web app → Register → copy config
// 4. Replace config di bawah ini

const firebaseConfig = {
    apiKey: "FIREBASE_API_KEY",
    authDomain: "kkma04-jember.firebaseapp.com",
    databaseURL: "https://kkma04-jember-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kkma04-jember",
    storageBucket: "kkma04-jember.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:000000000000"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.database();

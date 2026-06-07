// Firebase Configuration - KKMA 04 Jember
const firebaseConfig = {
    apiKey: "AIzaSyDnzoZw-ZyaJqg2j4M-dbjTp5Y9THEGjHY",
    authDomain: "kkma04-jember.firebaseapp.com",
    databaseURL: "https://kkma04-jember-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kkma04-jember",
    storageBucket: "kkma04-jember.firebasestorage.app",
    messagingSenderId: "325923646437",
    appId: "1:325923646437:web:8fb47eb8bf9f03fd465d0c"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.database();

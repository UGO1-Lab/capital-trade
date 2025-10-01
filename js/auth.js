// -----------------------------
// Firebase boot + Auth + DB
// -----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// YOUR CONFIG (from Firebase console)
const firebaseConfig = {
    apiKey: "AIzaSyC5iw0fT4djIqS9NizZuBxk_chRbFtb548",
    authDomain: "capital-trade-c20f4.firebaseapp.com",
    projectId: "capital-trade-c20f4",
    storageBucket: "capital-trade-c20f4.firebasestorage.app",
    messagingSenderId: "539164154353",
    appId: "1:539164154353:web:9f364603173a4b093e4c50"
};

// Init
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// (also place on window so other scripts can read if needed)
window.auth = auth;
window.db = db;

// -----------------------------
// SIGN UP
// -----------------------------
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("suName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const err = document.getElementById("suErr");

    try {
        err.textContent = "";
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        // set display name
        await updateProfile(cred.user, { displayName: name || "Investor" });

        // create user profile with defaults in Firestore
        await setDoc(doc(db, "users", cred.user.uid), {
            name: name || "Investor",
            email,
            balance: 0,            // USD cents? (we'll keep simple dollars)
            status: "Unverified",  // you can flip this later in Firestore to "Verified"
            roiWeekly: 0,          // %
            nextPayout: null,
            createdAt: serverTimestamp()
        });

        // go to dashboard
        window.location.href = "dashboard.html";
    } catch (e2) {
        console.error(e2);
        err.textContent = e2.message;
    }
});

// -----------------------------
// LOGIN
// -----------------------------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const err = document.getElementById("liErr");

    try {
        err.textContent = "";
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (e2) {
        console.error(e2);
        err.textContent = e2.message;
    }
});

// --- Firebase init (use your config) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
    getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC5iw0fT4djIqS9NizZuBxk_chRbFtb548",
    authDomain: "capital-trade-c20f4.firebaseapp.com",
    projectId: "capital-trade-c20f4",
    storageBucket: "capital-trade-c20f4.firebasestorage.app",
    messagingSenderId: "539164154353",
    appId: "1:539164154353:web:9f364603173a4b093e4c50"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Simple “admin login” prompt if not signed in ---
// Use your own email/password for admin (must match Authentication user whose UID is in rules)
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        const email = prompt("Admin email:");
        const pass = prompt("Admin password:");
        if (email && pass) {
            try { await signInWithEmailAndPassword(auth, email, pass); }
            catch (e) { alert("Login failed: " + e.message); }
        }
    }
});

// --- UI elements ---
const emailInput = document.getElementById("email");
const findBtn = document.getElementById("btnFind");
const signOutBtn = document.getElementById("btnSignOut");

const editBlock = document.getElementById("editBlock");
const findMsg = document.getElementById("findMsg");
const saveMsg = document.getElementById("saveMsg");

const uidEl = document.getElementById("uid");
const nameEl = document.getElementById("name");
const balEl = document.getElementById("balance");
const depEl = document.getElementById("totalDeposits");
const wdlEl = document.getElementById("totalWithdrawals");
const statusEl = document.getElementById("status");
const txAmountEl = document.getElementById("txAmount");
const saveBtn = document.getElementById("btnSave");

// --- Find user by email ---
findBtn.addEventListener("click", async () => {
    const email = (emailInput.value || "").trim().toLowerCase();
    if (!email) { findMsg.textContent = "Enter an email."; return; }
    findMsg.textContent = "Searching…";

    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        if (snap.empty) {
            findMsg.textContent = "No user with that email.";
            editBlock.classList.add("hide");
            return;
        }
        // Assuming email unique -> first result
        const docSnap = snap.docs[0];
        const data = docSnap.data();

        uidEl.value = docSnap.id;
        nameEl.value = data.name || "";
        balEl.value = data.balance || 0;
        depEl.value = data.totalDeposits || 0;
        wdlEl.value = data.totalWithdrawals || 0;
        statusEl.value = data.status || "Pending";

        editBlock.classList.remove("hide");
        findMsg.textContent = "User loaded.";
    } catch (e) {
        findMsg.textContent = "Error: " + e.message;
    }
});

// --- Save changes (and optional transaction) ---
saveBtn.addEventListener("click", async () => {
    const uid = uidEl.value;
    if (!uid) return;

    saveMsg.textContent = "Saving…";
    try {
        const userRef = doc(db, "users", uid);
        const update = {
            name: nameEl.value.trim(),
            balance: Number(balEl.value || 0),
            totalDeposits: Number(depEl.value || 0),
            totalWithdrawals: Number(wdlEl.value || 0),
            status: statusEl.value,
            updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, update, { merge: true });

        // Optional: record a transaction if an amount is provided
        const amt = Number(txAmountEl.value);
        if (!isNaN(amt) && amt !== 0) {
            const type = amt > 0 ? "deposit" : "withdrawal";
            await addDoc(collection(db, "users", uid, "transactions"), {
                type, amount: amt, at: serverTimestamp()
            });
            txAmountEl.value = "";
        }

        saveMsg.innerHTML = <span class="ok">Saved ✔</span>;
    } catch (e) {
        saveMsg.innerHTML = <span class="err">Error: ${e.message}</span>;
    }
});

// --- Admin sign out ---
signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
    location.reload();
});

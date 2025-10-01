// Dashboard: read user + profile from Firestore and render
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, db } from "./auth.js";

const $ = (id) => document.getElementById(id);

// format helpers
const money = (n) =>
    (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const datePretty = (ts) => {
    if (!ts) return "—";
    const d = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
};

async function ensureProfile(uid, userName, userEmail) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        // create a default document if somehow missing
        await setDoc(ref, {
            name: userName || "Investor",
            email: userEmail,
            balance: 0,
            status: "Unverified",
            roiWeekly: 0,
            nextPayout: null,
            createdAt: Timestamp.now()
        });
        return (await getDoc(ref)).data();
    }
    return snap.data();
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // build greeting
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Investor");
    $("greeting").textContent = Hello, ${ name } !;
    $("subline").textContent = "Welcome to your investor dashboard.";

    // get Firestore profile (or create default if missing)
    const profile = await ensureProfile(user.uid, name, user.email);

    // render metrics
    $("mBalance").textContent = money(profile.balance);
    $("mStatus").textContent = profile.status || "Unverified";
    $("mRoi").textContent = ${ Number(profile.roiWeekly || 0) }%;
    $("mPayout").textContent = datePretty(profile.nextPayout);
});

// logout
$("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});
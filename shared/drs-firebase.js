// DRS Website — shared Firebase init + auth helpers + admin check.
// Project shared with ORBIT, Eclipse, Vivero. All DRS-website data is namespaced
// with the `drs_` prefix on Firestore collections to avoid colliding with games.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Firebase Web config — public by design (apiKey is not a secret).
// Project: orbit-game-8f865 (shared across all DRS apps).
// TODO: Register a dedicated "DRS Website" Web App in Firebase Console for cleaner
// Analytics/separation. For now we reuse the same project config.
const firebaseConfig = {
  apiKey: "AIzaSyB9rkCg1lqThz0ZLN4jKKzKxG0ABMqhdaU",
  authDomain: "orbit-game-8f865.firebaseapp.com",
  projectId: "orbit-game-8f865",
  storageBucket: "orbit-game-8f865.firebasestorage.app",
  messagingSenderId: "913628193179",
  appId: "1:913628193179:web:7cf9872f10b88aa294413e",
};

export const COLLECTIONS = {
  POSTS: "drs_posts",
  COMMENTS: "drs_post_comments",
  REACTIONS: "drs_post_reactions",
};

export const ADMIN_EMAIL = "jucapegu02@gmail.com";

export const app = initializeApp(firebaseConfig, "drs-website");
export const auth = getAuth(app);
export const db = getFirestore(app);

let currentUser = null;
const authReadyResolvers = [];
let authReady = false;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!authReady) {
    authReady = true;
    authReadyResolvers.forEach((resolve) => resolve(user));
  }
  document.dispatchEvent(new CustomEvent("drs-auth-changed", { detail: user }));
});

export function getCurrentUser() {
  return currentUser;
}

export function isAdmin(user = currentUser) {
  return !!(user && user.email === ADMIN_EMAIL);
}

export function waitForAuth() {
  if (authReady) return Promise.resolve(currentUser);
  return new Promise((resolve) => authReadyResolvers.push(resolve));
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInGuest() {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

// Apps that have devlog pages. Used by progress.html to validate ?app= param.
export const APPS = {
  eclipse: {
    name: "Eclipse",
    tagline_en: "2D top-down RPG sandbox where light and darkness are mechanics.",
    tagline_es: "RPG sandbox 2D donde la luz y la oscuridad son mecánicas.",
    icon: "https://eclipse-drs.web.app/assets/branding/logo.png",
    color: "#ffaa44",
  },
  vivero: {
    name: "Vivero",
    tagline_en: "Gardening simulator with a player-driven seed marketplace.",
    tagline_es: "Simulador de jardinería con mercado de semillas entre jugadores.",
    icon: "",
    emoji: "🌱",
    color: "#22c55e",
  },
};

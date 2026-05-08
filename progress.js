// DRS Website — Devlog page logic
// Loads posts for ?app=<slug>, handles auth, reactions, comments live.

import {
  auth,
  db,
  COLLECTIONS,
  APPS,
  getCurrentUser,
  isAdmin,
  signInWithGoogle,
  signInGuest,
  signOutUser,
  waitForAuth,
} from "./shared/drs-firebase.js";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const REACTION_TYPES = [
  { type: "like",  emoji: "👍" },
  { type: "love",  emoji: "❤️" },
  { type: "fire",  emoji: "🔥" },
  { type: "rocket", emoji: "🚀" },
  { type: "eye",   emoji: "👀" },
];

// ── Resolve app from URL ────────────────────────
const params = new URLSearchParams(window.location.search);
const appSlug = (params.get("app") || "").toLowerCase();
const appConfig = APPS[appSlug];

if (!appConfig) {
  document.getElementById("devlog-feed").innerHTML = `
    <div class="devlog-error">
      <p>Unknown app: <code>${appSlug || "(none)"}</code></p>
      <p style="margin-top:10px;font-size:12px;">
        <a href="./" style="color:#22d3ee">← Back to Deer Rock Studios</a>
      </p>
    </div>`;
  document.getElementById("devlog-empty").style.display = "none";
  throw new Error(`Unknown app: ${appSlug}`);
}

document.title = `${appConfig.name} — Devlog · Deer Rock Studios`;
const lang = document.documentElement.lang === "es" ? "es" : "en";

// Hero
const iconEl = document.getElementById("devlog-icon");
if (appConfig.icon) {
  iconEl.innerHTML = `<img src="${appConfig.icon}" alt="${appConfig.name}">`;
} else {
  iconEl.style.color = appConfig.color || "#aabbcc";
  iconEl.textContent = appConfig.emoji || "🚀";
}
document.getElementById("devlog-title").textContent = appConfig.name;
document.getElementById("devlog-tagline").textContent =
  appConfig[`tagline_${lang}`] || appConfig.tagline_en;

// ── Auth UI ─────────────────────────────────────
const authStatus  = document.getElementById("auth-status");
const btnGoogle   = document.getElementById("auth-google");
const btnGuest    = document.getElementById("auth-guest");
const btnSignout  = document.getElementById("auth-signout");

function renderAuthState(user) {
  if (!user) {
    authStatus.textContent = "Not signed in";
    authStatus.className = "auth-status mono";
    btnGoogle.style.display  = "";
    btnGuest.style.display   = "";
    btnSignout.style.display = "none";
  } else if (user.isAnonymous) {
    authStatus.textContent = "Signed in as guest";
    authStatus.className = "auth-status mono signed-in";
    btnGoogle.style.display  = "";
    btnGuest.style.display   = "none";
    btnSignout.style.display = "";
  } else if (isAdmin(user)) {
    authStatus.textContent = `Admin: ${user.email}`;
    authStatus.className = "auth-status mono admin";
    btnGoogle.style.display  = "none";
    btnGuest.style.display   = "none";
    btnSignout.style.display = "";
    showAdminBanner();
  } else {
    authStatus.textContent = `Signed in as ${user.displayName || user.email}`;
    authStatus.className = "auth-status mono signed-in";
    btnGoogle.style.display  = "none";
    btnGuest.style.display   = "none";
    btnSignout.style.display = "";
  }
  // Re-render posts so comment forms enable/disable correctly.
  renderPosts();
}

btnGoogle.addEventListener("click", async () => {
  try { await signInWithGoogle(); } catch (e) { alert(e.message); }
});
btnGuest.addEventListener("click", async () => {
  try { await signInGuest(); } catch (e) { alert(e.message); }
});
btnSignout.addEventListener("click", async () => {
  await signOutUser();
});

document.addEventListener("drs-auth-changed", (e) => renderAuthState(e.detail));
waitForAuth().then(renderAuthState);

// ── Admin banner ────────────────────────────────
function showAdminBanner() {
  if (document.getElementById("admin-banner")) return;
  const bar = document.createElement("div");
  bar.id = "admin-banner";
  bar.className = "admin-banner";
  bar.innerHTML = `
    <span>You're logged in as admin.</span>
    <a href="./admin.html?app=${appSlug}">Go to admin panel →</a>
  `;
  document.querySelector(".devlog-main").insertBefore(bar, document.getElementById("auth-bar"));
}

// ── Posts feed ──────────────────────────────────
const feedEl = document.getElementById("devlog-feed");
const emptyEl = document.getElementById("devlog-empty");

let posts = [];
let reactionsByPost = new Map();   // postId → { type → { count, mine } }
let commentsByPost  = new Map();   // postId → array

const postsQuery = query(
  collection(db, COLLECTIONS.POSTS),
  where("appSlug", "==", appSlug),
  orderBy("createdAt", "desc"),
);

onSnapshot(postsQuery, (snap) => {
  posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderPosts();
  // Subscribe to reactions and comments for each post on first load.
  snap.docs.forEach((d) => subscribePostExtras(d.id));
}, (err) => {
  console.error("[DRS] posts snapshot error:", err);
  feedEl.innerHTML = `<div class="devlog-error">
    Failed to load posts: ${err.message}<br>
    <small>Verify Firestore rules and authorized domains.</small>
  </div>`;
});

const _subscribed = new Set();
function subscribePostExtras(postId) {
  if (_subscribed.has(postId)) return;
  _subscribed.add(postId);

  // Reactions live
  const rQ = query(collection(db, COLLECTIONS.REACTIONS), where("postId", "==", postId));
  onSnapshot(rQ, (snap) => {
    const counts = {};
    const uid = getCurrentUser()?.uid;
    snap.forEach((d) => {
      const r = d.data();
      counts[r.type] = counts[r.type] || { count: 0, mine: false };
      counts[r.type].count++;
      if (uid && r.uid === uid) counts[r.type].mine = true;
    });
    reactionsByPost.set(postId, counts);
    renderPosts();
  });

  // Comments live
  const cQ = query(
    collection(db, COLLECTIONS.COMMENTS),
    where("postId", "==", postId),
    orderBy("createdAt", "asc"),
  );
  onSnapshot(cQ, (snap) => {
    commentsByPost.set(postId, snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    renderPosts();
  });
}

// ── Render ──────────────────────────────────────
function escape(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function linkify(text) {
  return escape(text).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>',
  );
}

function renderPosts() {
  if (!posts.length) {
    emptyEl.style.display = "";
    emptyEl.textContent =
      lang === "es" ? "Aún no hay posts. Vuelve pronto."
                    : "No posts yet. Check back soon.";
    feedEl.querySelectorAll(".post-card").forEach((el) => el.remove());
    return;
  }
  emptyEl.style.display = "none";

  const html = posts.map((p) => renderPost(p)).join("");
  feedEl.innerHTML = html;

  // Attach event listeners
  feedEl.querySelectorAll(".reaction-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleReaction(btn.dataset.postId, btn.dataset.type));
  });
  feedEl.querySelectorAll(".comment-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitComment(form.dataset.postId, form);
    });
  });
  feedEl.querySelectorAll(".comment-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteComment(btn.dataset.commentId));
  });
}

function renderPost(p) {
  const reactions = reactionsByPost.get(p.id) || {};
  const comments  = commentsByPost.get(p.id) || [];
  const user      = getCurrentUser();
  const canPost   = !!user;

  const reactionsHtml = REACTION_TYPES.map(({ type, emoji }) => {
    const r = reactions[type] || { count: 0, mine: false };
    return `<button class="reaction-btn ${r.mine ? "active" : ""}"
      data-post-id="${p.id}" data-type="${type}"
      ${user ? "" : "disabled title='Sign in to react'"}>
      <span>${emoji}</span><span class="reaction-count">${r.count}</span>
    </button>`;
  }).join("");

  const commentsHtml = comments.map((c) => {
    const isCommentAdmin = c.email === "jucapegu02@gmail.com";
    const canDelete = user && (user.uid === c.uid || isAdmin(user));
    const author = isCommentAdmin
      ? "Juan (DRS)"
      : c.displayName || (c.email ? c.email.split("@")[0] : "Guest");
    return `
      <div class="comment-item">
        <div class="comment-item-head">
          <span class="comment-author ${isCommentAdmin ? "admin" : ""}">${escape(author)}</span>
          <span>· ${formatDate(c.createdAt)}</span>
          ${canDelete ? `<button class="comment-delete" data-comment-id="${c.id}" title="Delete">✕</button>` : ""}
        </div>
        <div class="comment-body">${linkify(c.text)}</div>
      </div>`;
  }).join("");

  const promptText = lang === "es"
    ? "Inicia sesión para comentar."
    : "Sign in to comment.";
  const placeholderText = lang === "es" ? "Comparte tu opinión…" : "Share your thoughts…";
  const submitText = lang === "es" ? "Enviar" : "Post";

  return `
    <article class="post-card">
      <div class="post-meta">
        <span>${formatDate(p.createdAt)}</span>
        ${p.version ? `<span class="post-version">v${escape(p.version)}</span>` : ""}
      </div>
      <h2 class="post-title">${escape(p.title)}</h2>
      ${p.image ? `<img class="post-image" src="${escape(p.image)}" alt="" loading="lazy">` : ""}
      <div class="post-body">${linkify(p.body)}</div>
      <div class="post-reactions">${reactionsHtml}</div>
      <div class="post-comments">
        ${canPost ? `
          <form class="comment-form" data-post-id="${p.id}">
            <textarea name="text" placeholder="${placeholderText}" maxlength="800" required></textarea>
            <button type="submit">${submitText}</button>
          </form>
        ` : `<div class="auth-status mono" style="margin-bottom:14px;">${promptText}</div>`}
        <div class="comment-list">${commentsHtml}</div>
      </div>
    </article>`;
}

// ── Reactions ───────────────────────────────────
async function toggleReaction(postId, type) {
  const user = getCurrentUser();
  if (!user) return;
  const reactionId = `${postId}_${user.uid}_${type}`;
  const ref = doc(db, COLLECTIONS.REACTIONS, reactionId);
  const reactions = reactionsByPost.get(postId) || {};
  const mine = reactions[type]?.mine;
  try {
    if (mine) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        postId, type,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("[DRS] reaction error:", err);
    alert("Could not save reaction. Try signing in again.");
  }
}

// ── Comments ────────────────────────────────────
async function submitComment(postId, form) {
  const user = getCurrentUser();
  if (!user) return;
  const text = form.querySelector("textarea").value.trim();
  if (!text) return;
  const btn = form.querySelector("button");
  btn.disabled = true;
  try {
    await addDoc(collection(db, COLLECTIONS.COMMENTS), {
      postId,
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      text,
      createdAt: serverTimestamp(),
    });
    form.querySelector("textarea").value = "";
  } catch (err) {
    console.error("[DRS] comment error:", err);
    alert("Could not post comment.");
  } finally {
    btn.disabled = false;
  }
}

async function deleteComment(commentId) {
  if (!confirm("Delete this comment?")) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.COMMENTS, commentId));
  } catch (err) {
    console.error("[DRS] delete comment error:", err);
    alert("Could not delete.");
  }
}

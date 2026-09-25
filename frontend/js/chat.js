// ===== VNX chat frontend logic =====
// Tier dasar: in-memory, panggil /api/chat (backend function di Vercel)

const API_ENDPOINT = "/api/chat"; // backend serverless function

const chatScroll   = document.getElementById("chatScroll");
const emptyState   = document.getElementById("emptyState");
const messagesEl   = document.getElementById("messages");
const form         = document.getElementById("composerForm");
const input        = document.getElementById("composerInput");
const sendBtn      = document.getElementById("sendBtn");
const newChatBtn   = document.getElementById("newChatBtn");
const sidebar      = document.getElementById("sidebar");
const sidebarToggle= document.getElementById("sidebarToggle");
const historyList  = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");

// in-memory conversation state (hilang saat refresh — sesuai tier dasar)
let conversation = []; // { role: "user"|"assistant", content: string }
let isStreaming = false;

// ---------- textarea auto-grow ----------
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
  sendBtn.disabled = input.value.trim().length === 0 || isStreaming;
});

// Enter to send, Shift+Enter for newline
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) form.requestSubmit();
  }
});

// ---------- submit ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || isStreaming) return;

  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;

  hideEmptyState();
  appendMessage("user", text);
  conversation.push({ role: "user", content: text });

  const aiBubble = appendTypingBubble();
  isStreaming = true;

  try {
    const reply = await sendToBackend(conversation);
    updateBubbleContent(aiBubble, reply);
    conversation.push({ role: "assistant", content: reply });
  } catch (err) {
    updateBubbleContent(
      aiBubble,
      "Maaf, ada masalah menghubungi VNX. Coba lagi sebentar lagi."
    );
    console.error(err);
  } finally {
    isStreaming = false;
    sendBtn.disabled = input.value.trim().length === 0;
    scrollToBottom();
  }
});

// ---------- backend call ----------
async function sendToBackend(messages) {
  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    throw new Error("Backend error: " + res.status);
  }

  const data = await res.json();
  return data.reply ?? "(tidak ada balasan)";
}

// ---------- UI helpers ----------
function hideEmptyState() {
  emptyState.classList.add("hidden");
}

function appendMessage(role, text) {
  const row = document.createElement("div");
  row.className = "msg " + (role === "user" ? "msg-user" : "msg-ai");

  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "V";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);

  messagesEl.appendChild(row);
  scrollToBottom();
  return bubble;
}

function appendTypingBubble() {
  const row = document.createElement("div");
  row.className = "msg msg-ai";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "V";
  row.appendChild(avatar);

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  row.appendChild(bubble);

  messagesEl.appendChild(row);
  scrollToBottom();
  return bubble;
}

function updateBubbleContent(bubble, text) {
  bubble.textContent = text;
}

function scrollToBottom() {
  chatScroll.scrollTop = chatScroll.scrollHeight;
}

// ---------- new chat ----------
newChatBtn.addEventListener("click", () => {
  conversation = [];
  messagesEl.innerHTML = "";
  emptyState.classList.remove("hidden");
  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;
  closeSidebarOnMobile();
});

// ---------- sidebar toggle (mobile) ----------
sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

function closeSidebarOnMobile() {
  if (window.innerWidth <= 760) sidebar.classList.remove("open");
}

// script.js - two-screen control + chat placeholder + typing indicator

const welcomeScreen = document.getElementById('welcome-screen');
const chatScreen = document.getElementById('chat-screen');
const startBtn = document.getElementById('start-chat');
const backBtn = document.getElementById('back');
const chatWrap = document.getElementById('chat-wrap');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const welcomeInput = document.getElementById('welcome-input');
const welcomeGo = document.getElementById('welcome-go');

// quick pills copy to welcome input
document.querySelectorAll('.pill').forEach(p => {
  p.addEventListener('click', () => {
    const txt = p.dataset.quick || p.innerText;
    welcomeInput.value = txt;
  });
});

// open chat screen (manual start)
startBtn.addEventListener('click', () => {
  showChatScreen();
  // if welcome input has text, send it automatically
  const q = welcomeInput.value.trim();
  if (q) {
    chatInput.value = q;
    sendMessage();
    welcomeInput.value = '';
  } else {
    chatInput.focus();
  }
});

// welcome quick go (arrow button)
welcomeGo.addEventListener('click', () => {
  const v = welcomeInput.value.trim();
  if (!v) return;
  showChatScreen();
  chatInput.value = v;
  sendMessage();
  welcomeInput.value = '';
});

// back to welcome
backBtn.addEventListener('click', () => {
  chatScreen.style.display = 'none';
  chatScreen.setAttribute('aria-hidden', 'true');
  welcomeScreen.style.display = 'flex';
  welcomeScreen.setAttribute('aria-hidden', 'false');
  // small timeout then scroll top of welcome
  setTimeout(()=> window.scrollTo({top:0, behavior:'smooth'}), 100);
});

function showChatScreen() {
  welcomeScreen.style.display = 'none';
  welcomeScreen.setAttribute('aria-hidden', 'true');
  chatScreen.style.display = 'flex';
  chatScreen.setAttribute('aria-hidden', 'false');
  // scroll chat to bottom after a tick
  setTimeout(()=> chatWrap.scrollTop = chatWrap.scrollHeight, 120);
}

// utility to scroll chat to bottom
function scrollToBottom() {
  chatWrap.scrollTop = chatWrap.scrollHeight + 200;
}

// build bubble
function addBubble(text, who='bot') {
  const div = document.createElement('div');
  div.className = 'bubble ' + (who === 'bot' ? 'bot' : 'user');

  const avatar = document.createElement('img');
  avatar.className = 'avatar';
  avatar.alt = who === 'bot' ? 'assistant' : 'you';
  avatar.src = who === 'bot'
    ? 'https://cdn-icons-png.flaticon.com/512/2950/2950721.png'
    : 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png';

  div.appendChild(avatar);

  const txt = document.createElement('div');
  txt.style.marginLeft = '6px';
  txt.innerText = text;
  div.appendChild(txt);

  chatWrap.appendChild(div);
  scrollToBottom();
  return div;
}

// typing bubble
function addTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'bubble bot';
  const avatar = document.createElement('img');
  avatar.className = 'avatar';
  avatar.src = 'https://cdn-icons-png.flaticon.com/512/2950/2950721.png';
  wrap.appendChild(avatar);

  const typ = document.createElement('div');
  typ.className = 'typing';
  typ.innerHTML = '<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
  wrap.appendChild(typ);

  chatWrap.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

// simple canned replies (placeholder) - replace with real API call later
function cannedResponse(q) {
  const lower = q.toLowerCase();
  if (lower.includes('benefit')) {
    return "Donating breast milk helps premature babies build immunity and reduces infection risk.";
  }
  if (lower.includes('donat') || lower.includes('how')) {
    return "Reach out to your local hospital milk bank or a registered NGO. They will screen donors and advise on safe collection.";
  }
  if (lower.includes('safe')) {
    return "Yes — most milk banks screen donors and pasteurize milk. Follow local guidelines and always use sterilized containers.";
  }
  if (lower.includes('store')) {
    return "Refrigerate at 4°C and use within 4 days. Freeze for longer storage and label with date/time.";
  }
  const fallback = [
    "Milk banks near hospitals are a good start — I can help find contacts if you share your city.",
    "Screening ensures donated milk is safe. Milk banks pasteurize and test the collected milk.",
    "If you're on medications, check with the milk bank before donating."
  ];
  return fallback[Math.floor(Math.random()*fallback.length)];
}

// main send logic
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addBubble(text, 'user');
  chatInput.value = '';
  // show typing
  const typingEl = addTyping();

  // simulate async latency & generate reply
  setTimeout(() => {
    typingEl.remove();
    const reply = cannedResponse(text);
    addBubble(reply, 'bot');
  }, 900 + Math.random()*1100);
}

// event listeners
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

// accessibility focus
chatInput.setAttribute('aria-label','Type a message about breast milk donation');
welcomeInput.setAttribute('aria-label','Quick question or topic');


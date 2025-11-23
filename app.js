// Generate a random user identity
const generateUser = () => {
    const id = Math.floor(Math.random() * 1000000).toString(16);
    const randomNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn'];
    const name = randomNames[Math.floor(Math.random() * randomNames.length)] + ' ' + Math.floor(Math.random() * 100);
    const hue = Math.floor(Math.random() * 360);
    return {
        id: id,
        name: name,
        color: `hsl(${hue}, 70%, 50%)`,
        initial: name.charAt(0)
    };
};

// State
const currentUser = generateUser();
const channel = new BroadcastChannel('local_chat_v1');

// DOM Elements
const chatArea = document.getElementById('chat-area');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const myAvatar = document.getElementById('my-avatar');
const myUsername = document.getElementById('my-username');

// Initialize UI
myAvatar.style.backgroundColor = currentUser.color;
myAvatar.textContent = currentUser.initial;
myUsername.textContent = currentUser.name;

// Format time
const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Create Message HTML
const createMessageElement = (data, isSent) => {
    const row = document.createElement('div');
    row.classList.add('message-row', isSent ? 'sent' : 'received');

    const avatarHtml = isSent ? '' : `
        <div class="msg-avatar" style="background-color: ${data.color}">
            ${data.initial}
        </div>
    `;

    const senderNameHtml = isSent ? '' : `<span class="sender-name">${data.name}</span>`;

    row.innerHTML = `
        ${avatarHtml}
        <div class="message-content">
            <div class="message-bubble">
                ${senderNameHtml}
                ${escapeHtml(data.text)}
                <div class="message-meta">${data.time}</div>
            </div>
        </div>
    `;
    return row;
};

// XSS Protection
const escapeHtml = (unsafe) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

// Add message to UI
const addMessageToChat = (data, isSent) => {
    const msgEl = createMessageElement(data, isSent);
    chatArea.appendChild(msgEl);
    scrollToBottom();
};

const scrollToBottom = () => {
    chatArea.scrollTop = chatArea.scrollHeight;
};

// Handle sending
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();

    if (!text) return;

    const messageData = {
        id: Date.now(), // simple unique id
        userId: currentUser.id,
        name: currentUser.name,
        color: currentUser.color,
        initial: currentUser.initial,
        text: text,
        time: getTime()
    };

    // Show locally
    addMessageToChat(messageData, true);

    // Send to other tabs
    channel.postMessage(messageData);

    // Clear input
    messageInput.value = '';
    messageInput.focus();
});

// Handle receiving from other tabs
channel.onmessage = (event) => {
    const data = event.data;
    // Even though we filter by Sent/Received locally, 
    // make sure we don't duplicate if we somehow receive our own broadcast
    if (data.userId !== currentUser.id) {
        addMessageToChat(data, false);
    }
};

// Mobile viewport fix for virtual keyboard
// Ensures the input area stays visible when keyboard opens
const viewport = document.querySelector('meta[name=viewport]');
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        document.body.style.height = window.visualViewport.height + 'px';
        scrollToBottom();
    });
}
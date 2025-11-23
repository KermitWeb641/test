let conversationHistory = [];
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv;
}

async function sendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    messageInput.value = '';
    sendButton.disabled = true;

    addMessage(userMessage, 'user');

    const newMessage = {
        role: 'user',
        content: userMessage
    };
    conversationHistory.push(newMessage);

    const loadingDiv = addMessage('...', 'loading');

    try {
        conversationHistory = conversationHistory.slice(-10);

        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful and friendly assistant.'
                },
                ...conversationHistory
            ]
        });

        loadingDiv.remove();

        addMessage(completion.content, 'assistant');
        conversationHistory.push(completion);
    } catch (error) {
        loadingDiv.remove();
        addMessage('Sorry, something went wrong. Please try again.', 'assistant');
        console.error(error);
    }

    sendButton.disabled = false;
    messageInput.focus();
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

messageInput.focus();
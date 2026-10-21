
document.addEventListener("DOMContentLoaded", function () {
    const recipientInput = document.getElementById("recipient-input");
    const recipientStatus = document.getElementById("recipient-status");

    const messageInput = document.getElementById("message-input");
    const messageCounter = document.getElementById("message-counter");
    const messageError = document.getElementById("message-error");

    const sendButton = document.getElementById("send-button");
    const chatBox = document.getElementById("chat-box");
    const toast = document.getElementById("toast");

    const contactsButton = document.getElementById("contacts-button");
    const contactsList = document.getElementById("contacts-list");
    const contacts = document.querySelectorAll(".contact");

    const MIN_MESSAGE_LENGTH = 1;
    const MAX_MESSAGE_LENGTH = 1000;

    const MIN_USERNAME_LENGTH = 3;
    const MAX_USERNAME_LENGTH = 20;

    const STORAGE_KEY = "messenger-conversations-v1";

    const users = ["egor", "masha", "zahar"];

    let recipientValid = false;
    let messageValid = false;
    let toastTimeout;

    // Загружаем переписки из localStorage.
    function loadConversations() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return {};
            }

            const parsed = JSON.parse(saved);

            if (
                parsed === null ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                return {};
            }

            return parsed;
        } catch (error) {
            console.error("Не удалось загрузить переписки:", error);
            return {};
        }
    }

    let conversations = loadConversations();

    // Сохраняем все переписки в localStorage.
    function saveConversations() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(conversations)
            );
        } catch (error) {
            console.error("Не удалось сохранить переписки:", error);
            showToast("Не удалось сохранить сообщения");
        }
    }

    // Создаём отдельную историю для каждого пользователя.
    function getConversation(username) {
        if (!Array.isArray(conversations[username])) {
            conversations[username] = [];
        }

        return conversations[username];
    }

    // Отрисовываем переписку выбранного пользователя.
    function renderConversation(username) {
        chatBox.replaceChildren();

        if (!username || !users.includes(username)) {
            const emptyChat = document.createElement("div");

            emptyChat.className = "empty-chat";
            emptyChat.textContent =
                "Выберите получателя и напишите сообщение";

            chatBox.appendChild(emptyChat);
            return;
        }

        const messages = getConversation(username);

        if (messages.length === 0) {
            const emptyChat = document.createElement("div");

            emptyChat.className = "empty-chat";
            emptyChat.textContent = "Пока нет сообщений";

            chatBox.appendChild(emptyChat);
            return;
        }

        messages.forEach(function (message) {
            const messageElement = document.createElement("div");

            messageElement.className = "message user";
            messageElement.textContent = message.text;

            chatBox.appendChild(messageElement);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Проверяем получателя.
    function validateRecipient() {
        const username = recipientInput.value.trim();

        recipientStatus.textContent = "";
        recipientStatus.className = "field-message";
        recipientValid = false;

        if (username === "") {
            renderConversation("");
            updateSendButton();
            return;
        }

        if (username.length < MIN_USERNAME_LENGTH) {
            recipientStatus.textContent = "Минимум 3 символа";
            recipientStatus.classList.add("error");
            renderConversation("");
            updateSendButton();
            return;
        }

        if (username.length > MAX_USERNAME_LENGTH) {
            recipientStatus.textContent = "Максимум 20 символов";
            recipientStatus.classList.add("error");
            renderConversation("");
            updateSendButton();
            return;
        }

        if (!/^[A-Za-z0-9_]+$/.test(username)) {
            recipientStatus.textContent =
                "Используйте только латинские буквы, цифры и _";

            recipientStatus.classList.add("error");
            renderConversation("");
            updateSendButton();
            return;
        }

        if (!users.includes(username)) {
            recipientStatus.textContent = "Пользователь не найден";
            recipientStatus.classList.add("error");
            renderConversation("");
            updateSendButton();
            return;
        }

        recipientStatus.textContent = "Пользователь найден";
        recipientStatus.classList.add("success");

        recipientValid = true;

        renderConversation(username);
        updateSendButton();
    }

    // Проверяем сообщение.
    function validateMessage() {
        const message = messageInput.value;

        messageCounter.textContent = message.length;
        messageError.textContent = "";
        messageValid = false;

        if (message.trim() === "") {
            updateSendButton();
            return;
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            messageError.textContent =
                "Сообщение не может содержать более 1000 символов";

            updateSendButton();
            return;
        }

        if (message.length >= MIN_MESSAGE_LENGTH) {
            messageValid = true;
        }

        updateSendButton();
    }

    // Кнопка доступна только при корректном получателе и сообщении.
    function updateSendButton() {
        sendButton.disabled = !(recipientValid && messageValid);
    }

    // Показываем уведомление.
    function showToast(text) {
        toast.textContent = text;
        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(function () {
            toast.classList.remove("show");
        }, 2000);
    }

    // Отправляем и сохраняем сообщение.
    function sendMessage() {
        if (sendButton.disabled) {
            return;
        }

        const message = messageInput.value;
        const recipient = recipientInput.value.trim();

        if (!users.includes(recipient)) {
            return;
        }

        const conversation = getConversation(recipient);

        conversation.push({
            text: message,
            timestamp: new Date().toISOString()
        });

        saveConversations();
        renderConversation(recipient);

        messageInput.value = "";
        messageCounter.textContent = "0";
        messageError.textContent = "";
        messageValid = false;

        updateSendButton();

        showToast("Сообщение отправлено пользователю " + recipient);
    }

    // Ввод получателя и сообщения.
    recipientInput.addEventListener("input", validateRecipient);
    messageInput.addEventListener("input", validateMessage);

    // Отправка нажатием кнопки.
    sendButton.addEventListener("click", sendMessage);

    // Enter отправляет, Shift + Enter переносит строку.
    messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    });

    // Открываем и закрываем список контактов.
    contactsButton.addEventListener("click", function () {
        contactsList.classList.toggle("show");
    });

    // Выбираем контакт и загружаем его переписку.
    contacts.forEach(function (contact) {
        contact.addEventListener("click", function () {
            recipientInput.value = contact.dataset.username;

            contactsList.classList.remove("show");

            validateRecipient();
        });
    });

    // Показываем начальное состояние чата.
    renderConversation("");
    updateSendButton();
});


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
    const contacts = Array.from(document.querySelectorAll(".contact"));
    const contactsEmpty = document.getElementById("contacts-empty");
    const activeContact = document.getElementById("active-contact");
    const activeAvatar = document.getElementById("active-avatar");
    const activeStatus = document.getElementById("active-status");

    const MAX_MESSAGE_LENGTH = 1000;
    const MIN_USERNAME_LENGTH = 3;
    const MAX_USERNAME_LENGTH = 20;
    const users = ["masha", "zahar", "egor"];

    let recipientValid = false;
    let messageValid = false;
    let requestInProgress = false;
    let currentRecipient = "";
    let toastTimeout;
    let conversationRequestId = 0;

    function renderEmptyChat(text) {
        const empty = document.createElement("div");
        empty.className = "empty-chat";
        empty.textContent = text;
        chatBox.replaceChildren(empty);
    }

    function getAvatarClass(username) {
        return "avatar-" + username;
    }

    function updateActiveContact(username) {
        const selected = users.includes(username);
        document.querySelector(".messenger-app").classList.toggle("chat-open", selected);

        activeContact.textContent = selected ? username : "Выберите диалог";
        activeStatus.textContent = selected
            ? "Личная переписка"
            : "Ваше пространство для общения";

        activeAvatar.textContent = selected ? username.charAt(0) : "?";
        activeAvatar.className = "avatar " +
            (selected ? getAvatarClass(username) : "avatar-placeholder");

        contacts.forEach(function (contact) {
            const isActive = contact.dataset.username === username;
            contact.classList.toggle("active", isActive);
            contact.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    async function loadConversation(username) {
        currentRecipient = username;
        const requestId = ++conversationRequestId;

        chatBox.replaceChildren();

        if (!users.includes(username)) {
            updateActiveContact("");
            renderEmptyChat("Выбери диалог слева, чтобы начать общение.");
            return;
        }

        updateActiveContact(username);
        renderEmptyChat("Загружаем переписку...");

        try {
            const response = await fetch(
                "/api/messages?recipient=" + encodeURIComponent(username)
            );

            if (!response.ok) {
                throw new Error("Не удалось загрузить переписку");
            }

            const data = await response.json();

            if (
                requestId !== conversationRequestId ||
                currentRecipient !== username
            ) {
                return;
            }

            renderConversation(username, data.messages);
        } catch (error) {
            console.error("Ошибка загрузки переписки:", error);

            if (requestId === conversationRequestId) {
                renderEmptyChat("Не удалось загрузить переписку. Попробуй ещё раз.");
                showToast("Ошибка соединения с сервером");
            }
        }
    }

    function renderConversation(username, messages) {
        if (currentRecipient !== username) {
            return;
        }

        chatBox.replaceChildren();

        if (!messages || messages.length === 0) {
            renderEmptyChat("Пока здесь тихо. Отправь первое сообщение.");
            return;
        }

        messages.forEach(function (message) {
    const element = document.createElement("div");
    element.className = "message user";
    element.textContent = message.text;

    if (message.createdAt) {
        const date = new Date(message.createdAt);

        if (!Number.isNaN(date.getTime())) {
            element.dataset.time = date.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit"
            });
        }
    }

    chatBox.appendChild(element);
});


        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function filterContacts(query) {
        const normalizedQuery = query.trim().toLowerCase();
        let visibleCount = 0;

        contacts.forEach(function (contact) {
            const username = contact.dataset.username;
            const matches = username.includes(normalizedQuery);

            contact.hidden = !matches;

            if (matches) {
                visibleCount += 1;
            }
        });

        contactsEmpty.hidden = visibleCount !== 0;
    }

    function validateRecipient() {
        const username = recipientInput.value.trim();

        filterContacts(username);
        recipientStatus.textContent = "";
        recipientStatus.className = "field-message";
        recipientValid = false;

        if (username === "") {
        updateSendButton();
        return;
        }

        if (username.length < MIN_USERNAME_LENGTH) {
            recipientStatus.textContent = "Минимум 3 символа";
            recipientStatus.classList.add("error");
            updateSendButton();
            return;
        }

        if (username.length > MAX_USERNAME_LENGTH) {
            recipientStatus.textContent = "Максимум 20 символов";
            recipientStatus.classList.add("error");
            updateSendButton();
            return;
        }

        if (!/^[A-Za-z0-9_]+$/.test(username)) {
            recipientStatus.textContent =
                "Используйте только латинские буквы, цифры и _";
            recipientStatus.classList.add("error");
            updateSendButton();
            return;
        }

        if (!users.includes(username)) {
            recipientStatus.textContent = "Пользователь не найден";
            recipientStatus.classList.add("error");
            updateSendButton();
            return;
        }

        recipientStatus.textContent = "Пользователь найден";
        recipientStatus.classList.add("success");
        recipientValid = true;

        if (currentRecipient !== username) {
            loadConversation(username);
        } else {
            updateActiveContact(username);
        }

        updateSendButton();
    }

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

        messageValid = true;
        updateSendButton();
    }

    function updateSendButton() {
        sendButton.disabled = !(
            recipientValid &&
            messageValid &&
            !requestInProgress
        );
    }

    function showToast(text) {
        toast.textContent = text;
        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(function () {
            toast.classList.remove("show");
        }, 2500);
    }

    async function sendMessage() {
        if (sendButton.disabled) {
            return;
        }

        const text = messageInput.value.trim();
        const recipient = recipientInput.value.trim();

        if (!users.includes(recipient) || !text) {
            return;
        }

        requestInProgress = true;
        updateSendButton();

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ recipient, text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Не удалось отправить сообщение");
            }

            messageInput.value = "";
            messageCounter.textContent = "0";
            messageError.textContent = "";
            messageValid = false;

            showToast("Сообщение отправлено пользователю " + recipient);

            if (currentRecipient === recipient) {
                await loadConversation(recipient);
            }
        } catch (error) {
            console.error("Ошибка отправки сообщения:", error);
            showToast(error.message || "Ошибка соединения с сервером");
        } finally {
            requestInProgress = false;
            updateSendButton();
        }
    }

    recipientInput.addEventListener("input", validateRecipient);
    messageInput.addEventListener("input", validateMessage);
    sendButton.addEventListener("click", sendMessage);

    const backButton = document.getElementById("back-to-chats");

    backButton.addEventListener("click", function () {
        document.querySelector(".messenger-app")
            .classList.remove("chat-open");
    });

    messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    });

    contactsButton.addEventListener("click", function () {
        recipientInput.value = "";
        recipientStatus.textContent = "";
        recipientStatus.className = "field-message";
        recipientValid = false;

        filterContacts("");
        updateSendButton();
        recipientInput.focus();
    });

    contacts.forEach(function (contact) {
        contact.addEventListener("click", function () {
            const username = contact.dataset.username;

            recipientInput.value = username;
            recipientStatus.textContent = "Пользователь найден";
            recipientStatus.className = "field-message success";
            recipientValid = true;

            filterContacts("");
            loadConversation(username);
            updateSendButton();
        });
    });

    filterContacts("");
    updateActiveContact("");
    renderEmptyChat("Выбери диалог слева, чтобы начать общение.");
    updateSendButton();
});

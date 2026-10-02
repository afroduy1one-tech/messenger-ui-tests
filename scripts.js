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

    // Существующие пользователи для тестирования
    const users = [
        "egor",
        "masha",
        "zahar"
    ];

    let recipientValid = false;
    let messageValid = false;

    // Проверка получателя
    function validateRecipient() {
        const username = recipientInput.value.trim();

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
        updateSendButton();
    }

    // Проверка сообщения
    function validateMessage() {
        const message = messageInput.value;

        messageCounter.textContent = message.length;

        messageError.textContent = "";
        messageValid = false;

        // Пустое сообщение или только пробелы
        if (message.trim() === "") {
            updateSendButton();
            return;
        }

        // Слишком длинное сообщение
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

    // Кнопка активна только при корректном получателе и сообщении
    function updateSendButton() {
        sendButton.disabled = !(recipientValid && messageValid);
    }

    // Показать уведомление
    function showToast(text) {
        toast.textContent = text;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 2000);
    }

    // Отправка сообщения
    function sendMessage() {
        if (sendButton.disabled) {
            return;
        }

        const message = messageInput.value;
        const recipient = recipientInput.value.trim();

        // Убираем надпись о пустом чате
        const emptyChat = chatBox.querySelector(".empty-chat");

        if (emptyChat) {
            emptyChat.remove();
        }

        // Создаём сообщение пользователя
        const messageElement = document.createElement("div");

        messageElement.className = "message user";
        messageElement.textContent = message;

        chatBox.appendChild(messageElement);

        // Очищаем поле
        messageInput.value = "";
        messageCounter.textContent = "0";
        messageError.textContent = "";

        messageValid = false;

        updateSendButton();

        showToast("Сообщение отправлено пользователю " + recipient);
    }

    recipientInput.addEventListener("input", validateRecipient);
    messageInput.addEventListener("input", validateMessage);
    sendButton.addEventListener("click", sendMessage);
    
    messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (!sendButton.disabled) {
            sendMessage();
        }
    }
});

    contactsButton.addEventListener("click", function () {
    contactsList.classList.toggle("show");
});

contacts.forEach(function (contact) {
    contact.addEventListener("click", function () {
        recipientInput.value = contact.dataset.username;

        contactsList.classList.remove("show");

        validateRecipient();
    });
});
});
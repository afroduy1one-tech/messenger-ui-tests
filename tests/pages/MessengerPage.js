class MessengerPage {
    constructor(page) {
        this.page = page;

        this.recipientInput = page.locator('#recipient-input');
        this.recipientStatus = page.locator('#recipient-status');

        this.contactsButton = page.locator('#contacts-button');
        this.contactsList = page.locator('#contacts-list');

        this.messageInput = page.locator('#message-input');
        this.messageCounter = page.locator('#message-counter');
        this.messageError = page.locator('#message-error');

        this.sendButton = page.locator('#send-button');
        this.chatBox = page.locator('#chat-box');
        this.toast = page.locator('#toast');
    }

    async open() {
        await this.page.goto('/');
    }

    async fillRecipient(username) {
        await this.recipientInput.fill(username);
    }

    async chooseContact(username) {
        await this.contactsButton.click();

        await this.page
            .locator(`.contact[data-username="${username}"]`)
            .click();
    }

    async fillMessage(text) {
        await this.messageInput.fill(text);
    }

    async send() {
        await this.sendButton.click();
    }

    async sendWithEnter() {
        await this.messageInput.press('Enter');
    }

    get userMessages() {
        return this.chatBox.locator('.message.user');
    }
}

module.exports = { MessengerPage };
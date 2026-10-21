const { test, expect } = require('@playwright/test');
const { MessengerPage } = require('./pages/MessengerPage');

test.describe('Отправка сообщения в мессенджере', () => {

    test.beforeEach(async ({ page }) => {
        const messenger = new MessengerPage(page);
        await messenger.open();
    });

    test('TC-01: успешная отправка сообщения', async ({ page }) => {
        const messenger = new MessengerPage(page);

        await messenger.fillRecipient('masha');
        await messenger.fillMessage('Привет!');

        await expect(messenger.sendButton).toBeEnabled();

        await messenger.send();

        await expect(messenger.userMessages.last())
            .toHaveText('Привет!');

        await expect(messenger.toast)
            .toContainText('Сообщение отправлено');
    });

    test('TC-02: отправка пустого сообщения', async ({ page }) => {
    const messenger = new MessengerPage(page);

    await messenger.fillRecipient('masha');
    await messenger.fillMessage('');

    await expect(messenger.sendButton).toBeDisabled();
    });
    
    test('TC-03: сообщение из 1 символа', async ({ page }) => {
    const messenger = new MessengerPage(page);

    await messenger.fillRecipient('masha');
    await messenger.fillMessage('П');

    await expect(messenger.sendButton).toBeEnabled();

    await messenger.send();

    await expect(messenger.userMessages.last())
        .toHaveText('П');
});


    test('TC-04: сообщение из 1000 символов', async ({ page }) => {
        const messenger = new MessengerPage(page);
        const message = 'a'.repeat(1000);

        await messenger.fillRecipient('masha');
        await messenger.fillMessage(message);

        await expect(messenger.messageCounter)
            .toHaveText('1000');

        await expect(messenger.sendButton).toBeEnabled();

        await messenger.send();

        await expect(messenger.userMessages.last())
            .toHaveText(message);
    });


    test('TC-05: сообщение из 1001 символа', async ({ page }) => {
        const messenger = new MessengerPage(page);
        const message = 'a'.repeat(1001);

        await messenger.fillRecipient('masha');
        await messenger.fillMessage(message);

        await expect(messenger.messageCounter)
            .toHaveText('1001');

        await expect(messenger.messageError)
            .toHaveText('Сообщение не может содержать более 1000 символов');

        await expect(messenger.sendButton).toBeDisabled();
    });


    test('TC-06: сообщение из пробелов', async ({ page }) => {
        const messenger = new MessengerPage(page);

        await messenger.fillRecipient('masha');
        await messenger.fillMessage('     ');

        await expect(messenger.sendButton).toBeDisabled();
    });


    test('TC-07: отправка без получателя', async ({ page }) => {
        const messenger = new MessengerPage(page);

        await messenger.fillMessage('Привет!');

        await expect(messenger.sendButton).toBeDisabled();
    });


    test('TC-08: выбор получателя из списка контактов', async ({ page }) => {
        const messenger = new MessengerPage(page);

        await messenger.chooseContact('masha');

        await expect(messenger.recipientInput)
            .toHaveValue('masha');

        await expect(messenger.recipientStatus)
            .toHaveText('Пользователь найден');

        await messenger.fillMessage('Привет!');
        await expect(messenger.sendButton).toBeEnabled();
    });


    test('TC-09: несуществующий получатель', async ({ page }) => {
        const messenger = new MessengerPage(page);

        await messenger.fillRecipient('qwerty12345');

        await expect(messenger.recipientStatus)
            .toHaveText('Пользователь не найден');

        await messenger.fillMessage('Привет!');

        await expect(messenger.sendButton).toBeDisabled();
    });


    test('TC-10: слишком короткое имя пользователя', async ({ page }) => {
        const messenger = new MessengerPage(page);

        await messenger.fillRecipient('ab');

        await expect(messenger.recipientStatus)
            .toHaveText('Минимум 3 символа');

        await messenger.fillMessage('Привет!');

        await expect(messenger.sendButton).toBeDisabled();
    });


    test('TC-11: обработка специального HTML-кода в сообщении', async ({ page }) => {
        const messenger = new MessengerPage(page);
        const message = '<script>alert(1)</script>';

        let dialogOpened = false;

        page.on('dialog', async dialog => {
            dialogOpened = true;
            await dialog.dismiss();
        });

        await messenger.fillRecipient('masha');
        await messenger.fillMessage(message);
        await messenger.send();

        await expect(messenger.userMessages.last())
            .toHaveText(message);

        expect(dialogOpened).toBe(false);
    });


    test('TC-12: отправка сообщения клавишей Enter', async ({ page }) => {
        const messenger = new MessengerPage(page);
        const message = 'Сообщение через Enter';

        await messenger.fillRecipient('masha');
        await messenger.fillMessage(message);

        await expect(messenger.sendButton).toBeEnabled();

        await messenger.sendWithEnter();

        await expect(messenger.userMessages.last())
            .toHaveText(message);
    });


});


test('сообщения сохраняются после перезагрузки', async ({ page }) => {
    const messenger = new MessengerPage(page);

    await messenger.open();
    await messenger.fillRecipient('masha');
    await messenger.fillMessage('Привет, Маша!');
    await messenger.send();

    await page.reload();

    await messenger.fillRecipient('masha');

    await expect(messenger.userMessages).toHaveText([
        'Привет, Маша!'
    ]);
});

test('у разных контактов отдельные переписки', async ({ page }) => {
    const messenger = new MessengerPage(page);

    await messenger.open();

    await messenger.fillRecipient('masha');
    await messenger.fillMessage('Сообщение для Маши');
    await messenger.send();

    await messenger.fillRecipient('egor');
    await messenger.fillMessage('Сообщение для Егора');
    await messenger.send();

    await expect(messenger.userMessages).toHaveText([
        'Сообщение для Егора'
    ]);

    await messenger.fillRecipient('masha');

    await expect(messenger.userMessages).toHaveText([
        'Сообщение для Маши'
    ]);
});

test('история восстанавливается при переключении контактов', async ({ page }) => {
    const messenger = new MessengerPage(page);

    await messenger.open();

    await messenger.fillRecipient('masha');
    await messenger.fillMessage('Первое сообщение');
    await messenger.send();

    await messenger.fillMessage('Второе сообщение');
    await messenger.send();

    await messenger.fillRecipient('zahar');

    await expect(messenger.userMessages).toHaveCount(0);

    await messenger.fillRecipient('masha');

    await expect(messenger.userMessages).toHaveText([
        'Первое сообщение',
        'Второе сообщение'
    ]);
});

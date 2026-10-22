
const { test, expect } = require('@playwright/test');

test.describe('API мессенджера', () => {
    test('API доступно', async ({ request }) => {
        const response = await request.get('/api/health');

        expect(response.status()).toBe(200);
        await expect(response).toBeOK();
        expect(await response.json()).toEqual({ status: 'ok' });
    });

    test('возвращается список пользователей', async ({ request }) => {
        const response = await request.get('/api/users');

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({
            users: ['masha', 'zahar', 'egor']
        });
    });

    test('возвращается история существующего пользователя', async ({ request }) => {
        const response = await request.get('/api/messages?recipient=masha');

        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data.messages)).toBe(true);
    });

    test('отклоняется неизвестный получатель', async ({ request }) => {
        const response = await request.get(
            '/api/messages?recipient=unknown'
        );

        expect(response.status()).toBe(400);
        expect(await response.json()).toHaveProperty('error');
    });

    test('отправленное сообщение сохраняется в истории', async ({ request }) => {
        const text = `API-тест ${Date.now()}`;

        const postResponse = await request.post('/api/messages', {
            data: {
                recipient: 'masha',
                text
            }
        });

        expect(postResponse.status()).toBe(201);

        const postData = await postResponse.json();
        expect(postData.message.text).toBe(text);
        expect(postData.message.recipient).toBe('masha');
        expect(postData.message.id).toBeTruthy();
        expect(postData.message.createdAt).toBeTruthy();

        const getResponse = await request.get(
            '/api/messages?recipient=masha'
        );

        expect(getResponse.status()).toBe(200);

        const history = await getResponse.json();
        expect(history.messages.some(message => message.id === postData.message.id))
            .toBe(true);
    });

    test('отклоняется пустое сообщение', async ({ request }) => {
        const response = await request.post('/api/messages', {
            data: {
                recipient: 'masha',
                text: '   '
            }
        });

        expect(response.status()).toBe(400);
        expect(await response.json()).toHaveProperty('error');
    });

    test('отклоняется сообщение длиннее 1000 символов', async ({ request }) => {
        const response = await request.post('/api/messages', {
            data: {
                recipient: 'masha',
                text: 'a'.repeat(1001)
            }
        });

        expect(response.status()).toBe(400);
        expect(await response.json()).toHaveProperty('error');
    });

    test('отклоняется неизвестный получатель при отправке', async ({ request }) => {
        const response = await request.post('/api/messages', {
            data: {
                recipient: 'unknown',
                text: 'Проверка'
            }
        });

        expect(response.status()).toBe(400);
        expect(await response.json()).toHaveProperty('error');
    });

    test('отклоняется некорректный JSON', async ({ request }) => {
        const response = await request.post('/api/messages', {
            data: '{"recipient":',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        expect(response.status()).toBe(400);
        expect(await response.json()).toHaveProperty('error');
    });
});

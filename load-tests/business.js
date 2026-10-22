
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8001';

export const options = {
    stages: [
        { duration: '30s', target: 2 },
        { duration: '30s', target: 5 },
        { duration: '3m', target: 5 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<1000'],
        checks: ['rate>0.99'],
    },
};

const recipients = ['masha', 'zahar', 'egor'];

export default function () {
    const recipient = recipients[(__VU - 1) % recipients.length];

    const historyResponse = http.get(
        `${BASE_URL}/api/messages?recipient=${recipient}`
    );

    check(historyResponse, {
        'history: статус 200': (r) => r.status === 200,
        'history: корректный массив сообщений': (r) => {
            try {
                return Array.isArray(JSON.parse(r.body).messages);
            } catch {
                return false;
            }
        },
    });

    const messageText = `k6 VU-${__VU} iteration-${__ITER} time-${Date.now()}`;

    const sendResponse = http.post(
        `${BASE_URL}/api/messages`,
        JSON.stringify({
            recipient,
            text: messageText,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    check(sendResponse, {
        'send: статус 201': (r) => r.status === 201,
        'send: возвращён правильный текст': (r) => {
            try {
                return JSON.parse(r.body).message.text === messageText;
            } catch {
                return false;
            }
        },
    });

    sleep(1);
}

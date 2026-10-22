
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

export default function () {
    const health = http.get(`${BASE_URL}/api/health`);
    check(health, {
        'health: статус 200': (r) => r.status === 200,
        'health: статус ok': (r) => {
            try {
                return JSON.parse(r.body).status === 'ok';
            } catch {
                return false;
            }
        },
    });

    const users = http.get(`${BASE_URL}/api/users`);
    check(users, {
        'users: статус 200': (r) => r.status === 200,
        'users: список непустой': (r) => {
            try {
                const data = JSON.parse(r.body);
                return Array.isArray(data.users) && data.users.length > 0;
            } catch {
                return false;
            }
        },
    });

    const history = http.get(
        `${BASE_URL}/api/messages?recipient=masha`
    );
    check(history, {
        'history: статус 200': (r) => r.status === 200,
        'history: есть массив сообщений': (r) => {
            try {
                return Array.isArray(JSON.parse(r.body).messages);
            } catch {
                return false;
            }
        },
    });

    sleep(1);
}

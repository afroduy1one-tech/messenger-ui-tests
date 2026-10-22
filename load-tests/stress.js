
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8001';

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '30s', target: 10 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 25 },
        { duration: '1m', target: 25 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<2000'],
        checks: ['rate>0.95'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/api/health`);

    check(response, {
        'health: статус 200': (r) => r.status === 200,
        'health: статус ok': (r) => {
            try {
                return JSON.parse(r.body).status === 'ok';
            } catch {
                return false;
            }
        },
    });

    sleep(0.5);
}

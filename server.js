
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '127.0.0.1';

const USERS = ['masha', 'zahar', 'egor'];
const DATA_FILE = process.env.MESSAGES_FILE ||
    path.join(__dirname, 'messages.json');

function loadConversations() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    return new Map(
      USERS.map(user => [
        user,
        Array.isArray(data[user]) ? data[user] : []
      ])
    );
  } catch {
    return new Map(USERS.map(user => [user, []]));
  }
}

const conversations = loadConversations();

function saveConversations() {
  const data = Object.fromEntries(conversations);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const PUBLIC_FILES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/styles.css': 'styles.css',
  '/scripts.js': 'scripts.js'
};

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;

    req.on('data', chunk => {
      body += chunk;

      if (Buffer.byteLength(body) > 10_000) {
        tooLarge = true;
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (tooLarge) return;

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (pathname === '/api/users' && req.method === 'GET') {
    return sendJson(res, 200, { users: USERS });
  }

  if (pathname === '/api/messages' && req.method === 'GET') {
    const recipient = url.searchParams.get('recipient');

    if (!USERS.includes(recipient)) {
      return sendJson(res, 400, { error: 'Некорректный получатель' });
    }

    return sendJson(res, 200, {
      messages: conversations.get(recipient)
    });
  }

  if (pathname === '/api/messages' && req.method === 'POST') {
    let body;

    try {
      body = await readBody(req);
    } catch (error) {
      const status = error.message === 'BODY_TOO_LARGE' ? 413 : 400;
      return sendJson(res, status, {
        error: status === 413
          ? 'Слишком большой запрос'
          : 'Некорректный JSON'
      });
    }

    const recipient = body?.recipient;
    const messageText = typeof body?.text === 'string'
      ? body.text.trim()
      : '';

    if (!USERS.includes(recipient)) {
      return sendJson(res, 400, { error: 'Некорректный получатель' });
    }

    if (!messageText) {
      return sendJson(res, 400, { error: 'Сообщение не может быть пустым' });
    }

    if (messageText.length > 1000) {
      return sendJson(res, 400, { error: 'Максимум 1000 символов' });
    }

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      recipient,
      text: messageText,
      createdAt: new Date().toISOString()
    };

    conversations.get(recipient).push(message);

    try {
    saveConversations();
    } catch (error) {
    conversations.get(recipient).pop();
    console.error('Ошибка сохранения сообщений:', error);
    return sendJson(res, 500, {
        error: 'Не удалось сохранить сообщение'
    });
    }

    return sendJson(res, 201, { message });

  }

  if (pathname.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'API-маршрут не найден' });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Метод не поддерживается' });
  }

  const file = PUBLIC_FILES[pathname];

  if (!file) {
    return sendJson(res, 404, { error: 'Страница не найдена' });
  }

  const filePath = path.join(__dirname, file);
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8'
  };

  fs.readFile(filePath, (error, content) => {
    if (error) {
      return sendJson(res, 500, { error: 'Ошибка чтения файла' });
    }

    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)]
    });

    res.end(req.method === 'HEAD' ? undefined : content);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Messenger server: http://${HOST}:${PORT}`);
});

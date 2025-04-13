const os = require('os');
const http = require('http');
const https = require('https');
const { Buffer } = require('buffer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const { WebSocket, createWebSocketStream } = require('ws');
const logcb = (...args) => console.log.bind(this, ...args);
const errcb = (...args) => console.error.bind(this, ...args);
const presetKey = process.env.KEY || 'lVpEHvYqdvqBbPJTjzSAyU8DpoAQcc3E'; //32 bytes, 得配置
const DOMAIN = process.env.DOMAIN || ''; //得配置上
const port = process.env.PORT || 4128;
const 更新时间 = 3;
const 有效时间 = 7;

let UUID = 生成随机UUID();
let uuid = UUID.replace(/-/g, "");
let 随机Path = 生成随机Path();
let 你好啊;
let 上次的sub = null;

function 生成随机UUID() {
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // 设置版本 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // 设置变体
  const hex = bytes.toString('hex');
  id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return id;
}

function fetchPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://ip.eooce.com', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const ip = response.ip;
          console.error(ip);
          if (!ip || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
            throw new Error('Invalid IP address received');
          }
          const logMessage = `${new Date().toISOString()} - Public IP: ${ip}\n`;
          console.error(logMessage);
          resolve(ip);
        } catch (err) {
          const errorMessage = `${new Date().toISOString()} - Failed to fetch public IP: ${err.message}\n`;
          console.error(errorMessage);
          reject(err);
        }
      });
    }).on('error', err => {
      const errorMessage = `${new Date().toISOString()} - Failed to fetch public IP: ${err.message}\n`;
      console.error(errorMessage);
      reject(err);
    });
  });
}

function 生成随机Path() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '/';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function 加密一下啊(data) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(presetKey, 'utf8').slice(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return Buffer.concat([iv, Buffer.from(encrypted, 'base64')]).toString('base64');
}

function 启动服务(httpServer, randPath) {
  const wss = new WebSocket.Server({ server: httpServer, path: randPath });
  wss.on('connection', ws => {
    ws.on('message', msg => {
      if (msg.length < 18) {
        return;
      }
      try {
        const [VERSION] = msg;
        const id = msg.slice(1, 17);
        if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) {
          return;
        }
        let i = msg.slice(17, 18).readUInt8() + 19;
        const port = msg.slice(i, i += 2).readUInt16BE(0);
        const ATYP = msg.slice(i, i += 1).readUInt8();
        const host = ATYP === 1 ? msg.slice(i, i += 4).join('.') :
          (ATYP === 2 ? new TextDecoder().decode(msg.slice(i + 1, i += 1 + msg.slice(i, i + 1).readUInt8())) :
            (ATYP === 3 ? msg.slice(i, i += 16).reduce((s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));
        console.log('连接到:', host, port);
        ws.send(new Uint8Array([VERSION, 0]));
        const duplex = createWebSocketStream(ws);
        net.connect({ host, port }, function () {
          this.write(msg.slice(i));
          duplex.on('error', err => console.error("E1:", err.message)).pipe(this).on('error', err => console.error("E2:", err.message)).pipe(duplex);
        }).on('error', err => console.error("连接错误:", err.message));
      } catch (err) {
        console.error("处理消息时出错:", err.message);
      }
    }).on('error', err => console.error("WebSocket 错误:", err.message));
  });
  return wss;
}

async function weeklyTask() {
  console.log(`每周任务执行于: ${new Date().toISOString()}`);

  try {
    await fetchPublicIP();
  } catch (err) {
  }
  
  newID = 生成随机UUID();
  newPath = 生成随机Path();
  
  if (你好啊) {
    你好啊.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1001, 'Server restarting');
      }
    });
    你好啊.close(() => {
      console.log('WebSocket 服务器已关闭');
      UUID = newID;
      uuid = newID.replace(/-/g, "");
      你好啊 = 启动服务(httpServer, newPath);
      随机Path = newPath;
      上次的sub = null;
    });
  } else {
    UUID = newID;
    uuid = newID.replace(/-/g, "");
    你好啊 = 启动服务(httpServer, newPath);
    随机Path = newPath;
    上次的sub = null;
  }

  // 记录任务日志
  fs.appendFileSync(
    path.join(__dirname, 'weekly_task.log'),
    `任务执行于: ${new Date().toISOString()} - 服务器重启\n`,
    'utf8'
  );
}

function scheduleWeeklyTask() {
  const now = new Date();
  const nextMonday = new Date(now);
  console.log(`每周任务在 ${now.toISOString()} 开始执行`);
  
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0, 3, 0, 0); // 设置为凌晨 03:00

  const timeUntilNextMonday = nextMonday - now;

  setTimeout(async () => {
    await weeklyTask();
    setInterval(async () => await weeklyTask(), 7 * 24 * 60 * 60 * 1000);
  }, timeUntilNextMonday);

  console.log(`下次每周任务将在 ${nextMonday.toISOString()} 执行`);
}

const httpServer = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, '.', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found\n');
        //console.error('读取 index.html 失败:', err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/getinfo') {
    if (上次的sub) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(上次的sub + '\n');
    } else {
      const 啥写的这是啥啊 = atob('ZG14bGMzTT0=');
      const 头领 = atob(啥写的这是啥啊)
      const data = `${头领}://${UUID}@${DOMAIN}:443?encryption=none&security=tls&sni=${DOMAIN}&type=ws&host=${DOMAIN}&path=${随机Path}#Vietnam_Posts_And_Telecommunications_Group`;
      try {
        上次的sub = 加密一下啊(data);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(上次的sub + '\n');
      } catch (err) {
        console.error('加密失败:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Encryption Error\n');
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

httpServer.listen(port, () => {
  fetchPublicIP().catch(() => {});
  console.log(`HTTP Server is running on port ${port}`);
});

你好啊 = 启动服务(httpServer, 随机Path);
scheduleWeeklyTask();

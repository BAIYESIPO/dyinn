const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// 管理员数据文件路径
const ADMIN_FILE = path.join(__dirname, '../../data/admin.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 确保data目录存在
const dataDir = path.dirname(ADMIN_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 确保admin.json文件存在
if (!fs.existsSync(ADMIN_FILE)) {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify({ admin: null }), 'utf8');
}

class Admin {
    constructor() {
        this.loadAdmin();
    }

    // 加载管理员数据
    loadAdmin() {
        try {
            const data = fs.readFileSync(ADMIN_FILE, 'utf8');
            this.admin = JSON.parse(data).admin;
        } catch (error) {
            console.error('加载管理员数据失败:', error);
            this.admin = null;
        }
    }

    // 保存管理员数据
    saveAdmin() {
        try {
            fs.writeFileSync(ADMIN_FILE, JSON.stringify({ admin: this.admin }), 'utf8');
        } catch (error) {
            console.error('保存管理员数据失败:', error);
            throw error;
        }
    }

    // 检查是否已有管理员
    hasAdmin() {
        return !!this.admin;
    }

    // 注册管理员
    register(username, password) {
        if (this.hasAdmin()) {
            throw new Error('已存在管理员账号');
        }

        // 生成盐值
        const salt = crypto.randomBytes(16).toString('hex');
        // 使用盐值加密密码
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

        this.admin = {
            username,
            salt,
            hash
        };

        this.saveAdmin();
        return this.generateToken(username);
    }

    // 验证密码
    verifyPassword(password, salt, hash) {
        const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return testHash === hash;
    }

    // 登录验证
    login(username, password) {
        if (!this.admin || username !== this.admin.username) {
            throw new Error('用户名或密码错误');
        }

        if (!this.verifyPassword(password, this.admin.salt, this.admin.hash)) {
            throw new Error('用户名或密码错误');
        }

        return this.generateToken(username);
    }

    // 生成JWT token
    generateToken(username) {
        return jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    }

    // 验证JWT token
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return {
                success: true,
                username: decoded.username
            };
        } catch (error) {
            return {
                success: false,
                error: 'Invalid token'
            };
        }
    }
}

module.exports = new Admin(); 
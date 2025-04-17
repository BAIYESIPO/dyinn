const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const ADMIN_FILE = path.join(__dirname, '../data/admin.json');

// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 生成盐值
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

// 使用盐值哈希密码
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// 提示用户输入
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function main() {
    try {
        console.log('创建管理员账户\n');

        // 获取用户输入
        const username = await question('请输入管理员用户名: ');
        const password = await question('请输入管理员密码: ');

        // 生成盐值和密码哈希
        const salt = generateSalt();
        const hash = hashPassword(password, salt);

        // 创建管理员数据
        const adminData = {
            admin: {
                username,
                salt,
                hash
            }
        };

        // 确保data目录存在
        const dataDir = path.dirname(ADMIN_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));

        console.log('\n管理员账户创建成功！');
        console.log('请妥善保管账户信息，不要将admin.json文件提交到版本控制系统。');

    } catch (error) {
        console.error('创建管理员账户失败:', error);
    } finally {
        rl.close();
    }
}

main(); 
// 加载环境变量
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const keyManager = require('./src/utils/keyManager');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 显示菜单
function showMenu() {
  console.log('\n===== 无效Cookie管理工具 =====');
  console.log('1. 查看所有无效Cookie');
  console.log('2. 添加无效Cookie');
  console.log('3. 删除特定无效Cookie');
  console.log('4. 清空所有无效Cookie');
  console.log('5. 从API Keys中移除所有无效Cookie');
  console.log('6. 退出');
  console.log('============================');
  
  rl.question('请选择操作 (1-6): ', (answer) => {
    switch(answer) {
      case '1':
        listInvalidCookies();
        break;
      case '2':
        addInvalidCookie();
        break;
      case '3':
        removeInvalidCookie();
        break;
      case '4':
        clearAllInvalidCookies();
        break;
      case '5':
        removeInvalidCookiesFromApiKeys();
        break;
      case '6':
        console.log('退出程序');
        rl.close();
        break;
      default:
        console.log('无效的选择，请重新输入');
        showMenu();
        break;
    }
  });
}

// 查看所有无效Cookie
function listInvalidCookies() {
  const invalidCookies = Array.from(keyManager.getInvalidCookies());
  
  console.log('\n===== 所有无效Cookie =====');
  if (invalidCookies.length === 0) {
    console.log('没有无效Cookie');
  } else {
    invalidCookies.forEach((cookie, index) => {
      console.log(`${index + 1}. ${cookie}`);
    });
  }
  
  showMenu();
}

// 添加无效Cookie
function addInvalidCookie() {
  rl.question('\n请输入要添加的无效Cookie: ', (cookie) => {
    if (!cookie.trim()) {
      console.log('Cookie不能为空');
      showMenu();
      return;
    }
    
    // 将cookie添加到无效集合
    const invalidCookies = new Set(keyManager.getInvalidCookies());
    invalidCookies.add(cookie.trim());
    
    // 保存到文件
    const INVALID_COOKIES_FILE = path.join(__dirname, 'data/invalid_cookies.json');
    try {
      // 确保目录存在
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(INVALID_COOKIES_FILE, JSON.stringify(Array.from(invalidCookies), null, 2), 'utf8');
      console.log('无效Cookie添加成功');
      
      // 重新加载无效cookie
      keyManager.loadInvalidCookiesFromFile();
    } catch (err) {
      console.error('保存无效Cookie失败:', err);
    }
    
    showMenu();
  });
}

// 删除特定无效Cookie
function removeInvalidCookie() {
  const invalidCookies = Array.from(keyManager.getInvalidCookies());
  
  if (invalidCookies.length === 0) {
    console.log('\n没有无效Cookie可删除');
    showMenu();
    return;
  }
  
  console.log('\n===== 所有无效Cookie =====');
  invalidCookies.forEach((cookie, index) => {
    console.log(`${index + 1}. ${cookie}`);
  });
  
  rl.question('\n请输入要删除的Cookie编号 (1-' + invalidCookies.length + '): ', (answer) => {
    const index = parseInt(answer) - 1;
    
    if (isNaN(index) || index < 0 || index >= invalidCookies.length) {
      console.log('无效的编号');
      showMenu();
      return;
    }
    
    const cookieToRemove = invalidCookies[index];
    const result = keyManager.clearInvalidCookie(cookieToRemove);
    
    if (result) {
      console.log(`成功删除无效Cookie: ${cookieToRemove}`);
    } else {
      console.log('删除失败');
    }
    
    showMenu();
  });
}

// 清空所有无效Cookie
function clearAllInvalidCookies() {
  rl.question('\n确定要清空所有无效Cookie吗? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      keyManager.clearAllInvalidCookies();
      console.log('所有无效Cookie已清空');
    } else {
      console.log('操作已取消');
    }
    
    showMenu();
  });
}

// 从API Keys中移除所有无效Cookie
function removeInvalidCookiesFromApiKeys() {
  // 重新初始化API Keys，这会自动移除无效cookie
  keyManager.initializeApiKeys();
  console.log('已从API Keys中移除所有无效Cookie');
  
  showMenu();
}

// 启动程序
console.log('正在加载无效Cookie...');
keyManager.loadInvalidCookiesFromFile();
showMenu(); 
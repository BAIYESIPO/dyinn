#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// 创建交互式命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 加载环境变量
const ENV_FILE_PATH = path.join(process.cwd(), '.env');
let envContent = '';
let emailConfigs = [];

// 应用密码说明
function printAppPasswordInstructions() {
  console.log('\n===== 如何创建谷歌应用密码 =====');
  console.log('1. 访问 https://myaccount.google.com/security');
  console.log('2. 在"登录Google"部分，点击"两步验证"');
  console.log('   (如果未启用两步验证，需要先启用)');
  console.log('3. 在页面底部找到"应用密码"，点击进入');
  console.log('4. 在"选择应用"下拉菜单中选择"其他(自定义名称)"');
  console.log('5. 输入一个名称，例如"Cursor注册"');
  console.log('6. 点击"生成"');
  console.log('7. 复制生成的16位应用密码（格式如：xxxx xxxx xxxx xxxx）');
  console.log('注意: 应用密码只会显示一次，请务必保存好\n');
}

// 加载当前环境变量和邮箱配置
function loadEnvironment() {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      console.error('❌ .env文件不存在，请先运行setup.js进行初始化配置');
      process.exit(1);
    }

    // 读取原始.env文件内容
    envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    
    // 解析环境变量
    dotenv.config();

    // 尝试解析当前的邮箱配置
    try {
      const configStr = process.env.REGISTER_EMAIL_CONFIGS;
      if (configStr) {
        emailConfigs = JSON.parse(configStr);
        if (!Array.isArray(emailConfigs)) {
          emailConfigs = [];
        }
      }
    } catch (parseErr) {
      console.warn('⚠️ 解析当前邮箱配置出错，将使用空配置');
      emailConfigs = [];
    }

    return true;
  } catch (error) {
    console.error(`❌ 加载环境变量失败: ${error.message}`);
    return false;
  }
}

// 保存更新后的邮箱配置到.env文件
function saveEmailConfigs() {
  try {
    // 将邮箱配置格式化为JSON字符串
    const configStr = JSON.stringify(emailConfigs);
    
    // 替换.env文件中的配置
    let newEnvContent = '';
    
    if (envContent.includes('REGISTER_EMAIL_CONFIGS=')) {
      // 使用正则表达式替换REGISTER_EMAIL_CONFIGS行
      newEnvContent = envContent.replace(
        /REGISTER_EMAIL_CONFIGS=.*/,
        `REGISTER_EMAIL_CONFIGS=${configStr}`
      );
    } else {
      // 如果不存在该配置行，添加到文件末尾
      newEnvContent = `${envContent}\nREGISTER_EMAIL_CONFIGS=${configStr}`;
    }
    
    // 同时确保USE_CONFIG_FILE设置为false
    if (newEnvContent.includes('REGISTER_USE_CONFIG_FILE=')) {
      newEnvContent = newEnvContent.replace(
        /REGISTER_USE_CONFIG_FILE=.*/,
        'REGISTER_USE_CONFIG_FILE=false'
      );
    } else {
      newEnvContent = `${newEnvContent}\nREGISTER_USE_CONFIG_FILE=false`;
    }
    
    // 确保EMAIL_SERVER设置为IMAP
    if (newEnvContent.includes('REGISTER_EMAIL_SERVER=')) {
      newEnvContent = newEnvContent.replace(
        /REGISTER_EMAIL_SERVER=.*/,
        'REGISTER_EMAIL_SERVER=IMAP'
      );
    } else {
      newEnvContent = `${newEnvContent}\nREGISTER_EMAIL_SERVER=IMAP`;
    }
    
    // 写入更新后的内容
    fs.writeFileSync(ENV_FILE_PATH, newEnvContent, 'utf8');
    
    console.log('✅ 邮箱配置已成功保存到.env文件');
    return true;
  } catch (error) {
    console.error(`❌ 保存邮箱配置失败: ${error.message}`);
    return false;
  }
}

// 显示所有已配置的邮箱
function displayEmails() {
  console.log('\n===== 当前已配置的邮箱 =====');
  
  if (emailConfigs.length === 0) {
    console.log('暂无已配置的邮箱');
    return;
  }
  
  emailConfigs.forEach((config, index) => {
    console.log(`[${index + 1}] ${config.email}`);
    console.log(`   IMAP服务器: ${config.imap_server}`);
    console.log(`   IMAP端口: ${config.imap_port}`);
    console.log(`   用户名: ${config.username}`);
    console.log(`   应用密码: ${config.password}`);
    console.log('');
  });
}

// 添加新邮箱
function addEmail() {
  console.log('\n===== 添加新邮箱 =====');
  printAppPasswordInstructions();
  
  rl.question('请输入Gmail地址: ', (email) => {
    rl.question('请输入Gmail的应用密码 (不是邮箱密码): ', (password) => {
      // 创建新配置
      const newConfig = {
        email: email,
        imap_server: 'imap.gmail.com',
        imap_port: 993,
        username: email,
        password: password
      };
      
      // 添加到配置列表
      emailConfigs.push(newConfig);
      
      console.log(`\n✅ 已添加邮箱: ${email}`);
      
      // 保存到.env文件
      if (saveEmailConfigs()) {
        showMainMenu();
      }
    });
  });
}

// 修改邮箱
function modifyEmail() {
  if (emailConfigs.length === 0) {
    console.log('\n❌ 当前没有可修改的邮箱。请先添加邮箱。');
    showMainMenu();
    return;
  }
  
  console.log('\n===== 修改邮箱 =====');
  displayEmails();
  
  rl.question('请输入要修改的邮箱序号 (1-' + emailConfigs.length + '): ', (indexStr) => {
    const index = parseInt(indexStr) - 1;
    
    if (isNaN(index) || index < 0 || index >= emailConfigs.length) {
      console.log('\n❌ 无效的序号。请重新选择。');
      modifyEmail();
      return;
    }
    
    const currentConfig = emailConfigs[index];
    
    console.log(`\n正在修改邮箱: ${currentConfig.email}`);
    
    rl.question(`新的Gmail地址 (当前: ${currentConfig.email}，直接回车保持不变): `, (email) => {
      const newEmail = email.trim() === '' ? currentConfig.email : email;
      
      rl.question('新的应用密码 (直接回车保持不变): ', (password) => {
        const newPassword = password.trim() === '' ? currentConfig.password : password;
        
        // 更新配置
        emailConfigs[index] = {
          email: newEmail,
          imap_server: 'imap.gmail.com',
          imap_port: 993,
          username: newEmail,
          password: newPassword
        };
        
        console.log(`\n✅ 已修改邮箱配置: ${newEmail}`);
        
        // 保存到.env文件
        if (saveEmailConfigs()) {
          showMainMenu();
        }
      });
    });
  });
}

// 删除邮箱
function deleteEmail() {
  if (emailConfigs.length === 0) {
    console.log('\n❌ 当前没有可删除的邮箱。');
    showMainMenu();
    return;
  }
  
  console.log('\n===== 删除邮箱 =====');
  displayEmails();
  
  rl.question('请输入要删除的邮箱序号 (1-' + emailConfigs.length + '): ', (indexStr) => {
    const index = parseInt(indexStr) - 1;
    
    if (isNaN(index) || index < 0 || index >= emailConfigs.length) {
      console.log('\n❌ 无效的序号。请重新选择。');
      deleteEmail();
      return;
    }
    
    const emailToDelete = emailConfigs[index].email;
    
    rl.question(`确认删除邮箱 "${emailToDelete}"? (y/n): `, (answer) => {
      if (answer.toLowerCase() === 'y') {
        // 删除邮箱
        emailConfigs.splice(index, 1);
        
        console.log(`\n✅ 已删除邮箱: ${emailToDelete}`);
        
        // 保存到.env文件
        if (saveEmailConfigs()) {
          showMainMenu();
        }
      } else {
        console.log('\n操作已取消');
        showMainMenu();
      }
    });
  });
}

// 显示主菜单
function showMainMenu() {
  console.log('\n===== 邮箱配置管理 =====');
  console.log('1. 查看所有邮箱');
  console.log('2. 添加新邮箱');
  console.log('3. 修改邮箱');
  console.log('4. 删除邮箱');
  console.log('0. 退出');
  
  rl.question('请选择操作 (0-4): ', (choice) => {
    switch (choice) {
      case '1':
        displayEmails();
        showMainMenu();
        break;
      case '2':
        addEmail();
        break;
      case '3':
        modifyEmail();
        break;
      case '4':
        deleteEmail();
        break;
      case '0':
        console.log('\n✅ 配置完成，退出程序');
        rl.close();
        break;
      default:
        console.log('\n❌ 无效的选择，请重新输入');
        showMainMenu();
        break;
    }
  });
}

// 主函数
async function main() {
  console.log('===== Cursor-To-OpenAI 邮箱配置管理 =====');
  
  // 加载当前配置
  if (loadEnvironment()) {
    // 显示主菜单
    showMainMenu();
  } else {
    console.error('程序退出');
    rl.close();
  }
}

// 运行主函数
main(); 
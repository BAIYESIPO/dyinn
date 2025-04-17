const fs = require('fs');
const path = require('path');

/**
 * 检查 .env 文件是否存在
 * @returns {boolean} 文件是否存在
 */
function checkEnvFileExists() {
  const envPath = path.resolve(process.cwd(), '.env');
  return fs.existsSync(envPath);
}

/**
 * 检查必要的环境变量是否已设置
 * @returns {Object} 检查结果，包含是否通过和缺失的变量列表
 */
function checkRequiredEnvVars() {
  // 定义必要的环境变量列表
  const requiredVars = [
    'API_KEYS', // API Keys 配置
  ];

  // 如果启用了自动刷新，则需要检查相关配置
  if (process.env.ENABLE_AUTO_REFRESH === 'true') {
    requiredVars.push(
      'GITHUB_TOKEN',
      'GITHUB_OWNER',
      'GITHUB_REPO',
      'GITHUB_WORKFLOW_ID',
      'TRIGGER_WORKFLOW'
    );
  }

  // 检查每个必要的环境变量
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  return {
    passed: missingVars.length === 0,
    missingVars
  };
}

/**
 * 执行环境检查，如果不符合要求则退出程序
 */
function enforceEnvCheck() {
  console.log('正在检查环境配置...');
  
  // 检查 .env 文件是否存在
  const envFileExists = checkEnvFileExists();
  if (!envFileExists) {
    console.error('\n错误: 未找到 .env 文件!');
    console.error('请根据 .env.example 创建 .env 文件并配置必要的环境变量。');
    console.error('执行以下命令复制示例文件: cp .env.example .env,或执行npm run setup\n');
    process.exit(1); // 退出程序，状态码 1 表示错误
  }
  
  // 检查必要的环境变量
  const { passed, missingVars } = checkRequiredEnvVars();
  if (!passed) {
    console.error('\n错误: 以下必要的环境变量未在 .env 文件中设置:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\n请在 .env 文件中配置这些变量后重新启动程序。\n');
    process.exit(1); // 退出程序，状态码 1 表示错误
  }
  
  console.log('环境检查通过，继续启动程序...');
}

module.exports = {
  checkEnvFileExists,
  checkRequiredEnvVars,
  enforceEnvCheck
}; 
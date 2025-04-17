// 加载环境变量
require('dotenv').config();

// 环境检查
const envChecker = require('./utils/envChecker');
console.log('启动前检查环境配置...');
envChecker.enforceEnvCheck();

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');
const app = express();

const config = require('./config/config');
const routes = require('./routes');
const keyManager = require('./utils/keyManager');
const cookieRefresher = require('./utils/cookieRefresher');
const authMiddleware = require('./middleware/auth');

// 初始化API Keys
console.log('初始化API Keys...');
keyManager.initializeApiKeys();

// 输出最终的API Keys配置
console.log('最终API Keys配置:', JSON.stringify(keyManager.getAllApiKeys().reduce((obj, key) => {
  obj[key] = keyManager.getAllCookiesForApiKey(key);
  return obj;
}, {}), null, 2));

// 添加CORS支持
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(morgan(process.env.MORGAN_FORMAT ?? 'tiny'));

// 添加静态文件支持
app.use(express.static(path.join(__dirname, 'public')));

// 添加根路由，重定向到登录页面
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// 添加认证中间件
app.use(authMiddleware);

app.use("/", routes)

// 设置定时任务，自动刷新 Cookie
if (config.refresh.enabled) {
    const cronSchedule = config.refresh.cron;
    const minCookieCount = config.refresh.minCookieCount;
    
    console.log(`启用自动刷新 Cookie，定时规则: ${cronSchedule}，最小 Cookie 数量: ${minCookieCount}`);
    
    cron.schedule(cronSchedule, async () => {
        console.log('===== 自动刷新 Cookie 开始 =====');
        console.log(`最小 Cookie 数量: ${minCookieCount}`);
        
        try {
            // 获取所有 API Key
            const apiKeys = keyManager.getAllApiKeys();
            
            if (apiKeys.length === 0) {
                console.log('警告: 系统中没有找到任何 API Key');
                
                // 检查环境变量中是否有 API Keys
                const envApiKeys = Object.keys(config.apiKeys);
                if (envApiKeys.length > 0) {
                    console.log(`检测到环境变量中有 ${envApiKeys.length} 个 API Key，但尚未加载到系统中`);
                    console.log('正在重新初始化 API Keys...');
                    
                    // 重新获取 API Keys
                    const refreshedApiKeys = keyManager.getAllApiKeys();
                    if (refreshedApiKeys.length > 0) {
                        console.log(`成功加载 ${refreshedApiKeys.length} 个 API Key，继续刷新流程`);
                        // 继续执行后续刷新逻辑
                    } else {
                        console.log('初始化后仍未找到 API Key，请检查配置');
                        console.log('===== 自动刷新 Cookie 结束 =====');
                        return;
                    }
                } else {
                    console.log('环境变量中也没有配置 API Key，请先添加 API Key');
                    console.log('===== 自动刷新 Cookie 结束 =====');
                    return;
                }
            }
            
            // 重新获取最新的 API Keys（可能已经通过上面的初始化更新了）
            const updatedApiKeys = keyManager.getAllApiKeys();
            console.log(`系统中共有 ${updatedApiKeys.length} 个 API Key`);
            
            // 按 Cookie 数量排序，优先处理 Cookie 数量少的 API Key
            const sortedKeys = updatedApiKeys.sort((a, b) => {
                const aCount = keyManager.getAllCookiesForApiKey(a).length;
                const bCount = keyManager.getAllCookiesForApiKey(b).length;
                return aCount - bCount; // 升序排列，Cookie 数量少的排在前面
            });
            
            // 检查每个 API Key 是否需要刷新
            let refreshedCount = 0;
            let needRefreshCount = 0;
            
            for (const apiKey of sortedKeys) {
                const cookies = keyManager.getAllCookiesForApiKey(apiKey);
                console.log(`API Key: ${apiKey}, Cookie 数量: ${cookies.length}`);
                
                if (cookies.length < minCookieCount) {
                    needRefreshCount++;
                    console.log(`API Key ${apiKey} 的 Cookie 数量不足，需要刷新`);
                    
                    // 执行刷新
                    console.log(`开始自动刷新 Cookie，目标 API Key: ${apiKey}，最小 Cookie 数量: ${minCookieCount}`);
                    const result = await cookieRefresher.autoRefreshCookies(apiKey, minCookieCount);
                    
                    if (result.success) {
                        refreshedCount++;
                        console.log(`刷新结果: ${result.message}`);
                    } else {
                        console.error(`刷新失败: ${result.message}`);
                    }
                } else {
                    console.log(`API Key ${apiKey} 的 Cookie 数量足够，不需要刷新`);
                }
            }
            
            console.log('===== 自动刷新 Cookie 完成 =====');
            console.log(`共有 ${needRefreshCount} 个 API Key 需要刷新，成功刷新 ${refreshedCount} 个`);
        } catch (error) {
            console.error('自动刷新 Cookie 任务执行失败:', error);
            console.log('===== 自动刷新 Cookie 异常结束 =====');
        }
    });
} else {
    console.log('未启用自动刷新 Cookie，如需启用请设置环境变量 ENABLE_AUTO_REFRESH=true');
}

app.listen(config.port, () => {
    console.log(`The server listens port: ${config.port}`);
});

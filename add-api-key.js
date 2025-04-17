const fetch = require('node-fetch');

async function addApiKey() {
  try {
    console.log('添加API Key...');
    const response = await fetch('http://localhost:3010/v1/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: 'test-key',
        cookieValues: ['test-cookie'],
      }),
    });
    
    console.log('响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('响应数据:', data);
    
    // 测试获取API Keys
    console.log('\n测试获取API Keys...');
    const getResponse = await fetch('http://localhost:3010/v1/api-keys');
    
    console.log('响应状态:', getResponse.status);
    
    if (!getResponse.ok) {
      throw new Error(`HTTP错误: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const getData = await getResponse.json();
    console.log('获取到的数据:', getData);
  } catch (error) {
    console.error('操作失败:', error);
  }
}

addApiKey(); 
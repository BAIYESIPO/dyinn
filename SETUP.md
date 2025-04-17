# Cursor-To-OpenAI 一键配置指南

本文档将指导你使用一键配置工具来设置 Cursor-To-OpenAI 环境。

## 准备工作

在开始配置前，请确保你已经：

1. Fork了 [Cursor-Register-fix](https://github.com/liuw1535/Cursor-Register-fix) 仓库到你的GitHub账号
2. 创建了一个GitHub个人访问令牌（Personal Access Token），且具有 `repo` 权限
3. 拥有至少一个Gmail账号，并启用了两步验证
4. 为Gmail账号创建了应用密码（Application Password）

## 配置步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 运行配置脚本

```bash
npm run setup
```

或者直接运行：

```bash
node setup.js
```

### 3. 按照提示输入信息

脚本会引导你输入以下信息：

- GitHub用户名：你的GitHub账号用户名
- GitHub Token：你的个人访问令牌
- API Key：自定义的API Key，用于访问服务
- Gmail账号：用于自动注册Cursor账号的Gmail地址
- Gmail应用密码：对应Gmail账号的应用密码（不是邮箱密码）

### 4. 创建应用密码的步骤

如果你还没有创建Gmail应用密码，请按照以下步骤操作：

1. 访问 [Google账号安全设置](https://myaccount.google.com/security)
2. 在"登录Google"部分，点击"两步验证"
   (如果未启用两步验证，需要先启用)
3. 在页面底部找到"应用密码"，点击进入
4. 在"选择应用"下拉菜单中选择"其他(自定义名称)"
5. 输入一个名称，例如"Cursor注册"
6. 点击"生成"
7. 复制生成的16位应用密码（格式如：xxxx xxxx xxxx xxxx）

### 5. 管理邮箱配置

系统提供了一个专门的邮箱配置管理工具，可以随时添加、修改或删除邮箱：

```bash
npm run manage-emails
```

使用此工具可以：
- 查看所有已配置的邮箱
- 添加新的Gmail账号
- 修改现有Gmail账号的配置
- 删除不再使用的Gmail账号

## 配置完成后

配置完成后，你可以：

1. 启动服务：

```bash
npm start
```

2. 手动触发Cookie刷新：

```bash
npm run refresh-cookies:force
```

## 配置文件说明

脚本会生成`.env`文件，其中包含以下主要配置：

- `API_KEYS`：API Key到Cookie的映射关系
- `GITHUB_OWNER`：你的GitHub用户名
- `GITHUB_TOKEN`：你的GitHub个人访问令牌
- `REGISTER_EMAIL_CONFIGS`：Gmail账号配置，用于自动注册

## 注意事项

1. GitHub Token需要具有repo权限，用于访问你fork的仓库
2. Gmail应用密码不同于你的Gmail登录密码，是专门为第三方应用生成的
3. MIN_COOKIE_COUNT设置为1000，确保系统会尝试刷新Cookie
4. 配置完成后，你可以通过Web界面查看和管理Cookie状态
5. 始终确保至少有一个有效的Gmail账号配置，否则自动刷新功能将无法正常工作 
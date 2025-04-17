#!/data/data/com.termux/files/usr/bin/bash

# 项目管理脚本（数字选择版）

echo "请选择操作："
echo "1. 更新 cookie"
echo "2. 启动项目"
echo "3. 管理邮箱"
echo "4. 初始化配置"
echo "5. 更新项目代码"
echo "6. 备份项目"
echo "7. 退出"

read -p "输入数字 (1-7): " choice

case $choice in
    1)
        echo "正在更新 cookie..."
        npm run refresh-cookies
        ;;
    2)
        echo "正在启动项目..."
        npm start
        ;;
    3)
        echo "正在管理邮箱..."
        npm run manage-emails
        ;;
    4)
        echo "正在初始化配置文件..."
        npm run setup
        ;;
    5)
        echo "正在更新项目代码..."
        git pull
        ;;
    6)
        echo "正在备份项目..."
        DATE=$(date +%Y%m%d_%H%M%S)
        tar -czf "backup_$DATE.tar.gz" .
        echo "备份完成: backup_$DATE.tar.gz"
        ;;
    7)
        echo "退出"
        exit 0
        ;;
    *)
        echo "错误：请输入 1-7 之间的数字"
        exit 1
        ;;
esac
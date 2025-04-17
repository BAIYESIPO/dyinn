#!/bin/bash

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backups directory if it doesn't exist
mkdir -p backups

# Function to display header
show_header() {
    clear
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${GREEN}      Cursor-To-OpenAI 简易脚本      ${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}未安装Docker。请先安装Docker。${NC}"
        exit 1
    fi
}

# Function to check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}未安装Node.js。请先安装Node.js。${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}未安装npm。请先安装npm。${NC}"
        exit 1
    fi
}

# Function to backup configuration before update
backup_configs() {
    echo -e "${YELLOW}正在备份配置文件...${NC}"
    backup_dir="backups/update_backup_$(date +"%Y%m%d_%H%M%S")"
    mkdir -p "$backup_dir"

    # Backup important configurations
    if [ -d data ]; then
        cp -r data "$backup_dir/"
    fi

    if [ -f .env ]; then
        cp .env "$backup_dir/"
    fi

    echo -e "${GREEN}配置文件已备份到 ${backup_dir}${NC}"
}

# Function to restore configuration after update
restore_configs() {
    if [ -z "$1" ]; then
        echo -e "${RED}未指定备份目录，无法恢复配置。${NC}"
        return 1
    fi

    backup_dir="$1"
    echo -e "${YELLOW}正在恢复配置文件...${NC}"

    if [ -d "$backup_dir/data" ]; then
        cp -r "$backup_dir/data/"* data/ 2>/dev/null
    fi

    if [ -f "$backup_dir/.env" ]; then
        cp "$backup_dir/.env" ./ 2>/dev/null
    fi

    echo -e "${GREEN}配置文件已恢复${NC}"
}

# Function for installation tasks
installation_menu() {
    show_header
    echo -e "${YELLOW}===== 安装菜单 =====${NC}"
    echo -e "1) 克隆仓库"
    echo -e "2) 安装依赖"
    echo -e "3) 创建配置文件"
    echo -e "4) 设置管理员账户"
    echo -e "5) 运行安装向导"
    echo -e "6) 构建并启动Docker容器"
    echo -e "7) 使用npm启动"
    echo -e "8) 返回主菜单"
    echo
    echo -n "请输入选择 [1-8]: "
    read -r choice

    case $choice in
        1)
            show_header
            echo -e "${YELLOW}正在克隆仓库...${NC}"
            read -p "请输入您的GitHub用户名: " username
            git clone "https://github.com/${username}/cursor-to-openai.git"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}仓库克隆成功！${NC}"
                cd cursor-to-openai
            else
                echo -e "${RED}克隆仓库失败！${NC}"
            fi
            read -p "按回车键继续..."
            installation_menu
            ;;
        2)
            show_header
            echo -e "${YELLOW}正在安装依赖...${NC}"
            npm install
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}依赖安装成功！${NC}"
            else
                echo -e "${RED}依赖安装失败！${NC}"
            fi
            read -p "按回车键继续..."
            installation_menu
            ;;
        3)
            show_header
            echo -e "${YELLOW}正在创建配置文件...${NC}"

            if [ ! -f .env ]; then
                cp .env.example .env
                echo -e "${GREEN}.env文件已创建。${NC}"
            else
                echo -e "${YELLOW}.env文件已存在。${NC}"
            fi

            mkdir -p data

            if [ ! -f data/admin.json ]; then
                cp data/admin.example.json data/admin.json
                echo -e "${GREEN}admin.json文件已创建。${NC}"
            else
                echo -e "${YELLOW}admin.json文件已存在。${NC}"
            fi

            echo -e "${YELLOW}您应该编辑.env文件来配置您的环境。${NC}"
            read -p "是否现在编辑.env文件？(y/n): " edit_env
            if [[ $edit_env == "y" || $edit_env == "Y" ]]; then
                if command -v nano &> /dev/null; then
                    nano .env
                elif command -v vim &> /dev/null; then
                    vim .env
                else
                    echo -e "${RED}未找到编辑器。请稍后手动编辑.env文件。${NC}"
                fi
            fi

            read -p "按回车键继续..."
            installation_menu
            ;;
        4)
            show_header
            echo -e "${YELLOW}正在设置管理员账户...${NC}"
            node scripts/create-admin.js
            read -p "按回车键继续..."
            installation_menu
            ;;
        5)
            show_header
            echo -e "${YELLOW}正在运行安装向导...${NC}"
            node setup.js
            read -p "按回车键继续..."
            installation_menu
            ;;
        6)
            show_header
            echo -e "${YELLOW}正在构建并启动Docker容器...${NC}"
            check_docker
            docker compose up -d --build
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Docker容器启动成功！${NC}"
                echo -e "${GREEN}访问管理界面: http://localhost:3010${NC}"
            else
                echo -e "${RED}启动Docker容器失败！${NC}"
            fi
            read -p "按回车键继续..."
            installation_menu
            ;;
        7)
            show_header
            echo -e "${YELLOW}正在使用npm启动...${NC}"
            check_nodejs
            npm start &
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}服务启动成功！${NC}"
                echo -e "${GREEN}访问管理界面: http://localhost:3010${NC}"
            else
                echo -e "${RED}启动服务失败！${NC}"
            fi
            read -p "按回车键继续..."
            installation_menu
            ;;
        8)
            main_menu
            ;;
        *)
            echo -e "${RED}无效选项。请重试。${NC}"
            read -p "按回车键继续..."
            installation_menu
            ;;
    esac
}

# Function for maintenance tasks
maintenance_menu() {
    show_header
    echo -e "${YELLOW}===== 维护菜单 =====${NC}"
    echo -e "1) 查看服务状态"
    echo -e "2) 刷新Cookie"
    echo -e "3) 强制刷新Cookie"
    echo -e "4) 管理邮箱"
    echo -e "5) 管理无效Cookie"
    echo -e "6) 查看日志"
    echo -e "7) 重启服务"
    echo -e "8) 停止服务"
    echo -e "9) 更新项目代码"
    echo -e "10) 备份项目数据"
    echo -e "11) 持续刷新Cookie直到成功"
    echo -e "12) 返回主菜单"
    echo
    echo -n "请输入选择 [1-12]: "
    read -r choice

    case $choice in
        1)
            show_header
            echo -e "${YELLOW}服务状态:${NC}"
            if docker ps | grep -q cursor-to-openai; then
                echo -e "${GREEN}Docker容器正在运行。${NC}"
                docker ps | grep cursor-to-openai
            else
                echo -e "${RED}Docker容器未运行。${NC}"
            fi

            pids=$(pgrep -f "node.*start")
            if [ -n "$pids" ]; then
                echo -e "${GREEN}Node.js服务正在运行，PID: $pids${NC}"
            else
                echo -e "${RED}Node.js服务未运行。${NC}"
            fi

            read -p "按回车键继续..."
            maintenance_menu
            ;;
        2)
            show_header
            echo -e "${YELLOW}正在刷新Cookie...${NC}"
            npm run refresh-cookies
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        3)
            show_header
            echo -e "${YELLOW}正在强制刷新Cookie...${NC}"
            npm run refresh-cookies -- --force
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        4)
            show_header
            echo -e "${YELLOW}正在管理邮箱...${NC}"
            npm run manage-emails
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        5)
            show_header
            echo -e "${YELLOW}正在管理无效Cookie...${NC}"
            node manage-invalid-cookies.js
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        6)
            show_header
            echo -e "${YELLOW}正在查看日志...${NC}"
            if docker ps | grep -q cursor-to-openai; then
                docker compose logs -f
            else
                echo -e "${RED}Docker容器未运行。${NC}"
                echo -e "${YELLOW}正在检查npm日志...${NC}"
                # Try to find logs in npm-debug.log or similar
                if [ -f npm-debug.log ]; then
                    cat npm-debug.log
                else
                    echo -e "${RED}未找到日志文件。${NC}"
                fi
            fi
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        7)
            show_header
            echo -e "${YELLOW}正在重启服务...${NC}"
            if docker ps | grep -q cursor-to-openai; then
                docker compose restart
                echo -e "${GREEN}Docker容器已重启。${NC}"
            else
                pids=$(pgrep -f "node.*start")
                if [ -n "$pids" ]; then
                    kill $pids
                    sleep 2
                    npm start &
                    echo -e "${GREEN}Node.js服务已重启。${NC}"
                else
                    echo -e "${RED}未检测到运行中的服务。${NC}"
                    echo -e "${YELLOW}是否要启动服务？(y/n): ${NC}"
                    read -r start_service
                    if [[ $start_service == "y" || $start_service == "Y" ]]; then
                        npm start &
                        echo -e "${GREEN}服务已启动。${NC}"
                    fi
                fi
            fi
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        8)
            show_header
            echo -e "${YELLOW}正在停止服务...${NC}"
            if docker ps | grep -q cursor-to-openai; then
                docker compose down
                echo -e "${GREEN}Docker容器已停止。${NC}"
            else
                pids=$(pgrep -f "node.*start")
                if [ -n "$pids" ]; then
                    kill $pids
                    echo -e "${GREEN}Node.js服务已停止。${NC}"
                else
                    echo -e "${RED}未检测到运行中的服务。${NC}"
                fi
            fi
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        9)
            show_header
            echo -e "${YELLOW}正在更新项目代码...${NC}"

            # 备份配置文件
            backup_configs
            backup_dir=$(ls -td backups/update_backup_* | head -1)

            # 检查是否存在未提交的更改
            if [ -n "$(git status --porcelain)" ]; then
                echo -e "${YELLOW}检测到未提交的更改。更新前请处理这些更改。${NC}"
                echo -e "1) 查看更改"
                echo -e "2) 备份并放弃更改"
                echo -e "3) 取消更新"
                echo -n "请选择操作 [1-3]: "
                read -r update_choice

                case $update_choice in
                    1)
                        git status
                        echo -e "${YELLOW}是否继续更新？(y/n): ${NC}"
                        read -r continue_update
                        if [[ $continue_update != "y" && $continue_update != "Y" ]]; then
                            echo -e "${YELLOW}更新已取消。${NC}"
                            read -p "按回车键继续..."
                            maintenance_menu
                            return
                        fi
                        ;;
                    2)
                        echo -e "${YELLOW}备份更改...${NC}"
                        git diff > "$backup_dir/local_changes.patch"
                        git checkout -- .
                        echo -e "${GREEN}更改已备份到 $backup_dir/local_changes.patch${NC}"
                        ;;
                    3)
                        echo -e "${YELLOW}更新已取消。${NC}"
                        read -p "按回车键继续..."
                        maintenance_menu
                        return
                        ;;
                    *)
                        echo -e "${RED}无效选项。更新已取消。${NC}"
                        read -p "按回车键继续..."
                        maintenance_menu
                        return
                        ;;
                esac
            fi

            # 更新代码
            git pull
            update_status=$?

            # 恢复配置文件
            restore_configs "$backup_dir"

            if [ $update_status -eq 0 ]; then
                echo -e "${GREEN}项目代码更新成功！${NC}"
                echo -e "${YELLOW}是否需要重新安装依赖？(y/n): ${NC}"
                read -r reinstall
                if [[ $reinstall == "y" || $reinstall == "Y" ]]; then
                    npm install
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}依赖安装成功！${NC}"
                    else
                        echo -e "${RED}依赖安装失败！${NC}"
                    fi
                fi
            else
                echo -e "${RED}项目代码更新失败！${NC}"
            fi

            read -p "按回车键继续..."
            maintenance_menu
            ;;
        10)
            show_header
            echo -e "${YELLOW}正在备份项目数据...${NC}"

            # 创建备份目录
            backup_dir="backups/backup_$(date +"%Y%m%d_%H%M%S")"
            mkdir -p "$backup_dir"

            # 备份关键文件
            cp -r data "$backup_dir/" 2>/dev/null
            if [ -f .env ]; then
                cp .env "$backup_dir/"
            fi

            # 压缩备份
            tar -czf "${backup_dir}.tar.gz" "$backup_dir"
            rm -rf "$backup_dir"

            echo -e "${GREEN}备份已创建: ${backup_dir}.tar.gz${NC}"
            read -p "按回车键继续..."
            maintenance_menu
            ;;
        11)
            show_header
            echo -e "${YELLOW}持续刷新Cookie直到成功...${NC}"
            read -p "请输入最大尝试时间(分钟, 默认60): " max_time
            max_time=${max_time:-60}
            max_seconds=$((max_time * 60))

            echo -e "${YELLOW}将持续尝试刷新Cookie，最长 ${max_time} 分钟...${NC}"

            start_time=$(date +%s)
            success=false
            attempt=0

            while ! $success && [ $(($(date +%s) - start_time)) -lt $max_seconds ]; do
                attempt=$((attempt + 1))
                elapsed=$(($(date +%s) - start_time))
                remaining=$((max_seconds - elapsed))
                remaining_min=$((remaining / 60))
                remaining_sec=$((remaining % 60))

                echo -e "${YELLOW}尝试 #${attempt}...（剩余时间: ${remaining_min}分${remaining_sec}秒）${NC}"

                # 运行刷新命令并检查输出
                output=$(npm run refresh-cookies -- --force 2>&1)
                echo "$output"

                if echo "$output" | grep -q "成功添加新的Cookie" || echo "$output" | grep -q "Successfully added new cookies"; then
                    success=true
                    echo -e "${GREEN}成功添加新Cookie！${NC}"
                else
                    wait_time=$((RANDOM % 61 + 30))  # 30-90秒随机间隔
                    echo -e "${YELLOW}等待 ${wait_time} 秒后重试...${NC}"
                    sleep $wait_time
                fi
            done

            if $success; then
                echo -e "${GREEN}成功刷新Cookie！${NC}"
            else
                echo -e "${RED}达到最大尝试时间，未能成功刷新Cookie。${NC}"
            fi

            read -p "按回车键继续..."
            maintenance_menu
            ;;
        12)
            main_menu
            ;;
        *)
            echo -e "${RED}无效选项。请重试。${NC}"
            read -p "按回车键继续..."
            maintenance_menu
            ;;
    esac
}

# Main menu function
main_menu() {
    show_header
    echo -e "${YELLOW}===== 主菜单 =====${NC}"
    echo -e "1) 启动服务 (npm)"
    echo -e "2) 安装配置"
    echo -e "3) 系统维护"
    echo -e "4) 退出"
    echo
    echo -n "请输入选择 [1-4]: "
    read -r choice

    case $choice in
        1)
            show_header
            echo -e "${YELLOW}正在使用npm启动服务...${NC}"
            check_nodejs

            # 检查Node.js服务是否已在运行
            pids=$(pgrep -f "node.*start")
            if [ -n "$pids" ]; then
                echo -e "${YELLOW}服务已在运行，PID: $pids${NC}"
                echo -e "${YELLOW}是否要重启服务？(y/n): ${NC}"
                read -r restart
                if [[ $restart == "y" || $restart == "Y" ]]; then
                    kill $pids
                    sleep 2
                    npm start &
                    echo -e "${GREEN}服务已重启${NC}"
                fi
            else
                npm start &
                echo -e "${GREEN}服务已启动${NC}"
            fi

            echo -e "${GREEN}访问管理界面: http://localhost:3010${NC}"
            read -p "按回车键继续..."
            main_menu
            ;;
        2)
            installation_menu
            ;;
        3)
            maintenance_menu
            ;;
        4)
            show_header
            echo -e "${GREEN}感谢使用Cursor-To-OpenAI简易脚本！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选项。请重试。${NC}"
            read -p "按回车键继续..."
            main_menu
            ;;
    esac
}

# Start the script
main_menu

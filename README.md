# Rosmarin-Bot / 迷迭香Bot

![language-typescript](https://img.shields.io/badge/language-typescript-3178c6)

一个用于 [Screeps](https://screeps.com/) 的 TypeScript 半自动Bot。

不同于全自动，本bot的功能需要手动设置相关参数才会自动运行。

## 注意

本项目可以混入js代码。

本项目的功能并不完善，可能还有许多BUG或是功能缺陷，因此未必能够在任何环境和需求中使用，因此更建议只作为参考。


## 功能

- 基本房间运营的自动化（孵化、采集、升级、建造、维修）
- 自动填充能量与资源
- 自动布局、自动建造
- 自动lab合成
- 自动factory生产
- 自动调度资源

## 使用方法

在控制台输入 `help` 查看

## 安装

1. 安装依赖

    ```bash
    npm install
    ```

2. 配置

    创建 `.secret.json` 文件，并添加以下内容：

    ```json
    {
        "main": {
            "token": "这里是token",
            "protocol": "https",
            "hostname": "screeps.com",
            "port": 443,
            "path": "/",
            "branch": "main"
        },
        "local": {
            "copyPath": "游戏客户端放代码的本地路径"
        }
    }
    ```

3. 构建

    ```bash
    npm run build
    ```

    生成的 js 文件在 `dist` 目录下

4. 构建并提交代码

    ```bash
    npm run push
    ```

    注意, 这将会覆盖 `main` 分支的代码。

    在游戏内切换到 `main` 分支即可开始运行。如果切换分支后报错，那么就再执行一次 `npm run push`。



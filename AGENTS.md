# resource-base 项目规则

## 本机维护阅读顺序

在本机 Project 工作区处理任何本项目任务，必须先读 `Project/AGENTS.md`（本机相对路径 `../../AGENTS.md`），再读 `SnowUI/AGENTS.md`（本机相对路径 `../AGENTS.md`）、本文件及 [本项目文档](docs/README.md)。不能因当前目录是独立 Git 根而省略上层规则。上述跨仓库链接仅在完整本机工作区有效；独立检出进行官方维护而缺少上层规则时，先定位规则，不假称已读取。普通使用者从本仓库 README 与随附许可文件了解使用范围，不需要取得私人维护文档。

本机维护规范统一放 `docs/standards/`，操作说明放 `docs/operations/`，计划放 `docs/planning/`，追溯记录放 `docs/history/`；按需创建，不建立平行 `specs/` 或 `doc/`。跨项目通用规则回到 Project，SnowUI 共同规则回到 SnowUI 根，单组件 API 仍随源码维护。

本项目负责原始资源与处理工具。本机官方维护时沿 SnowUI 任务路由 `../docs/TaskRoutes.md` 读取命中规范，再读本项目 README 和实际调用链；不复制共享规范正文。测试与发布按上层规则及当前授权执行。

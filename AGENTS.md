# resource-base 项目规则

## 本机维护阅读顺序

在本机 Project 工作区执行任何任务，必须先读 [Project/AGENTS.md](../../AGENTS.md)，再读 [SnowUI/AGENTS.md](../AGENTS.md)、本文件及 [本项目文档](docs/README.md)。不能因当前目录是独立 Git 根而省略上层规则。上层文件缺失时，先说明当前是独立检出并定位共同规则，不假称已读取；下述公开许可说明仍供独立分发副本使用。

规范统一放 `docs/standards/`，操作说明放 `docs/operations/`，计划放 `docs/planning/`，追溯记录放 `docs/history/`；按需创建，不建立平行 `specs/` 或 `doc/`。跨项目通用规则回到 Project，SnowUI 共同规则回到 SnowUI 根，单组件 API 仍随源码维护。

本项目负责原始资源与处理工具。沿 [SnowUI 任务路由](../docs/TaskRoutes.md) 读取命中规范，再读本项目 README 和实际调用链；不复制共享规范正文。测试与发布按上层规则及当前授权执行。

# SVG Editor CLI

一个使用 TypeScript 实现的命令行 SVG 编辑器，重点演示 **Composite** 与 **Command** 模式在真实编辑场景中的落地。

## 功能

- 支持 `rect / circle / ellipse / line / text / g` 六类图形；
- 支持创建、删除、移动、缩放、属性修改、分组、解组和 z-order 调整；
- 容器与叶子图形使用统一操作接口，容器的变换和删除递归作用于子树；
- 每个编辑命令对应一个 undo 单元，支持 `undo / redo`；
- 支持 SVG 文件读写、缺 ID 自动补全、XML 转义和属性 round-trip；
- 提供 `tree / show / help` 显示命令及完整错误反馈。

## 运行

验证环境：Node.js 22、npm 10。

```bash
npm ci
npm run cli       # 启动 REPL，提示符为 svg>
npm run check     # TypeScript 严格编译 + 全部测试
```

示例会话：

```text
svg> init 800 600
svg> create g node1
svg> create rect start 120 100 160 60 #4a90d9 in node1
svg> create text start-label 155 135 "开始" in node1
svg> tree
svg> save examples/flowchart.svg
```

## 文档

- [完整架构与验收文档](doc/README.md)：模块划分、设计模式、依赖规则、变化点、过程记录、一致性自查和质量保证
- [PlantUML 组件图](doc/architecture.puml)
- [流程图 SVG 示例](examples/flowchart.svg)

## 验收状态

TypeScript 严格编译通过；5 个测试文件共 30 项测试通过，覆盖领域模型、SVG 读写、全部命令、撤销重做、完整会话和真实 CLI 子进程。

**仓库地址**：https://github.com/SYSUCY/svg-editor-cli

# SVG Editor CLI — Lab1 Phase 1

## 仓库与运行

- **Git 仓库地址**：待填写（远程仓库地址尚未提供）
- 验证环境：Windows、Node.js 22.22.2、npm 10.9.7
- 主要技术：TypeScript 严格模式、面向对象模型、Vitest、fast-xml-parser

```bash
npm ci
npm run cli       # 启动 REPL，提示符为 svg>
npm run build     # TypeScript 严格编译
npm test          # 自动化测试
npm run check     # 构建 + 全部测试
```

可直接用浏览器打开 `examples/flowchart.svg` 查看由真实 CLI 生成的两节点流程图。

## 架构方案

### 1. 模块划分

| 目录 | 职责 |
|---|---|
| `src/model/` | `Shape` 抽象类及六类图形、`Group` 组合容器、`SvgDocument` 文档树、唯一 ID、几何行为与属性白名单 |
| `src/command/` | 命令接口、19 个命令实现、参数校验、命令分派、编辑快照和 undo/redo 历史 |
| `src/io/` | SVG XML 解析、序列化、缺 ID 补全、额外表现属性保留和文件读写 |
| `src/display/` | `tree` 与 `show` 的纯文本格式化 |
| `src/app/` | `EditorSession`：当前文档、历史管理器与文件服务的会话协调 |
| `src/cli/` | REPL 入口、提示符、逐行读取与结果输出 |
| `test/` | 模型、IO、命令、历史和完整会话测试，以及外部 SVG fixtures |
| `examples/` | 通过实际 CLI 生成的 SVG 示例 |

每个类位于同名文件中。模型对象不仅保存数据，还自行实现 `move`、`scale`、`setAttribute`、显示摘要及序列化数据导出，避免贫血模型和过程式几何操作。

组件图源文件见 [architecture.puml](architecture.puml)：

```plantuml
@startuml
skinparam componentStyle rectangle
package "cli" { [REPL] }
package "app" { [EditorSession] }
package "command" { [Dispatcher] [Commands] [HistoryManager] }
package "model" { [SvgDocument] [Shape / Group] [ShapeFactory] }
package "io" { [SvgFileStore] [SvgParser] [SvgSerializer] }
package "display" { [Tree / Show Formatters] }
[REPL] --> [Dispatcher]
[REPL] --> [EditorSession]
[Dispatcher] --> [Commands]
[Commands] --> [SvgDocument]
[Commands] --> [HistoryManager]
[Commands] --> [Tree / Show Formatters]
[EditorSession] --> [SvgFileStore]
[SvgFileStore] --> [SvgParser]
[SvgFileStore] --> [SvgSerializer]
[SvgParser] --> [ShapeFactory]
[SvgSerializer] --> [SvgDocument]
[SvgDocument] --> [Shape / Group]
@enduml
```

### 2. 设计模式的选择与落地

**Command 模式**

- `Command` 定义统一的 `execute(context, args)` 接口；每个命令一个实现类。
- `CommandDispatcher` 只负责“命令名 → 命令对象”，是允许的两处名称分派之一。
- 编辑命令继承 `EditCommand`。模板方法在执行前后取得 `DocumentSnapshot`，将一条编辑命令封装为一个历史单元。
- `HistoryManager` 分别维护 undo/redo 栈；undo 后发生新编辑会清空 redo 栈。
- 成功的 `init/read/save/canvas 改尺寸` 清空并禁用旧历史；下一次成功编辑建立新的历史。显示命令和 `canvas` 查询不改变历史。

快照方案比手写每类逆操作多消耗一些内存，但能可靠恢复 `group`、嵌套删除和 z-order 等复合状态。在本阶段文档规模下，优先选择正确性和可验证性。

**Composite 模式**

- `Shape` 是统一抽象，`Rect/Circle/Ellipse/Line/Text` 是叶子，`Group` 是容器。
- 命令只面向 `Shape` 操作；`Group.move/scale` 递归作用于子孙，`delete` 删除整棵子树。
- 容器的几何变更直接落到模型坐标，而不是依赖命令层拼接 SVG `transform`，因此 `tree/show/save` 观察到同一状态。

**Factory 的有限使用**

`ShapeFactory` 集中处理图形类型名、创建参数和读回构造，是另一处允许的名称分派。本阶段不提前实现插件系统；`box` 按阶段边界返回 `unknown shape type`。

### 3. 依赖方向规则

```text
cli → app / command
app → command / io / model
command → model / display
display → model
io → model
model → model 内部
```

- `model` 不依赖 CLI、命令、文件系统或 XML 库，可独立测试。
- 命令通过 `CommandContext` 使用会话能力，不直接操作 Node.js 文件 API。
- IO 可依赖模型完成读写，模型不得反向依赖 IO。
- CLI 只做输入输出和组装，不包含图形业务规则。
- 除 `CommandDispatcher` 与 `ShapeFactory` 外，不使用按命令名或图形标签名的自由分派。各图形内部的属性名校验不属于标签分派。

### 4. 变化点假设

| 可能变化 | 当前预留或取舍 |
|---|---|
| 新增 `box` 等复合图形 | 图形构造集中在 `ShapeFactory`；后续可将它重构为 `ShapeProvider` 注册表。本阶段不实现插件机制，避免超范围设计 |
| 新增 CLI 命令 | 新增命令类并注册到 Dispatcher；编辑命令复用历史模板 |
| 新图形属性或几何行为 | 由对应 `Shape` 子类封装，命令无需按标签修改 |
| 更丰富的显示通道 | `display` 与模型分离，可增加格式化器而不改编辑逻辑 |
| 文件格式或存储位置变化 | 文件细节集中于 `SvgFileStore/SvgParser/SvgSerializer`；当前仅承诺需求规定的 SVG 子集 |
| 大型文档的历史性能 | 当前使用完整快照保证复合操作可恢复；若出现实际性能问题，再改为增量 Memento，不提前优化 |
| XPath 等结构路径寻址 | 本阶段明确不预留实现，所有公共命令仍只依赖唯一 ID |

补充语义决策：跨父容器 `group` 时，新容器放在第一个被选中图形的原父级和相对位置，子节点顺序遵循命令中的 ID 顺序。外部 SVG 的未知表现属性会保留，未知图形标签会报错；带 `data-kind` 但无对应插件的容器按普通 `g` 读入。

## 过程记录

1. **先建立纵向可运行链路**：先完成模型和 `save/read`，再扩展全部命令，避免最后才验证真实 SVG 输出。
2. **选择快照而不是分散逆操作**：审查 `group/delete` 的 undo 时，发现逐操作逆向容易遗漏原父级和顺序，因此统一保存编辑前后快照，并用嵌套删除恢复测试验证。
3. **严格编译发现实现问题**：初次构建指出 5 个图形子类覆写 `ownAttributes` 时缺少 `override`；逐一修正后才提交模型阶段。
4. **golden test 纠正预期**：树格式测试首次因空格数与需求示例不一致而失败；对照文档确认实现对齐到 15 字符，修正测试中的错误预期，而非模糊匹配。
5. **补查自动 ID 冲突**：增加“前面的匿名 rect 与后面的显式 rect1 共存”用例后，改为预收集显式 ID，再分配匿名 ID，避免后出现的合法 ID 导致导入失败。
6. **依赖自查带来调整**：初版分词器位于 `cli`，使命令层反向依赖 CLI；最终移入 `command`，使 REPL 只承担输入输出。
7. **注释解析保持约定**：仅忽略 `#` 开头的整行注释，不把 `#ffffff` 当成行内注释；使用专门测试锁定。

Git 历史按“模型与 IO → 命令与历史 → CLI 与端到端验收 → 文档与收尾”分步提交，不使用一次性大提交。

## 一致性自查

1. **模块划分**：实际目录与方案一致。开发中唯一发现的目录偏差是分词器位置，已移入 `command` 并记录，不存在未说明的架构差异。
2. **依赖方向**：抽样并检查了 `src/model`、`src/command` 的全部 import。模型只依赖模型内部；命令不依赖 CLI 或具体文件 API；IO 只向模型依赖。按标签分派仅存在于 `ShapeFactory`，命令名分派仅存在于 `CommandDispatcher`。
3. **阶段边界**：没有提前实现 `box` 或插件注册机制；`create box` 的错误行为有测试覆盖。
4. **命令失败原子性**：重复 ID、非法祖先分组、失败读取等测试会比较失败前后的文档快照，并继续验证旧历史仍可使用。

## 质量保证手段

### 自动化验证

最终验收命令为 `npm run check`，包括 TypeScript 严格编译和 30 项自动化测试：

| 测试文件 | 覆盖内容 |
|---|---|
| `Model.test.ts` | Composite 递归变换、大小写敏感唯一 ID、属性白名单、快照恢复 |
| `SvgIo.test.ts` | 外部 SVG、缺 ID 警告、显式 ID 冲突规避、XML 转义、表现属性 round-trip |
| `Commands.test.ts` | 六类图形、容器归属、分组/解组、循环防护、z-order、显示格式、错误原子性 |
| `History.test.ts` | undo/redo、redo 清空、IO 禁用、默认保存路径、失败命令和失败读取 |
| `EndToEnd.test.ts` | 需求文档完整 transcript、两节点流程图、真实 Node CLI 子进程 |

验收不只检查“没有抛异常”：关键输出使用精确数组比较；文件保存后重新解析，核对元素数、父子关系和中文文本；失败场景核对错误文本与状态不变。

### 端到端与人工预览

`examples/flowchart.svg` 由 `npm run cli` 执行真实命令序列生成，包含 3 个容器、2 个矩形、2 个文本和 1 条连线，共 8 个元素。浏览器打开该文件即可检查最终渲染。

### 交付检查

- `package-lock.json` 已提交，可用 `npm ci` 复现依赖。
- `dist/`、`node_modules/` 不进入 Git。
- 最终提交应位于干净工作区，并在推送后打 `final` 标签。

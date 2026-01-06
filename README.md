# 豪帅网络服务 - 单屏 3D 游戏风格展示页

## 项目简介

这是一个为「豪帅网络服务」制作的单屏（无滚动）展示页。整体采用偏 3D 游戏 UI 的视觉风格（星空/粒子透视、霓虹 HUD 面板、地面网格等），页面底部保留 ICP 备案与公安备案信息。

## 设计要求（已实现）

- 单屏内容：页面不再包含多段落滚动结构
- 不展示联系/咨询元素：移除了联系区、表单、咨询按钮等
- 3D 游戏风格：Canvas 透视星空 + 3D 网格地面 + HUD 面板轻微倾斜
- 保留备案信息：底部展示 ICP 与公安备案
- 中间标题："豪帅网络服务"

## 文件结构

```
/home/engine/project/
├── index.html          # 单屏页面
├── styles.css          # 游戏风格样式
├── script.js           # 星空/粒子背景 + HUD 轻微 3D 倾斜
└── README.md           # 说明文档
```

## 本地预览

直接用浏览器打开 `index.html` 即可。

也可以使用本地静态服务器：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 自定义

- **修改标题**：`index.html` 中的 `.hud-title`
- **修改备案号**：`index.html` 中的 `.record-wrap`
- **调整背景密度/速度**：`script.js` 中的 `count` / `speed` / `depth` / `fov`
- **调整 3D 网格效果**：`styles.css` 中 `.grid-floor` 的 `rotateX`、`background-size`、`opacity`

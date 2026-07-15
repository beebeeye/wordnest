# WordNest — Vercel 部署说明

## 为什么之前会报错

原来的代码调用 `https://api.anthropic.com/v1/messages` 时**没有带 API key** —— 这种写法只在 Claude.ai 的 Artifact 环境里有效（由 Anthropic 代为鉴权）。部署到 Vercel 后，请求会因为缺少 key（以及浏览器 CORS 限制）而失败，所以显示 "Couldn't build the word card"。

另外，原代码用的 `window.storage` 也是 Artifact 专属 API，在 Vercel 上不存在，单词无法保存。

这个文件夹里的版本已把两个问题都修好：

- `api/generate.js` — Vercel Serverless Function。API key 只保存在服务器端环境变量里，前端永远接触不到（不要把 key 写进前端代码，否则任何访问者都能偷走它）。
- `WordNest.jsx` — 前端改为调用自己的 `/api/generate`，并用浏览器 `localStorage` 保存单词。

## 部署步骤

1. **放置文件**（以 Vite + React 项目为例）
   ```
   your-project/
   ├── api/
   │   └── generate.js        ← 放在项目根目录的 api/ 下（Vercel 约定）
   └── src/
       └── WordNest.jsx       ← 替换原来的组件
   ```
   注意：`api/` 必须在**项目根目录**，和 `src/` 平级，不是放在 `src/` 里面。
   （如果你用的是 Next.js App Router，改放到 `app/api/generate/route.js` 并把 handler 改成 `export async function POST(req)` 的写法——需要的话我可以给你这个版本。）

2. **获取 API key**
   到 https://console.anthropic.com → API Keys → 创建一个 key（`sk-ant-` 开头）。注意 API 用量是按 token 计费的。

3. **在 Vercel 配置环境变量**
   Vercel 项目 → Settings → Environment Variables → 添加：
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的 key
   - 勾选 Production / Preview / Development

4. **重新部署**
   环境变量修改后必须 Redeploy 才会生效。

## 本地开发

```bash
npm i -g vercel
vercel dev          # 会同时跑前端和 api/ 下的函数
```
本地建一个 `.env` 文件写入 `ANTHROPIC_API_KEY=sk-ant-...`（记得加进 .gitignore）。

## 常见问题

- **仍然报错** → 打开 Vercel 的 Functions 日志看 `/api/generate` 的报错；90% 是环境变量没设或没重新部署。
- **404 /api/generate** → `api/` 文件夹位置不对，或者项目是 Next.js（见第 1 步的说明）。
- **换个模型** → 在 `api/generate.js` 里改 `model` 字段即可。

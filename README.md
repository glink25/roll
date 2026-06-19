# Roll 模拟器

一个面向论坛楼层和活动名单的可重放在线抽奖工具。抽奖、配置解析与链接编码全部在浏览器本地完成，不需要后端服务。

## 功能

- 数字范围抽奖，支持排除无效楼层
- 名称列表抽奖，支持中英文逗号和空白分隔
- 可选抽奖名称与本地语义化默认种子
- 固定随机种子与确定性抽奖结果
- 明文短参数和 Base64URL 遮掩链接
- Next.js 静态导出、Metadata API、JSON-LD、robots 与 sitemap

Base64URL 仅用于避免名称直接显示在地址栏，并不提供加密或访问控制。

## 本地开发

建议使用 Node.js 22 LTS。

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 质量检查

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` 会将纯静态站点输出到 `out/`。可使用任意静态文件服务器预览该目录。

## SEO 配置

复制 `.env.example` 为 `.env.local`，并设置正式部署地址：

```bash
NEXT_PUBLIC_SITE_URL=https://roll.example.com
```

配置后会生成绝对 canonical、Open Graph URL 和 sitemap 条目；未配置时不会输出虚假的生产域名。

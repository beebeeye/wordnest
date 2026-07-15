// api/generate.js
export default async function handler(req, res) {
  // 1. 限制只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. 从 Vercel 环境变量中读取你的 Claude API Key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Vercel 环境变量中缺少 ANTHROPIC_API_KEY，请前往 Vercel 项目设置中配置。' 
    });
  }

  // 3. 获取前端传过来的 prompt
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    // 4. 由后端向 Anthropic 官方发起请求（避开浏览器的 CORS 限制）
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKey,                 // 安全地附带 API Key，客户端不可见
        "anthropic-version": "2023-06-01"    // Anthropic 要求的版本号头部
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // 建议使用官方标准的 3.5 Sonnet 模型名称
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Anthropic API error' });
    }

    // 5. 将结果安全地返回给前端
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
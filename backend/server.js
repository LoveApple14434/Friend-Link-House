const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 创建 RSS 解析器实例
const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  }
});

// API 端点：获取单个 RSS 源的内容
app.get('/api/rss', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    console.log(`Fetching RSS from: ${url}`);
    const feed = await parser.parseURL(url);
    res.json(feed);
  } catch (error) {
    console.error('Error fetching RSS:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch RSS feed',
      details: error.message 
    });
  }
});

// API 端点：批量获取多个 RSS 源的内容
app.post('/api/rss/batch', async (req, res) => {
  const { urls } = req.body;
  
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'URLs array is required' });
  }
  
  try {
    const results = [];
    
    for (const url of urls) {
      try {
        console.log(`Fetching RSS from: ${url}`);
        const feed = await parser.parseURL(url);
        results.push({
          url,
          success: true,
          data: feed
        });
      } catch (error) {
        console.error(`Error fetching RSS from ${url}:`, error.message);
        results.push({
          url,
          success: false,
          error: error.message
        });
      }
      
      // 添加延迟，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error in batch RSS fetch:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch RSS feeds',
      details: error.message 
    });
  }
});

// API 端点：获取有效的 RSS 源列表
app.get('/api/sources', async (req, res) => {
  try {
    // 假设 valid-opml.json 文件在后端目录中
    const sourcesPath = path.join(__dirname, 'valid-opml.json');
    const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
    res.json(sources);
  } catch (error) {
    console.error('Error reading sources file:', error.message);
    res.status(500).json({ 
      error: 'Failed to read sources file',
      details: error.message 
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`RSS proxy server running on port ${PORT}`);
});
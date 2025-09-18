// 文件读取包
const fs = require("fs");
// 引入 RSS 解析第三方包
const Parser = require("rss-parser");
const parser = new Parser({ timeout: 12000 });
// 引入 RSS 生成器
const RSS = require("rss");
// const HttpsProxyAgent = require("https-proxy-agent");

// TODO: 需要重点关注和修改的配置
const opmlXmlContentTitle = "LoveApple Blogroll";
const maxDataJsonItemsNumberForWeb = 120; // 保存前 120 项
const maxDataJsonItemsNumberForRSS = 40; // 对RSS保存前 40 项
const maxSummaryLength = 100;
var feed = new RSS({
  title: "LoveApple日报",
  description: "水煮鱼和他的朋友们的blog，不代表本人观点",
  feed_url: "https://loveapple.icu/blogroll/rss.xml",
  site_url: "https://loveapple.icu/blogroll/",
  image_url: "https://loveapple.icu/img/machinist.jpg",
  docs: "",
  managingEditor: "LoveApple",
  webMaster: "LoveApple",
  copyright: "2025 LoveApple",
  language: "cn",
  ttl: "60",
});

// 其他相关配置
const readmeMdPath = "./README.md";
const opmlJsonPath = "./web/public/opml.json";
const validOpmlJsonPath = './backend/valid-opml.json'; // 新增：有效RSS源文件
const validOpmlJsonPath2 = './web/src/assets/valid-opml.json';
const dataJsonPath = "./web/public/data.json";
const linkListJsonPath = "./web/public/linkList.json";
const opmlXmlPath = "./web/public/opml.xml";
const rssXmlPath = "./web/public/rss.xml";
const opmlXmlContentOp =
  '<opml version="2.0">\n  <head>\n    <title>' +
  opmlXmlContentTitle +
  "</title>\n  </head>\n  <body>\n\n";
const opmlXmlContentEd = "\n  </body>\n</opml>";

// 解析 README 中的表格，转为 JSON
const pattern =
  // /\| *([^\|]*) *\| *(http[^\|]*) *\| *([^\|\n]*) *\| *([^\| \n]*) *\| *([^\| \n]*) *\| *([^\| \n]*) *\|\n/g;
  /\s*\|\s*([^|]+?)\s*\|\s*([^|]*http[^|]*)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/g;
  // /\| *([^\|]*) *\| *(http[^\|]*) *\| *([^\|\n]*) *\| *([^\| \n]*) *\| *([^\| \n]*) *\| *([^\| \n]*) *\|/g;
const readmeMdContent = fs.readFileSync(readmeMdPath, { encoding: "utf-8" });

const opmlJson = [];
let resultArray;
while ((resultArray = pattern.exec(readmeMdContent)) !== null) {
  opmlJson.push({
    title: resultArray[1].trim(),
    htmlUrl: resultArray[2].trim(),
    description: resultArray[3].trim(),
    avatarUrl: resultArray[4].trim(),
    xmlUrl: resultArray[5].trim(),
    category: resultArray[6].trim(),
  });
}


async function fetchWithTimeout(resource, options = {}) {
  // const { timeout = 12000 } = options;
  // options["agent"] = new HttpsProxyAgent("http://127.0.0.1:1087");
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 12000);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  // clearTimeout(id);
  return response;
}

// console.log(metaJson);

(async () => {
  const validOpmlJson = [];
  const dataJson = [];
  console.log("开始检测RSS源有效性...");
  
  // 第一阶段：检测RSS源有效性
  for (const lineJson of opmlJson) {
    if (!lineJson.xmlUrl.startsWith('http')) {
      continue;
    }
    
    try {
      console.log(`检测: ${lineJson.title} - ${lineJson.xmlUrl}`);
      
      // 尝试解析RSS源，检测是否有效
      const feed = await parser.parseURL(lineJson.xmlUrl);
      
      // 如果成功获取到RSS内容，则添加到有效源列表
      if (feed && feed.items && feed.items.length > 0) {
        validOpmlJson.push(lineJson);
        lineJson.status = 'active';
        console.log(`✓ 有效: ${lineJson.title}`);
      } else {
        lineJson.status = 'lost';
        console.log(`✗ 无效(无内容): ${lineJson.title}`);
      }
    } catch (err) {
      // 记录错误信息
      console.log(`✗ 错误: ${lineJson.title} - ${err.message}`);
    }
  }
  
  
  //保存opml.json
  const opmlJsonContent = opmlJson.map(
    ({ avatarUrl, description, category, ...rest }) => {
        return rest;
    }
  );
  fs.writeFileSync(opmlJsonPath, JSON.stringify(opmlJsonContent, null, 2), { encoding: 'utf-8' });

  // 保存有效的RSS源到单独的文件
  fs.writeFileSync(validOpmlJsonPath, JSON.stringify(validOpmlJson, null, 2), { encoding: 'utf-8' });
  fs.writeFileSync(validOpmlJsonPath2, JSON.stringify(validOpmlJson, null, 2), { encoding: 'utf-8' });
  console.log(`有效RSS源已保存到: ${validOpmlJsonPath} & ${validOpmlJsonPath2}`);
  console.log(`共 ${validOpmlJson.length} 个有效RSS源`);
  
  // 第二阶段：从有效RSS源获取内容
  console.log("开始从有效RSS源获取内容...");
  
  for (const lineJson of validOpmlJson) {
    try {
      // 读取 RSS 的具体内容
      const feed = await parser.parseURL(lineJson.xmlUrl);
      
      // 数组合并
      dataJson.push.apply(dataJson, feed.items.filter((item) => item.title && (item.content || item.summary) && item.pubDate).map((item) => {
        const pubDate = new Date(item.pubDate);
        let summary = item.summary ? item.summary : item.content;
        if (summary.length > maxSummaryLength) {
          summary = summary.substring(0, maxSummaryLength) + '...';
        }
        return {
          name: lineJson.title,
          xmlUrl: lineJson.xmlUrl,
          htmlUrl: lineJson.htmlUrl,
          title: item.title,
          link: item.link,
          summary: summary,
          pubDate: pubDate,
          pubDateYYMMDD: pubDate.toISOString().split('T')[0],
          pubDateYY: pubDate.toISOString().split('-')[0],
          pubDateMM: pubDate.toISOString().split('-')[1],
          pubDateDD: pubDate.toISOString().split('-')[2],
          pubDateMMDD: pubDate.toISOString().split('-')[1] + '-' + pubDate.toISOString().split('-')[2]
        }
      }));
      
      console.log(`✓ 已获取: ${lineJson.title} (${feed.items.length}篇文章)`);

    } catch (err) {
      // 如果这里出错，说明之前检测有效的源现在出问题了
      console.log(`✗ 获取内容失败: ${lineJson.title} - ${err.message}`);
    }
  }

  // 按时间顺序排序
  dataJson.sort((itemA, itemB) => itemA.pubDate < itemB.pubDate ? 1 : -1);
  // 默认为保存前 n 项的数据, 并保证不超过当前时间
  const curDate = new Date();
  const dataJsonSliced = dataJson.filter((item) => item.pubDate <= curDate).slice(0, Math.min(maxDataJsonItemsNumberForWeb, dataJson.length));
  fs.writeFileSync(dataJsonPath, JSON.stringify(dataJsonSliced, null, 2), { encoding: 'utf-8' });

  // 生成 RSS 文件

  for (let item of dataJsonSliced) {
    feed.item({
      title: item.title,
      description: item.summary,
      url: item.link, // link to the item
      author: item.name, // optional - defaults to feed author property
      date: item.pubDate.toISOString(), // any format that js Date can parse.
    });
  }

  // 保存 rss.xml 文件
  const rssXmlContent = feed.xml();
  fs.writeFileSync(rssXmlPath, rssXmlContent, { encoding: 'utf-8' });
  
  console.log("处理完成！");
  console.log(`共处理 ${dataJson.length} 篇文章，保存了 ${dataJsonSliced.length} 篇`);
  
})();
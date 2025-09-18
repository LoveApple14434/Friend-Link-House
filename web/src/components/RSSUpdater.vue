<template>
  <div class="rss-updater">
    <button @click="updateRSS" :disabled="updating" class="update-button">
      {{ updating ? '更新中...' : '更新 RSS 内容' }}
    </button>
    
    <div v-if="message" class="message" :class="{ error: isError }">
      {{ message }}
    </div>
    
    <div v-if="progress" class="progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script>
// 导入有效的 RSS 源列表
import validOpmlJson from '@/assets/valid-opml.json';

// 后端 API 地址
const API_BASE_URL = 'http://localhost:3001';

export default {
  name: 'RSSUpdater',
  emits: ['data-updated'],
  data() {
    return {
      updating: false,
      message: '',
      isError: false,
      progress: 0
    };
  },
  methods: {
    async updateRSS() {
      this.updating = true;
      this.message = '开始获取 RSS 内容...';
      this.isError = false;
      this.progress = 0;
      
      try {
        const sources = validOpmlJson;
        this.message = `找到 ${sources.length} 个 RSS 源，开始获取内容...`;
        
        const allArticles = [];
        const totalSources = sources.length;
        
        // 准备要获取的 URL 列表
        const urls = sources.map(source => source.xmlUrl);
        
        // 使用后端 API 批量获取 RSS 内容
        this.message = '正在通过后端API获取RSS内容...';
        
        const response = await fetch(`${API_BASE_URL}/api/rss/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ urls })
        });
        
        if (!response.ok) {
          throw new Error(`后端API请求失败: ${response.status}`);
        }
        
        const results = await response.json();
        
        // 处理获取结果
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const source = sources[i];
          
          // 更新进度
          this.progress = Math.round(((i + 1) / totalSources) * 100);
          this.message = `处理中: ${source.title} (${i + 1}/${totalSources})`;
          
          if (result.success) {
            const feed = result.data;
            
            if (feed && feed.items) {
              const articles = feed.items.map(item => {
                const title = item.title || '无标题';
                const link = item.link || '#';
                const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
                const description = item.content || item.summary || item.description || '';
                
                // 提取纯文本摘要（移除HTML标签）
                const summary = description.replace(/<[^>]*>/g, '');
                
                return {
                  name: source.title,
                  xmlUrl: source.xmlUrl,
                  htmlUrl: source.htmlUrl,
                  title,
                  link,
                  summary: summary.length > 400 ? summary.substring(0, 400) + '...' : summary,
                  pubDate: new Date(pubDate),
                  pubDateYYMMDD: new Date(pubDate).toISOString().split('T')[0]
                };
              });
              
              allArticles.push(...articles);
              this.message = `已处理 ${source.title} (${articles.length} 篇文章)`;
            } else {
              this.message = `无法获取 ${source.title} 的内容`;
              console.log(`无法获取 ${source.title} 的 RSS 内容`);
            }
          } else {
            this.message = `获取 ${source.title} 失败: ${result.error}`;
            console.error(`获取 ${source.title} 失败:`, result.error);
          }
        }
        
        // 按日期排序并限制数量
        allArticles.sort((a, b) => b.pubDate - a.pubDate);
        const now = new Date();
        const filteredArticles = allArticles
          .filter(item => item.pubDate <= now)
          .slice(0, 40);
        
        // 保存到 localStorage
        localStorage.setItem('rssData', JSON.stringify(filteredArticles));
        
        this.progress = 100;
        this.message = `更新完成! 共获取 ${filteredArticles.length} 篇文章`;
        
        // 触发事件通知父组件数据已更新
        this.$emit('data-updated', filteredArticles);
        
      } catch (error) {
        this.message = `更新失败: ${error.message}`;
        this.isError = true;
        console.error('RSS 更新错误:', error);
      } finally {
        this.updating = false;
        // 2秒后清除进度条
        setTimeout(() => {
          this.progress = 0;
        }, 2000);
      }
    }
  }
};
</script>

<style scoped>
.rss-updater {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
}

.update-button {
  padding: 0.5rem 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.update-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #e3f2fd;
  font-size: 0.9rem;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
}

.progress {
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #42b883;
  transition: width 0.3s ease;
}
</style>
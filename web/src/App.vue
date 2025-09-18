<script setup>
import BlogInfoCard from "./components/BlogInfoCard.vue";
import RSSUpdater from "./components/RSSUpdater.vue"; // 导入 RSS 更新组件
import { ref, onMounted } from 'vue';

// 使用响应式数据
const dataJson = ref([]);
const opmlJson = ref([]);
const title = ref("LoveApple");
const info = ref("仅收录友链博客文章，不代表本人观点");
const list = ref("友链列表");

// 从 localStorage 或 data.json 加载数据
const loadData = async () => {
  try {
    // 尝试从 localStorage 加载数据
    const storedData = localStorage.getItem('rssData');
    // if (storedData) {
    //   dataJson.value = JSON.parse(storedData);
    //   console.log('数据已从 localStorage 加载');
    // } else {
    //   // 如果没有 localStorage 数据，加载默认的 data.json
    //   const response = await fetch('./assets/data.json');
    //   if (response.ok) {
    //     dataJson.value = await response.json();
    //     console.log('数据已从 data.json 加载');
    //   } else {
    //     console.error('无法加载 data.json');
    //     dataJson.value = [];
    //   }
    // }
    if (!storedData) {
      // 优先加载data.json
      const response = await fetch('./data.json');
      if (response.ok && response.value!==null) {
        dataJson.value = await response.json();
        console.log('数据已从 data.json 加载');
        console.log(dataJson);
      } else {
        console.error('无法加载 data.json');
        dataJson.value = [];
      }
    } else {
      //如果没有的话再加载localStorage
      dataJson.value = JSON.parse(storedData);
      console.log('数据已从 localStorage 加载');
      console.log(dataJson);
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    dataJson.value = [];
  }
};

// 加载 opml.json
const loadOpmlData = async () => {
  try {
    const response = await fetch('./opml.json');
    if (response.ok) {
      opmlJson.value = await response.json();
      console.log('数据已从opml.json加载');
      console.log(opmlJson.value);
    } else {
      console.error('无法加载 opml.json');
      opmlJson.value = [];
    }
  } catch (error) {
    console.error('加载 opml.json 失败:', error);
    opmlJson.value = [];
  }
};

// 处理数据更新事件
const handleDataUpdated = (newData) => {
  dataJson.value = newData;
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
  loadOpmlData();
  
  // 原有的图片加载代码
  var imgs = document.getElementsByTagName("img");
  for (var i = 0; i < imgs.length; i++) {
    if (imgs[i].dataset.src) {
      imgs[i].src = imgs[i].dataset.src;
    }
  }
});
</script>

<template>
  <header id="header">
    <div id="header-inner">
      <a
        id="logo-left"
        target="_blank"
        href="https://loveapple.icu"
      >
        <img id="logo" src="./assets/logo.jpg" alt="Logo" />
        <span id="logo-text">{{ title }}</span>
      </a>
      
      <a
        id="logo-right"
        target="_blank"
        href="https://github.com/LoveApple14434/Friend-Link-House"
      >
        <img id="logo-github" src="./assets/github.png" alt="Logo" />
        <span id="logo-text">GitHub</span>
      </a>
    </div>
    <div id="updater">
      <!-- 添加 RSS 更新组件 -->
      <RSSUpdater @data-updated="handleDataUpdated" />
    </div>
    <div id="banner">{{ info }}</div>
  </header>
  <div id="container">
    <main>
      <div id="main">
        <section class="timeline" id="archives" v-if="dataJson.length > 0">
          <time class="timeline-item timeline-item__year"
            >&#160&#160{{ dataJson[0].pubDateYY }}年{{ dataJson[0].pubDateMM }}月</time
          >
          <div v-for="(item, index) in dataJson" :key="item.link">
            <article class="timeline-item">
              <time class="timeline-item__time"> {{ item.pubDateMMDD }}</time>
              <h2 class="timeline-item__title">
                <a
                  class="timeline-item__link"
                  :href="item.link"
                  target="_blank"
                  >{{ item.title }}</a
                >
                <a class="summary-name" :href="item.htmlUrl" target="_blank">{{
                  item.name
                }}</a>
              </h2>
            </article>
            <time
              class="timeline-item timeline-item__year"
              v-if="
                index != dataJson.length - 1 &&
                item.pubDateMM != dataJson[index + 1].pubDateMM
              "
              >&#160&#160{{ dataJson[index + 1].pubDateYY }}年{{
                dataJson[index + 1].pubDateMM
              }}月</time
            >
          </div>
        </section>
        
        <!-- 空状态提示 -->
        <div v-else class="empty-state">
          <p>暂无内容</p>
          <p>请点击上方的"更新 RSS 内容"按钮获取最新内容</p>
        </div>
      </div>
    </main>

    <aside>
      <div id="sidebar">
        <div id="sidebar-content">
          <div class="list">{{ list }}</div>
          <template v-for="(item, index) in opmlJson">
            <BlogInfoCard
              :props="item"
              :key="index"
              v-if="item['status'] == 'active' && item['xmlUrl'] != ''"
            />
          </template>
          <template v-for="(item, index) in opmlJson">
            <BlogInfoCard
              :props="item"
              :key="index"
              v-if="item['status'] == 'active' && item['xmlUrl'] == ''"
            />
          </template>
          <template v-for="(item, index) in opmlJson">
            <BlogInfoCard
              :props="item"
              :key="index"
              v-if="item['status'] == 'lost' && item['xmlUrl'] != ''"
            />
          </template>
          <template v-for="(item, index) in opmlJson">
            <BlogInfoCard
              :props="item"
              :key="index"
              v-if="item['status'] == 'lost' && item['xmlUrl'] == ''"
            />
          </template>
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // TODO: 需修改的页面配置
      title: "LoveApple",
      info: "仅收录友链博客文章，不代表本人观点",
      list: "友链列表",
    };
  },
  mounted() {
    var imgs = document.getElementsByTagName("img");
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].dataset.src) {
        imgs[i].src = imgs[i].dataset.src;
      }
    }
  },
};
</script>

<style>
@import "./assets/base.css";

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.timeline {
  position: relative;
  margin-left: 1rem;
  margin-top: 1rem;
  margin-right: 1rem;
}

.timeline:before {
  content: "";
  position: absolute;
  top: 1em;
  bottom: 1em;
  left: 0;
  border-left: 0.2rem solid #efefef;
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);
  -o-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5em;
  margin-left: 10px;
  display: -webkit-box;
  display: -moz-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -moz-box-orient: horizontal;
  -o-box-orient: horizontal;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-align: center;
  -moz-box-align: center;
  -o-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  min-height: 1rem;
  /* height: 2.5rem; */
  background-color: white;
  border-radius:8px;
}

.timeline-item__time {
  margin-left: 1.8em;
  display: inline-block;
  width: 3.5rem;
  vertical-align: middle;
  color: #99a9bf;
  -webkit-transform: translateY(3%);
  -moz-transform: translateY(3%);
  -o-transform: translateY(3%);
  -ms-transform: translateY(3%);
  transform: translateY(3%);
}

.timeline-item__year {
  font-size: 1.2rem;
}

.timeline-item__title {
  display: inline-block;
  margin: 1em;
  width: calc(100% - 4.5rem);
  font-size: 1em;
  font-weight: normal;
  vertical-align: middle;
}
 
.timeline-item__link {
  color: #2c323c;
}

.summary-name {
  display: inline;
  color: grey;
  margin-right: 1.5rem;
  float: right;
}

.info {
  color: grey;
}
</style>
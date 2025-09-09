<script setup>
import BlogInfoCard from "./components/BlogInfoCard.vue";
import dataJson from "./assets/data.json";
import opmlJson from "./assets/opml.json";
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
    <div id="banner">{{ info }}</div>
  </header>

  <div id="container">
    <main>
      <div id="main">
        <section class="timeline" id="archives">
          <time class="timeline-item timeline-item__year"
            >&#160&#160{{ dataJson[0].pubDateYY }}年{{ dataJson[0].pubDateMM }}月</time
          >
          <div v-for="(item, index) in dataJson">
            <article class="timeline-item">
              <!-- <SummaryCard :props="item" /> -->
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
  min-height: 1.2rem;
  height: 2.5rem;
  background-color: white;
  border-radius:8px;
}

/* .timeline-item:before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  border-radius: 50%;
  width: 0.3rem;
  height: 0.3rem;
  background-color: #7b8a8b;
  -webkit-transition: background-color 0.2s ease;
  -moz-transition: background-color 0.2s ease;
  -o-transition: background-color 0.2s ease;
  -ms-transition: background-color 0.2s ease;
  transition: background-color 0.2s ease;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
} */

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
  /* font-size: medium;
  border-radius: 5px;
  color: #fff;
  padding: 3px;
  background-color: #bbb; */
  /* margin-right: 5px;
  margin-bottom: 5px; */
  color: grey;
  margin-right: 1.5rem;
  float: right;
}

.info {
  color: grey;
}
</style>

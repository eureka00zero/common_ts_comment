<template>
  <div id="app">
    <!-- <quick-reply-card :data="fakeData" :config="fakeData" />
    <loadmore-card :data="fakeData" :config="fakeData"/>
    <fake-pub-card :data="fakeData" :config="fakeData"/>
    <normal-card :data="fakeData" :config="fakeData"/> -->
    <cmnt-list :top-layer="topLayer" :sec-layer="secLayer" :user-info="userInfo" :agreed-list="agreedList" :config="config"  ref="cmnt"></cmnt-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HelloWorld from './view/demo/HelloWorld.vue';
import quickReplyCard from './components/quickReplyCard.vue';
import loadmoreCard from './components/loadmoreCard.vue';
import fakePubCard from './components/fakePubCard.vue';
import NormalCard from './components/normalCard.vue';
import cmntList from './components/cmntList.vue';
import './css/cmnt.css';

import {
  list1 as fakeData1,
  list2 as fakeData2,
  secCMNT,
  secLoadmore,
  topLoadmore
} from "./fakeData"

export default Vue.extend({
  name: 'app',
  data() {
    return {
        topLayer: fakeData1,
        secLayer: secCMNT,
        userInfo: {
        uid: "1706126015",
        nick: 'ohjbdfwkbhje',
        profile_img: "http://tvax2.sinaimg.cn/crop.0.0.736.736.50/65b16abfly8fe6zd2lsofj20kg0kgdhj.jpg"
        },
        agreedList: ['5AE1E0F1-ADE180B-7A300FC9-7CD-87B','5AE31599-3D879887-65B16ABF-7CD-85B'],
        config: {
            autoScroll: 1,
            loadmoreThreshold: 300,
            showName: '回帖',
            fakePublishText: '假发布文案'
        },
        isHot: 1,
        loadmoreTimes: 1
    };
  },
  
  components: {
    HelloWorld,
    quickReplyCard,
    loadmoreCard,
    fakePubCard,
    NormalCard,
    cmntList,
  },
});
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

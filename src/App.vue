<template>
  <div id="app">
    <img src="./assets/logo.png">
    <quick-reply-card :data="fakeData" :config="fakeData" />
    <loadmore-card :data="fakeData" :config="fakeData"/>
    <fake-pub-card :data="fakeData" :config="fakeData"/>
    <normal-card :data="fakeData" :config="fakeData"/>
    <cmnt-list/>
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

export default Vue.extend({
  name: 'app',
  data() {
    return {
        fakeData: {
            userImg: '',
        },
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

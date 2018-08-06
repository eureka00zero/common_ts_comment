<template>
  <aside class='post_return_case' @click='hideReport($event)'>
    <component v-for='(item, index) in fakePublishList' :key='item.__type + index' :is='cardTypeMap[item.__type]' :config='config' 
    :data='item' @do-showall='doShowall' @do-imgclick='doImgclick'></component>
    <component v-for='(item, index) in cmntArray' :key='index' :is='cardTypeMap[item.__type]' 
    :data='item' :config='config' @do-praise='doPraise' @do-reply='doReply' @do-report='doReport' 
    @do-showall='doShowall' @do-imgclick='doImgclick' @do-sec-loadmore='doSecLoadmore' @show-report='showReport' 
    @close-report='closeReport'></component>
    <div v-if='this.loadmoreThreshold' class='cm_loading' :class='{'hide': !topLoadmoreLock || noMoreCMNT}'>
      <img class='img_width' src='../img/loading.gif' />加载中...
    </div>
  </aside>
</template>
<script lang='ts'>
import Vue from 'vue';
import VueTouch from '../import/vueTouch';
import lodashThrottle from '../import/lodash';
import lodashCloneDeep from '../import/lodash';

import NormalCard from './normalCard.vue';
import QuickCard from './quickReplyCard.vue';
import LoadmoreCard from './loadmoreCard.vue';
import FakePubCard from './fakePubCard.vue';


import '../css/cmnt.css';
import {
  formatAllData,
  showNumFormat,
  mergeSecData,
  addSecSpecData,
  formatFakeData
} from './formatter';
const cardTypeMap = {
  normalCard: 'normal-card',
  quickReplyCard: 'quick-card',
  loadmoreCard: 'loadmore-card',
  fakePubCard: 'fake-pub-card'
};
const elasticDistance = 50;
Vue.use(VueTouch, { name: 'v-touch' });
export default Vue.extend({
  name: 'cmntList',
  props: {
    topLayer: {
      type: Array,
    },
    secLayer: {
      type: Object,
    },
    userInfo: {
      type: Object,
    },
    agreedList: {
      type: Array,
    },
    // loadmoreThreshold: {
    //   type: Number
    // },
    // autoScroll: {},
    config: {
      type: Object,
    },
  },
  data() {
    return {
      cardTypeMap: Object.assign({}, cardTypeMap),
      cmntArray: [],
      topLoadmoreLock: false,
      noMoreCMNT: false,
      fakePublishList: [],
      loadmoreThreshold: 0,
      localAutoScroll:1,
      localTopArray:{},
      localSecObject:{},
      localUserInfo:{},
      localAgreedList:[],
      config:{},
    };
  },
  created() {
    const config = this.config || {};
    if (config.autoScroll == undefined) {
      this.localAutoScroll = 1;
    } else {
      this.localAutoScroll = config.autoScroll;
    }
    if (config.loadmoreThreshold == undefined) {
      this.loadmoreThreshold = 300;
    } else {
      this.loadmoreThreshold = config.loadmoreThreshold;
    }

    // 存储数据
    this.localSecObject = lodashCloneDeep(this.secLayer);
    this.localTopArray = lodashCloneDeep(this.topLayer);
    this.localUserInfo = lodashCloneDeep(this.userInfo) || {};
    this.localAgreedList = lodashCloneDeep(this.agreedList) || [];

    this._initSpecData();

    // 获取格式化后的渲染数据
    this.cmntArray = formatAllData(
      this.localTopArray,
      this.localSecObject,
      this.localUserInfo,
      this.localAgreedList
    );

    // 加载更多解锁
    this.topLoadmoreLock = false;
    // 已无更多数据
    this.noMoreCMNT = false;
  },
  mounted() {
    if (this.loadmoreThreshold) {
      this._initEventListener();
    }
  },
  beforeDestroy() {
    this._lodashWrapper &&
      window.removeEventListener('scroll', this._lodashWrapper);
  },
  methods: {
    doPraise(info) {
      info = info || { data: {}, status: 0 };
      // 存储点赞信息
      // info.data.mid && this.praiseSet.add(info.data.mid);
      // 点赞动画
      info.data.__doPraise = 1;
      // 更新点赞数量 更新点赞背景色
      if (!info.status) {
        this.localAgreedList.push(info.data.mid);
        info.data.agree = info.data.agree + 1;
        info.data.__showAgree = showNumFormat(info.data.agree);
        info.data.__hot = parseInt(info.data.agree, 10) > 49; // 热门评论 特殊背景颜色样式
      }
      this.$emit('cmnt-do-praise', info);
    },
    doReply(info) {
      this.$emit('cmnt-do-reply', info);
    },
    doReport(info) {
      this.$emit('cmnt-do-report', info);
    },
    doShowall(info) {
      info.data.__showEllipsis = 0;
      this.$emit('cmnt-do-showall', info);
    },
    doImgclick(info) {
      this.$emit('cmnt-do-imgclick', info);
    },
    doSecLoadmore(info) {
      let mid = info.data.mid;
      let page =
        (this.localSecObject[mid] && this.localSecObject[mid].__page) || 1;
      info.page = page;
      info.data.__showLoading = 1; // 添加loading
      this.localSecObject[mid].__loading = 1; // 保存状态
      this.$emit('cmnt-do-sec-loadmore', info, this._secLoadmore);
    },
    doTopLoadmore() {
      if (!this.topLoadmoreLock) {
        let emitData = { data: {}, page: this.topLayerPage };
        this.topLoadmoreLock = true;
        this.$emit('cmnt-do-top-loadmore', emitData, this._topLoadmore);
      }
    },
    showReport(info) {
      this._closeAllReport();
      info.data.__showReport = 1;
    },
    closeReport(info) {
      this._closeAllReport();
    },
    hideReport(e) {
      let target = e.target || e.srcElement;
      if (!target.className.match('post_return_reply')) {
        this._closeAllReport();
      }
    },
    refreshAllCMNT(data) {
      let { topLayer, secLayer, userInfo } = data;

      // 清除假发布
      this.fakePublishList = [];

      // 剔除所有旧数据 点赞状态
      this.cmntArray.forEach(cmnt => {
        cmnt.__doPraise = 0;
      });

      this.localSecObject = lodashCloneDeep(secLayer);
      this.localTopArray = lodashCloneDeep(topLayer);

      this._initSpecData();

      userInfo && (this.localUserInfo = lodashCloneDeep(userInfo));

      // 添加点赞状态
      // 如果直接在格式化时处理 在列表切换时 切换前后都有点赞状态的节点没动效 显示效果不统一
      setTimeout(() => {
        this.cmntArray = formatAllData(
          this.localTopArray,
          this.localSecObject,
          this.localUserInfo,
          this.localAgreedList
        );
      }, 10);
    },
    updateUserInfo(userInfo) {
      userInfo = userInfo || {};
      this.localUserInfo = lodashCloneDeep(userInfo);
      this.cmntArray = formatAllData(
        this.localTopArray,
        this.localSecObject,
        this.localUserInfo,
        this.localAgreedList
      );
    },
    fakePublish(data) {
      // 是否需要更新已点赞信息
      // 对评论的假发布会默认更新，因为本身就会更新真实评论列表。
      // 对文章的假发布会利用此变量进行检测 避免额外运算
      // let needUpdateAgreedList = 0;

      // 理论上只有发生评论时才可能有发生用户信息变更（未登录 => 登录）
      if (data.userInfo) {
        this.localUserInfo = lodashCloneDeep(data.userInfo);
      }
      // 理论上只有发生评论时才可能有点赞信息变更（未登录 => 登录）
      // if (data.agreedList) {
      //   if (this.localAgreedList.join(',') !== data.agreedList.join(',')) {
      //     this.localAgreedList = lodashCloneDeep(data.agreedList);
      //     needUpdateAgreedList = 1;
      //   }
      // }
      if (!this.localUserInfo.nick) {
        // 无用户信息 返回
        console.log('Err， 没有登录用户信息， 不进行假发布');
        return;
      }
      if (!data.fakeData) {
        console.log('Err， 没有假发布数据， 不进行假发布');
        return;
      }
      if (data.target && data.target.mid) {
        // 对评论的假发布
        let localSecFakeData = lodashCloneDeep(data.fakeData);
        localSecFakeData.parent_uid = data.target.uid;
        localSecFakeData.parent_nick = data.target.nick;
        let localSecObjectMid;
        if (data.target.thread) {
          // 对二级评论的假发布
          localSecObjectMid = data.target.thread;
          if (!this.localSecObject[localSecObjectMid]) {
            // 异常情况 本身没有二级评论 还是有对二级评论的假发布
            console.log('Error, 对二级评论的假发布，却本身没有二级评论');
            return;
          }
        } else {
          // 对一级评论的假发布
          localSecObjectMid = data.target.mid;
          if (!this.localSecObject[localSecObjectMid]) {
            // 原本就没有评论 添加一条假的回复
            this.localSecObject[data.target.mid] = {};
          }
        }
        this.localSecObject[localSecObjectMid]['fakeList'] =
          this.localSecObject[localSecObjectMid]['fakeList'] || [];
        this.localSecObject[localSecObjectMid]['fakeList'].unshift(
          localSecFakeData
        );

        this.cmntArray = formatAllData(
          this.localTopArray,
          this.localSecObject,
          this.localUserInfo,
          this.localAgreedList
        );

        let childrenNums = this.$children.length;
        let targetEl;
        for (let i = 0; i < childrenNums; i++) {
          if (localSecObjectMid === this.$children[i].data.mid) {
            targetEl = this.$children[i].$el;
            break;
          }
        }
        this.localAutoScroll &&
          targetEl &&
          this._pageScroll(targetEl.offsetTop - elasticDistance);
      } else {
        // 对文章的假发布
        let localFakeData = lodashCloneDeep(data.fakeData);
        formatFakeData(localFakeData, this.localUserInfo);
        this.fakePublishList.unshift(localFakeData);

        // // 如果需更新点赞信息
        // if (needUpdateAgreedList) {
        //   this.cmntArray = formatAllData(
        //     this.localTopArray,
        //     this.localSecObject,
        //     this.localUserInfo,
        //     this.localAgreedList
        //   );
        // }

        this.localAutoScroll &&
          this._pageScroll(this.$el.offsetTop - elasticDistance);
      }
    },
    /**
     * 初始化特殊数据
     * 二级评论：加载更多页码 & 加载更多状态
     * 一级评论：加载更多页码
     */
    _initSpecData() {
      for (let mid in this.localSecObject) {
        addSecSpecData(this.localSecObject[mid]);
      }
      this.topLayerPage = 2; // 默认加载更多从第二屏开始
    },
    _closeAllReport() {
      this.cmntArray.forEach(cmnt => {
        cmnt.__showReport = 0;
      });
    },
    _secLoadmore(data) {
      let { secLayer, userInfo } = data;
      if (userInfo) {
        this.localUserInfo = lodashCloneDeep(userInfo);
      }
      this.localSecObject = mergeSecData(this.localSecObject, secLayer, 1);
      this.cmntArray = formatAllData(
        this.localTopArray,
        this.localSecObject,
        this.localUserInfo,
        this.localAgreedList
      );
    },
    _topLoadmore(data) {
      let { topLayer, secLayer, userInfo } = data;
      if (userInfo) {
        this.localUserInfo = lodashCloneDeep(userInfo);
      }
      if (topLayer && topLayer.length) {
        this.topLoadmoreLock = false; // 允许加载更多
        this.topLayerPage++; // 更新页码
        this.localTopArray = this.localTopArray.concat(topLayer);
        this.localSecObject = mergeSecData(this.localSecObject, secLayer);

        this.cmntArray = formatAllData(
          this.localTopArray,
          this.localSecObject,
          this.localUserInfo,
          this.localAgreedList
        );
      } else {
        this.noMoreCMNT = true; // 已无更多评论
        this.topLoadmoreLock = true; // 禁止加载更多
      }
    },
    _initEventListener() {
      this._lodashWrapper = lodashThrottle(this._checkLoadmore, 300);
      window.addEventListener('scroll', this._lodashWrapper);
    },
    _checkLoadmore() {
      // 视区高
      let clientH = document.documentElement.clientHeight || window.innerHeight;
      // 文档高
      let offsetH =
        document.documentElement.scrollHeight || document.body.offsetHeight;
      // 滚动高
      let scrollT =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollT + clientH + this.loadmoreThreshold < offsetH) {
        return;
      }
      this.doTopLoadmore();
    },
    _pageScroll(y) {
      let to = y;
      let step;
      let times = 0;
      let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

      window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

      let distance = to - scrollTop;
      let absDistance = Math.abs(distance);

      if (absDistance < 10000) {
        step = distance / 20;
      } else if (absDistance < 20000) {
        step = distance / 40;
      } else {
        step = distance / 50;
      }

      function move() {
        times++;
        scrollTop += step;
        window.scrollTo(0, scrollTop);
        if (
          (step > 0 && scrollTop <= to - 3) ||
          (step < 0 && scrollTop >= to + 3)
        ) {
          requestAnimationFrame(move);
        }
      }
      requestAnimationFrame(move);
    }
  },
  updated() {
    // 添加点赞状态
    // 如果直接在格式化时处理 在列表切换时 切换前后都有点赞状态的节点没动效 显示效果不统一
    // console.log('updated');
    // setTimeout(() => {
    //   this.cmntArray.forEach(newItem => {
    //     if (newItem.mid && this.praiseSet.has(newItem.mid)) {
    //       newItem.__doPraise = 1;
    //     } else {
    //       newItem.__doPraise = 0;
    //     }
    //   });
    // }, 10);
  },
  components: {
    NormalCard,
    QuickCard,
    LoadmoreCard,
    FakePubCard
  }
});
</script>


<template>
  <aside class='post_return_case' @click='hideReport($event)'>
    <component v-for='(item, index) in fakePublishList' :key='item.__type + index' :is='cardTypeMap[item.__type]' :config='config' 
    :data='item' @do-showall='doShowall' @do-imgclick='doImgclick'></component>
    <component v-for='(item, index) in cmntArray' :key='index' :is='cardTypeMap[item.__type]' 
    :data='item' :config='config' @do-praise='doPraise' @do-reply='doReply' @do-report='doReport' 
    @do-showall='doShowall' @do-imgclick='doImgclick' @do-sec-loadmore='doSecLoadmore' @show-report='showReport' 
    @close-report='closeReport'></component>
    <div v-if='this.loadmoreThreshold' class='cm_loading' :class="{'hide': !topLoadmoreLock || noMoreCMNT}">
      <img class='img_width' src='../img/loading.gif' />加载中...
    </div>
  </aside>
</template>
<script lang='ts'>
import Vue from 'vue';
import $ from "../import/utils";
import {Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from 'vue-class-component';
import VueTouch from '../import/vueTouch';
import {throttle,cloneDeep} from "lodash";


import quickCard from './quickReplyCard.vue';
import loadmoreCard from './loadmoreCard.vue';
import fakePubCard from './fakePubCard.vue';
import normalCard from './normalCard.vue';


import '../css/cmnt.css';
import {
  formatAllData,
  showNumFormat,
  mergeSecData,
  addSecSpecData,
  formatFakeData,
  newToOld,
} from './formatter';
const cardTypeMap = {
  normalCard: 'normal-card',
  quickReplyCard: 'quick-card',
  loadmoreCard: 'loadmore-card',
  fakePubCard: 'fake-pub-card',
};
const elasticDistance = 50;
// Vue.use(VueTouch, { name: 'v-touch' });
@Component({
 components: {
    normalCard,
    quickCard,
    loadmoreCard,
    fakePubCard,
  },
})
export default class CmntList extends Vue {
    @Prop()
    public topLayer: any[]
    @Prop()
    public secLayer: object
    @Prop()
    public userInfo: object
    @Prop()
    public agreedList: any[]
    @Prop()
    public config: any
    @Prop()
    public newData: any[]
    @Provide()
        public cardTypeMap: any = Object.assign({}, cardTypeMap);
        public cmntArray: any[] = [];
        public topLoadmoreLock: boolean = false;
        public noMoreCMNT: boolean = false;
        public fakePublishList: any[] = [];
        public loadmoreThreshold: number = 0;
        public localAutoScroll: number = 1;
        public localTopArray: any = {};
        public localNewList: any[] = [];
        public localSecObject: any = {};
        public localUserInfo: any = {};
        public localAgreedList: any[] = [];
        public _lodashWrapper: any = {};
        public topLayerPage: number = 0;

  public created() {
      //console.log(this.newData);
    // $.ajax({
    //   url: "http://newsapi.sina.cn/?resource=comment/baseInfo&abt=229_155_191_231_141_16_13_181_24_237_203_280_241_31_128_149_49_185_135_249_171_189_113_207_18_253_143_198_255_21_38_55_217_29_222_315_147_46_223_169_187_111&abver=15266265966871&accessToken=2.00_GvkMCe3vYNC2a4780f223v_JTNB&authGuid=6400365289703266036&authToken=8c2a73728cb7c884de845005857d4895&chwm=3023_0001&city=WMXX2971&connectionType=2&deviceId=aa42ca3e6b239c68f02e5270b2beaaa31c6c98dc&deviceModel=apple-iphone8&from=6068793012&idfa=2D0A0A26-7096-45C6-A9A7-6925B8CD2472&idfv=4AAAEF04-4B44-448D-B693-05C9934F1ED1&imei=aa42ca3e6b239c68f02e5270b2beaaa31c6c98dc&location=40.041654%2C116.275813&osVersion=11.3&resolution=750x1334&seId=eecac04b74&ua=apple-iphone8__SinaNews__6.8.7__iphone__11.3&unicomFree=0&weiboSuid=77c1b3af42&weiboUid=2020764283&wm=b207&rand=896&urlSign=c33fcd39e6&commentId=comos-haturfs2178122_0_yl__haturfs2178122-comos-ent-cms&hotCount=5&postt=news_news_ent_feed_5",
    //   type: "GET",
    //   success: (res: any) => {
    //     //设置数据
    //     if (res != null) {
    //       console.log(res.data)
    //     }
    //   },
    //   error: function(err: Error) {}
    // });


    console.log(this.newData)
    let resultData = newToOld(this.newData)
    const config = this.config || {};
    if (config.autoScroll === undefined) {
      this.localAutoScroll = 1;
    } else {
      this.localAutoScroll = config.autoScroll;
    }
    if (config.loadmoreThreshold === undefined) {
      this.loadmoreThreshold = 300;
    } else {
      this.loadmoreThreshold = config.loadmoreThreshold;
    }

    // 存储数据
    console.log(resultData);
    this.localSecObject = cloneDeep(resultData.secLayer);
    this.localTopArray = cloneDeep(resultData.topLayer);
    this.localUserInfo = cloneDeep(this.userInfo) || {};
    this.localAgreedList = cloneDeep(this.agreedList) || [];
    this.localNewList = cloneDeep(this.newData) || [];

    this._initSpecData();

    // 获取格式化后的渲染数据
    this.cmntArray = formatAllData(
      this.localTopArray,
      this.localSecObject,
      this.localUserInfo,
      this.localAgreedList,
    );

    // 加载更多解锁
    this.topLoadmoreLock = false;
    // 已无更多数据
    this.noMoreCMNT = false;
  }
  public mounted() {
    if (this.loadmoreThreshold) {
      this._initEventListener();
    }
  }
  public beforeDestroy() {
    this._lodashWrapper &&
      window.removeEventListener('scroll', this._lodashWrapper);
  }
    public doPraise(info: any) {
        console.log(info);
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
    }
    public doReply(info: any) {
        this.$emit('cmnt-do-reply', info);
    }
    public doReport(info: any) {
        this.$emit('cmnt-do-report', info);
    }
    public doShowall(info: any) {
        info.data.__showEllipsis = 0;
        this.$emit('cmnt-do-showall', info);
    }
    public doImgclick(info: any) {
        this.$emit('cmnt-do-imgclick', info);
    }
    public doSecLoadmore(info: any) {
        const mid = info.data.mid;
        const page =
        (this.localSecObject[mid] && this.localSecObject[mid].__page) || 1;
        info.page = page;
        info.data.__showLoading = 1; // 添加loading
        this.localSecObject[mid].__loading = 1; // 保存状态
        this.$emit('cmnt-do-sec-loadmore', info, this._secLoadmore);
    }
    public doTopLoadmore() {
        if (!this.topLoadmoreLock) {
        const emitData = { data: {}, page: this.topLayerPage };
        this.topLoadmoreLock = true;
        this.$emit('cmnt-do-top-loadmore', emitData, this._topLoadmore);
        }
    }
    public showReport(info: any) {
        this._closeAllReport();
        info.data.__showReport = 1;
    }
    public closeReport(info: any) {
        this._closeAllReport();
    }
    public hideReport(e: any) {
        const target = e.target || e.srcElement;
        if (!target.className.match('post_return_reply')) {
        this._closeAllReport();
        }
    }
    public refreshAllCMNT(data: any) {
        const { topLayer, secLayer, userInfo } = data;

        // 清除假发布
        this.fakePublishList = [];

        // 剔除所有旧数据 点赞状态
        this.cmntArray.forEach((cmnt) => {
        cmnt.__doPraise = 0;
        });

        this.localSecObject = cloneDeep(secLayer);
        this.localTopArray = cloneDeep(topLayer);

        this._initSpecData();

        userInfo && (this.localUserInfo = cloneDeep(userInfo));

        // 添加点赞状态
        // 如果直接在格式化时处理 在列表切换时 切换前后都有点赞状态的节点没动效 显示效果不统一
        setTimeout(() => {
        this.cmntArray = formatAllData(
            this.localTopArray,
            this.localSecObject,
            this.localUserInfo,
            this.localAgreedList,
        );
        }, 10);
    }
    public updateUserInfo(userInfo: any) {
        userInfo = userInfo || {};
        this.localUserInfo = cloneDeep(userInfo);
        this.cmntArray = formatAllData(
        this.localTopArray,
        this.localSecObject,
        this.localUserInfo,
        this.localAgreedList,
        );
    }
    public fakePublish(data: any) {
        // 是否需要更新已点赞信息
        // 对评论的假发布会默认更新，因为本身就会更新真实评论列表。
        // 对文章的假发布会利用此变量进行检测 避免额外运算
        // let needUpdateAgreedList = 0;

        // 理论上只有发生评论时才可能有发生用户信息变更（未登录 => 登录）
        if (data.userInfo) {
        this.localUserInfo = cloneDeep(data.userInfo);
        }
        // 理论上只有发生评论时才可能有点赞信息变更（未登录 => 登录）
        // if (data.agreedList) {
        //   if (this.localAgreedList.join(',') !== data.agreedList.join(',')) {
        //     this.localAgreedList = cloneDeep(data.agreedList);
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
        const localSecFakeData = cloneDeep(data.fakeData);
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
        this.localSecObject[localSecObjectMid].fakeList =
            this.localSecObject[localSecObjectMid].fakeList || [];
        this.localSecObject[localSecObjectMid].fakeList.unshift(
            localSecFakeData,
        );

        this.cmntArray = formatAllData(
            this.localTopArray,
            this.localSecObject,
            this.localUserInfo,
            this.localAgreedList,
        );

        const childrenNums = this.$children.length;
        let targetEl;
        for (let i = 0; i < childrenNums; i++) {
            if (localSecObjectMid === this.$children[i].$data.mid) {
            targetEl = this.$children[i].$el;
            break;
            }
        }
        this.localAutoScroll &&
            targetEl &&
            this._pageScroll(targetEl.offsetTop - elasticDistance);
        } else {
        // 对文章的假发布
        const localFakeData = cloneDeep(data.fakeData);
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
    }
    /**
     * 初始化特殊数据
     * 二级评论：加载更多页码 & 加载更多状态
     * 一级评论：加载更多页码
     */
    public _initSpecData() {
        for (const mid in this.localSecObject) {
            if (this.localSecObject.hasOwnProperty(mid)) {
             addSecSpecData(this.localSecObject[mid]);
            }
        }
        this.topLayerPage = 2; // 默认加载更多从第二屏开始
    }
    public _closeAllReport() {
        this.cmntArray.forEach((cmnt) => {
        cmnt.__showReport = 0;
        });
    }
    public _secLoadmore(data: any) {
        const { secLayer, userInfo } = data;
        if (userInfo) {
        this.localUserInfo = cloneDeep(userInfo);
        }
        this.localSecObject = mergeSecData(this.localSecObject, secLayer, 1);
        this.cmntArray = formatAllData(
        this.localTopArray,
        this.localSecObject,
        this.localUserInfo,
        this.localAgreedList,
        );
    }
    public _topLoadmore(data: any) {
        const { topLayer, secLayer, userInfo } = data;
        if (userInfo) {
        this.localUserInfo = cloneDeep(userInfo);
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
            this.localAgreedList,
        );
        } else {
        this.noMoreCMNT = true; // 已无更多评论
        this.topLoadmoreLock = true; // 禁止加载更多
        }
    }
    public _initEventListener() {
        this._lodashWrapper = throttle(this._checkLoadmore, 300);
        window.addEventListener('scroll', this._lodashWrapper);
    }
    public _checkLoadmore() {
        // 视区高
        const clientH = document.documentElement.clientHeight || window.innerHeight;
        // 文档高
        const offsetH =
        document.documentElement.scrollHeight || document.body.offsetHeight;
        // 滚动高
        const scrollT =
        document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollT + clientH + this.loadmoreThreshold < offsetH) {
        return;
        }
        this.doTopLoadmore();
    }
    public _pageScroll(y: number) {
        const to = y;
        let step: number;
        let times = 0;
        let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

        window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame;

        const distance = to - scrollTop;
        const absDistance = Math.abs(distance);

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
  public updated() {
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
  }
}
</script>


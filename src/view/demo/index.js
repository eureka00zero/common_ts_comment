/**
 * 玲珑评论组件
 * @module
 * @name cmntList
 * @param {Object[]} topLayer 一级评论数据
 * @param {string} topLayer[].mid 评论mid，必传，每一条评论唯一
 * @param {string} topLayer[].thread 所属一级评论的mid（注意 不同于parent） 与 secLayer.mid 对应   一级评论为空字符串
 * @param {string} topLayer[].area 地区
 * @param {string} topLayer[].nick 评论昵称 
 * @param {string} topLayer[].parent_nick 父级评论昵称
 * @param {string} topLayer[].uid 评论uid（判断是否在二级回复中显示 “回复xxx：” 字样必备）
 * @param {string} topLayer[].parent_uid 父级评论uid（判断是否在二级回复中显示 “回复xxx：” 字样必备）
 * @param {string} topLayer[].agree 点赞数
 * @param {string} topLayer[].time 格式化后的时间，例如"2018-04-26 22:23:45"
 * @param {string} topLayer[].tag 名称标签 有则显示
 * @param {string} topLayer[].content 评论内容（纯文本）
 * @param {Array} topLayer[].comment_imgs 图片评论 (只取用数组中第一个元素，为了和接口数据保持一致所以用了数组，没有可传空字符串，这个也是和接口数据保持一致)
 * @param {string} topLayer[].v_type TODO: 加V信息(蓝Vor黄V)，暂时未做，数据端没有提供 
 * @param {boolean} topLayer[].quick_reply 快捷回复标识 有则显示
 * @param {Object} secLayer 二级评论数据
 * @param {Object} secLayer.mid 注意，这里key名并不是mid，而是对应的一级评论mid，例如：secLayer:{"5AE31599-3D879887-65B16ABF-7CD-85B":{"count": 1,"list": [{}]}}
 * @param {Number} secLayer.mid.count 二级评论总数
 * @param {Object[]} secLayer.mid.list 二级评论列表，list内数据结构与topLayer一致
 * @param {Object} userInfo 用户数据 
 * @param {String} userInfo.uid 用户id
 * @param {String} userInfo.nick 用户昵称
 * @param {String} userInfo.profile_img 用户头像 
 * @param {Array} agreedList 点赞mid列表 
 * @param {Function} doPraise 点赞事件  
 * @param {Function} doReply 回复事件  
 * @param {Function} doReport 举报事件  
 * @param {Function} doShowall 点击展开折叠的评论事件  
 * @param {Function} doImgclick 图片评论点击事件  
 * @param {Function} doTopLoadmore 一级评论加载更多事件  
 * @param {Function} doSecLoadmore 二级评论加载更多事件  
 * @param {String} ref 组件索引 如需使用主动刷新全部评论数据的方法，需指定此索引。使用方法可参考 {@link refreshAllCMNT}
 * @param {Object} config 配置信息
 * @param {Number} config.loadmoreThreshold 加载更多阈值，默认300。需要关闭则需指定为0
 * @param {Number} config.autoScroll 假发布后自动滚动，默认开启。如需关闭设置为0
 * @param {String} config.showName 文案。默认为“评论”。目前表现在二级评论加载更多： 查看全部x条{{showName}}
 * @param {String} config.fakePublishText 文案。不传则默认不显示假发布文案
 * @example
 *
 * <template>
 *  <cmnt-list :top-layer="topLayer" :sec-layer="secLayer" :user-info="userInfo" :agreed-list="agreedList" :config="config" @cmnt-do-praise="doPraise" @cmnt-do-reply="doReply" @cmnt-do-report="doReport" @cmnt-do-imgclick="doImgclick" @cmnt-do-showall="doShowall" @cmnt-do-sec-loadmore="doSecLoadmore" @cmnt-do-top-loadmore="doTopLoadmore" ref="cmnt">
 * </cmnt-list>
 * </template>
 *
 * <script>
 *  import cmntList from "@mfelibs/common-vue-cmnt";
 *
 *  export default {
 *    ...
 *    components: {
 *      cmntList
 *    },
 *    methods: {
 *     doPraise(e) {
 *       console.log(e);
 *     },
 *     doReply(e) {
 *       console.log(e);
 *     },
 *     doReport(e) {
 *       console.log(e);
 *     },
 *     doSecLoadmore(e, cb) {
 *       cb && cb({secLayer, userInfo});
 *     },
 *     doTopLoadmore(cb) {
 *       // cb需三个参数，分别是一级评论数据，二级评论数据，用户信息。
 *       // 一级评论数据必传，不传或未空则默认无更多评论，关闭加载更多；二级评论数据没有可不传；用户信息没变可不传；
 *       // TODO: loading状态控制
 *       let userInfo = {
 *         uid: "1706126015",
 *         profile_img: ""
 *       }
 *       cb && cb({topLayer, secLayer, userInfo});
 *     }
 *    }
 *  }
 * </script>
 *
 */

import "@mfelibs/base-css"
import "../../css/cmnt.css"
import {
  list1 as fakeData1,
  list2 as fakeData2,
  secCMNT,
  secLoadmore,
  topLoadmore
} from "./fakeData"
import cmntList from "../../index"
import Vue from "vue";

// import VueTouch from  "vue-touch";
// Vue.use(VueTouch, {name: 'v-touch'})

let config = {
  autoScroll: 1,
  loadmoreThreshold: 300,
  showName: '回帖',
  fakePublishText: '假发布文案'
}

let demo = new Vue({
  el: '.j_vue_root',
  data: {
    topLayer: fakeData1,
    secLayer: secCMNT,
    userInfo: {
      uid: "1706126015",
      nick: 'ohjbdfwkbhje',
      profile_img: "http://tvax2.sinaimg.cn/crop.0.0.736.736.50/65b16abfly8fe6zd2lsofj20kg0kgdhj.jpg"
    },
    agreedList: ['5AE1E0F1-ADE180B-7A300FC9-7CD-87B','5AE31599-3D879887-65B16ABF-7CD-85B'],
    config: config,
    isHot: 1,
    loadmoreTimes: 1
  },
  components: {
    cmntList
  },
  updated: function() {},
  mounted: function() {},
  created: function() {
    this.loadmoreThreshold = 300;
    console.log('vue created');
  },
  methods: {
    /**
     * 点赞事件.
     * 
     * @event doPraise
     * @property {Object} data - 数据及状态
     * @property {Object} data.data - 当前点赞的全部评论数据
     * @property {Number} data.status - 之前在本页是否已点过赞 
     * 
     * @example 
     * doPraise(info) {
     *   console.log(info.data);  // {mid:'...',newsid:'...',.....}
     *   console.log(info.status);  // 0 或 1
     * },
     */
    doPraise(info) {
      console.log(info);
    },
    /**
     * 回复事件.
     *
     * @event doReply
     * @property {Object} data - 数据对象
     * @property {Object} data.data - 当前回复的全部评论数据
     * 
     * @example 
     * doReply(info) {
     *   console.log(info);  // {data:{mid:'...',newsid:'...',.....}}
     * },
     */
    doReply(info) {
      console.log(info);
    },
    /**
     * 举报事件.
     * 
     * @event doReport
     * @property {Object} data - 数据对象
     * @property {Object} data.data - 当前举报的全部评论数据
     * 
     * @example 
     * doReport(info) {
     *   console.log(info);  // {data:{mid:'...',newsid:'...',.....}}
     * },
     */
    doReport(e) {
      console.log(e);
    },
    /**
     * 展开折叠的评论事件.（已处理展开，抛事件出来以便有统计等需求）
     * 
     * @event doShowall
     * @property {Object} data - 数据对象
     * @property {Object} data.data - 当前展开的全部评论数据
     * 
     * @example 
     * doShowall(info) {
     *   console.log(info);  // {data:{mid:'...',newsid:'...',.....}}
     * },
     */
    doShowall(e) {
      console.log('doShowall', e);
    },
    /**
     * 图片评论点击事件.
     * 
     * @event doImgclick
     * @property {Object} data - 数据对象
     * @property {Object} data.data - 当前点击的全部评论数据
     * 
     * @example 
     * doImgclick(info) {
     *   console.log(info);  // {data:{mid:'...',newsid:'...',.....}}
     * },
     */
    doImgclick(e) {
      console.log('doImgclick', e);
    },
    /**
     * 二级评论加载更多事件.
     *
     * @event doSecLoadmore
     * @property {Object} data -  数据及状态
     * @property {Object} data.data - 需加载更多的一级评论的全部数据
     * @property {Number} data.page - 请求页码 从1开始
     * @property {function} cb - 回调事件，需把加载更多获取的二级评论数据传进去
     * 
     * @example 
     * doSecLoadmore(info, cb) {
     *   console.log(info);  // {data:{mid:'...',newsid:'...',.....}, page: 1}
     *   cb && cb({secLayer, userInfo});
     * },
     */
    doSecLoadmore(info, cb) {
      console.log(info);
      setTimeout(() => {
        cb && cb({
          secLayer: secLoadmore
        });
      }, 1000);
    },
    /**
     * 一级评论加载更多事件.
     *
     * @event doTopLoadmore
     * @property {Object} data -  数据及状态
     * @property {Object} data.data - 保持结构统一 这里是个空对象
     * @property {Number} data.page - 请求页码 从2开始
     * @property {function} cb - 回调事件，需把加载更多获取的数据传进去 
     * cb需三个参数，分别是一级评论数据，二级评论数据，用户信息。
     * 一级评论数据必传，不传或未空则默认无更多评论，关闭加载更多；二级评论数据没有可不传；用户信息没变可不传。
     * TODO: loading状态控制
     * @example 
     * doTopLoadmore(info, cb) {
     *   console.log(info);  // {data:{}, page: 2}
     *   cb && cb({topLayer, secLayer, userInfo});
     * },
     */
    doTopLoadmore(info, cb) {
      // cb需三个参数，分别是一级评论数据，二级评论数据，用户信息。
      // 一级评论数据必传，不传或未空则默认无更多评论，关闭加载更多；二级评论数据没有可不传；用户信息没变可不传
      // TODO: loading状态控制
      console.log(info);
      let userInfo = {
        uid: "1706126015",
        profile_img: ""
      }
      if (this.loadmoreTimes === 1) {
        setTimeout(() => {
          console.log('doTopLoadmore return more')
          cb && cb({
            topLayer: topLoadmore
          });
        }, 3000);
        this.loadmoreTimes = 2;
      } else {
        setTimeout(() => {
          console.log('doTopLoadmore return empty')
          cb && cb({});
        }, 3000);
      }
    },
    toogleHot() {
      console.log('toogleHot');
      this.isHot = 1;
      /** 
       * @method refreshAllCMNT 
       * 
       * @description 主动刷新全部数据，需调用组件内部定义的方法
       * @param {Object} data 对象数据
       * @param {Object[]} data.topLayer 一级评论数据 与初始化时所需参数一致
       * @param {Object} data.secLayer 二级评论数据 与初始化时所需参数一致
       * @param {Object} data.userInfo 用户数据 与初始化时所需参数一致
       * 
       * @example
       * this.$refs.cmnt.refreshAllCMNT({topLayer, secLayer, userInfo})
       */
      this.$refs.cmnt.refreshAllCMNT({
        topLayer: fakeData1,
        secLayer: secCMNT
      });
    },
    toogleTime() {
      this.isHot = 0;
      console.log('toogleTime');
      this.$refs.cmnt.refreshAllCMNT({
        topLayer: fakeData2,
        secLayer: secCMNT
      });
    },
    updateUserInfo(userInfo) {
      /** 
       * @method updateUserInfo 
       * @description 主动更新登录用户信息（用于加粗评论头像框以及快捷回复显示头像）,需调用组件内部定义的方法
       * 
       * @param {Object} userInfo 用户信息 若不传则默认登出
       * @param {String} userInfo.uid 用户id 会与评论的uid相比较  例如'1706126015'
       * @param {String} userInfo.nick 昵称
       * @param {String} userInfo.profile_img 用户头像 没有可不传
       * @example
       * this.$refs.cmnt.updateUserInfo(userInfo)
       */
      this.$refs.cmnt.updateUserInfo(userInfo);
    },
    fakePublish(data) {
      /** 
       * @method fakePublish 
       * @description 假发布 请确保假发布前已调用 {@link updateUserInfo} 已同步过登录用户信息。也可在data.userInfo中传递。
       * 
       * @param {Object} data 假发布数据 与评论数据
       * @param {Object} data.target 对评论的假发布需回传原评论信息  对文章假发布则可无此节点
       * @param {string} data.target.mid mid必传 
       * @param {string} data.target.thread thread mid必传 不传默认为对一级评论的评论
       * @param {string} data.target.nick nick必传 
       * @param {Object} data.fakeData 假发布内容
       * @param {string} data.fakeData.area 地区
       * @param {string} data.fakeData.time 格式化后的时间，例如"2018-04-26 22:23:45"，这个是为了保持和后端接口数据格式一致，不传则默认添加当前时间，显示格式和真实的评论一致
       * @param {string} data.fakeData.tag 名称标签 有则显示
       * @param {string} data.fakeData.content 评论内容（纯文本）
       * @param {string} data.fakeData.comment_imgs 图片评论 (只取用数组中第一个元素，为了和接口数据保持一致所以用了数组，没有可传空字符串，这个也是和接口数据保持一致)
       * @param {string} data.userInfo 登录用户信息
       * @param {string} data.userInfo.nick 登录用户信息
       * @param {string} data.userInfo.uid 登录用户信息
       * @param {string} data.userInfo.profile_img 登录用户信息
       * 
       * @example
       * this.$refs.cmnt.fakePublish({target, fakeData, userInfo})
       */
      this.$refs.cmnt.fakePublish(data);
    }
  }
})

window.fakeData = fakeData1;
window.demo = demo;
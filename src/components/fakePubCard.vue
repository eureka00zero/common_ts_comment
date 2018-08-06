<template>
  <div class="post_return_row" :class="{'no_line': !data.__hasLine}">
    <div class="post_return_row_l">
      <figure class="post_return_row_img my" :class="{'mini':data.__showMini}">
        <img class="img_width i_bg" :src="data.profile_img" />
        <i class="post_return_row_ic"></i>
      </figure>
    </div>
    <aside class="post_return_row_r">
      <div class="post_return_com">
        <!-- <a href="javascript:void(0)" class="post_return_report" :class="{'hide': !data.__showReport}" @click="doReport">
          <i class="icon_police"></i>
          <span class="post_return_report_txt">举报</span>
        </a> -->
        <h2 class="post_return_com_tit">
          <span class="post_return_com_tit_id">{{data.nick}}</span> <!-- fot_orange 名称变黄-->
          <mark class="post_return_com_tit_sign" v-if="data.tag">{{data.tag}}</mark>
          <span class="post_return_com_tit_state" v-if="fakePublishText">{{fakePublishText}}</span>
        </h2>
        <address class="post_return_add">
          <span class="post_return_add_txt">{{data.area}}</span>
          <time calss="post_return_add_t">{{data.__showTime}}</time>
        </address>
        <div :class="{'post_return_show': !data.__showEllipsis}">
          <p class="post_return_reply" v-html="data.__showContent"></p>
          <a class="post_return_reply_more" @click="doShowall">展开全部</a >
          <img v-if="data.comment_imgs && data.comment_imgs[0]" @click="doImgclick" class="post_return_img i_bg" :src="data.comment_imgs[0]" />
        </div>
        <!-- <nav class="post_return_fun">
          <a href="javascript:void(0)" @click="doPraise" class="post_return_fun_link" :class="{ active: data.__doPraise}">
            <span class="post_return_fun_ic_an">
              <i class="ic_praise_reply post_return_fun_ic"></i>
            </span>
            <span class="post_return_fun_txt"><span>{{data.__showAgree}}</span>赞</span>
          </a>
          <a href="javascript:void(0)" @click="doReply" class="post_return_fun_link">
            <i class="ic_com_reply post_return_fun_ic"></i>
            <span class="post_return_fun_txt">回复</span>
          </a>
        </nav> -->
      </div>
    </aside>
  </div>
</template>
<script lang='ts'>
import Vue from "vue";
const defaultImg =
`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACne
 j3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=`;


export default Vue.extend({
  name:"fakePubCard",
  props: {
    data: {
      type: Object,
      required: true
    },
    config: {
      type: Object
    }
  },
  data(){
      return{
        fakePublishText:""
      }
  },
  created() {
    this.data.profile_img = this.data.profile_img || defaultImg;
    this.fakePublishText  = this.config.fakePublishText;
  },
  methods: {
    // doPraise() {
    //   let status = this.data.__doPraise ? 1 : 0; // 之前的点赞状态 1已点过 0没点过
    //   this.$emit("do-praise", { data: this.data, status: status });
    // },
    // doReply() {
    //   this.$emit("do-reply", { data: this.data });
    // },
    // doReport() {
    //   this.$emit("do-report", { data: this.data });
    // },
    // showReport(e) {
    //   this.$emit("show-report", { data: this.data });
    // },
    // closeReport() {
    //   this.$emit("close-report", { data: this.data });
    // }
    doShowall():void {
      this.$emit("do-showall", { data: this.data });
    },
    doImgclick():void {
      this.$emit("do-imgclick", { data: this.data });
    }
  }
});
</script>
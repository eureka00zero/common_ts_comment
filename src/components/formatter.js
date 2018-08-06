import xssFilters from 'xss-filters';
import replaceFace from '@mfelibs/client-sticker-convert';
import toArray from "lodash/toArray";
import Set from 'es6-set'; // ES6 Set polyfill

let showNumFormat = num => {
  if (!num) {
    return ''
  }
  if (num <= 9999) {
    return num + '人'
  } else if (num <= 99999) {
    return Math.round(num / 1000) / 10 + '万人';
  } else if (num <= 9990000) {
    return Math.round(num / 10000) + '万人';
  } else {
    return '999万+人';
  }
}

let addNormalShowData = (data, agreedList) => {
  let oriContentLen = toArray(data.content).length; // 为了排除emoji的长度 emoji的长度可能为2或4 影响长度判断 lodash toArray方法处理了这种情况，绝大部分的单独的emoji可以被识别出来放在一个数组的元素中
  let replaceObj = replaceFace(xssFilters.inHTMLData(data.content));
  let cmntRealLen = oriContentLen + replaceObj.replaceNum - replaceObj.replaceLen; // 真实的评论字数 （一个表情 一个emoji算一个字）

  // // 点赞信息 如果传有数组则为组件内判断。如果不传 默认为业务判断
  // if (agreedList) {
  if (agreedList.indexOf(data.mid) != -1) {
    data.__doPraise = 1;
  } else {
    data.__doPraise = 0;
  }
  // }

  data.agree = parseInt(data.agree);
  data.__showContent = replaceObj.str;
  data.__type = "normalCard";
  data.__hasLine = 0; // 默认没有边框
  data.__showReport = 0; // 默认不举报
  data.__showMini = 0; // 默认是一级评论
  data.__isMy = 0; // 默认是其他人回复
  data.__showTime = showTimeFormat(data.time);
  data.__showAgree = data.__showAgree ? data.__showAgree : showNumFormat(data.agree); // 已赞
  data.__hot = parseInt(data.agree, 10) > 49; // 热门评论 特殊背景颜色样式

  // 保证加载更多新添加的元素不影响旧的
  if (data.__showEllipsis == undefined) {
    data.__showEllipsis = cmntRealLen > 150;
  }
};

let formatAllData = (topLayer, secLayer, userInfo, agreedList) => {
  let midSet = new Set();
  let tempList = [];
  userInfo = userInfo || {};
  topLayer.forEach(topItem => {
    // 去重
    if (midSet.has(topItem.mid)) {
      return
    } else {
      midSet.add(topItem.mid);
    }

    addNormalShowData(topItem, agreedList);

    // 判断本人回复
    if (topItem.uid === userInfo.uid) {
      topItem.__isMy = 1;
    }

    // 有快捷回复或者二级评论 则有边框
    if (topItem.quick_reply) {
      topItem.__hasLine = 1;
    }

    tempList.push(topItem);

    // 有二级评论
    if (secLayer[topItem.mid]) {
      // 一级评论添加边线
      tempList[tempList.length - 1].__hasLine = 1;

      let secNum = secLayer[topItem.mid].list && secLayer[topItem.mid].list.length || 0;

      if (userInfo.nick && userInfo.uid) {
        // 强制 登录后才可显示假发布
        secLayer[topItem.mid].fakeList && secLayer[topItem.mid].fakeList.forEach(fakeItem => {
          formatFakeData(fakeItem, userInfo);

          // 添加 回复 xxx: 
          if (fakeItem.parent_uid !== topItem.uid) {
            // fakeItem.__showReplyUser = `回复${fakeItem.parent_nick}：`
            fakeItem.__showContent = `回复${fakeItem.parent_nick}：` + fakeItem.__showContent;
          }

          fakeItem.__showMini = 1;

          secNum && (fakeItem.__hasLine = 1);
          tempList.push(fakeItem);
        })
      }

      secNum && secLayer[topItem.mid].list.forEach((secItem, index) => {
        addNormalShowData(secItem, agreedList);
        secItem.__showMini = 1;
        if (index == secNum - 1) {
          secItem.__hasLine = 0;
        } else {
          secItem.__hasLine = 1;
        }

        // 判断本人回复
        if (secItem.uid === userInfo.uid) {
          secItem.__isMy = 1;
        }

        // 添加 回复 xxx: 
        if (secItem.parent_uid !== topItem.uid) {
          secItem.__showContent = `回复${secItem.parent_nick}：` + secItem.__showContent;
        }

        tempList.push(secItem);
      });

      let totalSecLayerCount = secLayer[topItem.mid].count
      if (totalSecLayerCount > secNum) {
        // 显示加载更多时 前一个card需要添加边线
        tempList[tempList.length - 1].__hasLine = 1;

        let loadmoreItem = Object.assign({}, topItem, {
          __type: "loadmoreCard",
          __totalCount: totalSecLayerCount,
          __remainCount: totalSecLayerCount - secNum,
          __showLoading: secLayer[topItem.mid].__loading,
          __singleLoadmore: !topItem.quick_reply // 没有快捷回复时添加额外样式
        })
        tempList.push(loadmoreItem);
      }
    }

    if (topItem.quick_reply) {
      let {
        quick_reply,
        ...cleanObj
      } = topItem;

      Object.assign(cleanObj, {
        __loginUserImg: userInfo.profile_img,
        // __loginUserId: userInfo.uid,
        __type: "quickReplyCard"
      })
      tempList.push(cleanObj);
    }
  });
  return tempList;
}

let formatFakeData = (data, userInfo) => {
  let oriContentLen = toArray(data.content).length; // 为了排除emoji的长度 emoji的长度可能为2或4 影响长度判断 lodash toArray方法处理了这种情况，绝大部分的单独的emoji可以被识别出来放在一个数组的元素中
  let replaceObj = replaceFace(xssFilters.inHTMLData(data.content));
  let cmntRealLen = oriContentLen + replaceObj.replaceNum - replaceObj.replaceLen; // 真实的评论字数 （一个表情 一个emoji算一个字）

  data.profile_img = userInfo.profile_img;
  data.nick = userInfo.nick;
  data.uid = userInfo.uid;
  data.__type = "fakePubCard";
  data.__showContent = replaceObj.str;
  data.__showTime = showTimeFormat(data.time);
  // 保证加载更多新添加的元素不影响旧的
  if (data.__showEllipsis == undefined) {
    data.__showEllipsis = cmntRealLen > 150;
  }
}

//三天以内用天，一天以内用具体时间，1小时以内用分钟，超过三天用日期
let showTimeFormat = time => {
  let DataTimer;
  if (time) {
    let formateTime = time.replace(/-/g, '/');
    DataTimer = new Date(formateTime);
  } else {
    DataTimer = new Date();
  }

  let timeNum = +DataTimer;
  let now = +new Date();
  let duration = now - timeNum;
  let resultStr = time;

  if (duration > 2592e5) {
    // console.log('三天前' , new Date(timeNum).getMonth());
    resultStr = (DataTimer.getMonth() + 1) + '月' + (DataTimer.getDate()) + '日'
  } else if (duration > 864e5) {
    resultStr = Math.floor(duration / 864e5) + '天前';
  } else if (duration > 36e5) {
    let status = '今天 ';
    if (new Date().getDate() != DataTimer.getDate()) {
      status = '昨天 '
    }
    let minute = DataTimer.getMinutes();
    minute = (minute < 10 ? '0' : '') + minute;
    resultStr = status + DataTimer.getHours() + ':' + minute;
  } else if (duration < 0) {
    return time;
  } else if (duration <= 36e5) {
    if (duration / 1e3 < 60) {
      // resultStr = Math.floor(duration / 1e3) + '秒钟前';
      resultStr = '刚刚';
    } else {
      resultStr = Math.floor(duration / 6e4) + '分钟前';
    }
  }
  return resultStr;
}

// 添加二级评论特殊数据
// 页码 & loading状态
let addSecSpecData = secObj => {
  secObj.__loading = 0;
  secObj.__page = 1;
}

// isClick 0：表示随一级评论加载更多触发的二级评论更新 可能会同时更新多个mid
// isClick 1：表示手动触发的二级评论加载更多 一次只会更新一个mid 且需要修改loading的状态
let mergeSecData = (oldData, newData, isClick) => {
  if (newData == null) {
    return oldData
  }
  for (let key in newData) {
    let loadmoreFlag = 0; // 本次是否有增量更新 下次请求二级评论加载更多 页码+1
    if (oldData[key]) {
      // 旧的二级评论数据中有对应的mid 
      // 说明此次merge可能是二级评论的加载更多
      // 需更新旧的二级评论数据
      oldData[key]['count'] = newData[key]['count'];

      // 空间换时间 避免两层forEach
      let oldDataMap = new Map();
      oldData[key]['list'].forEach(oldItem => {
        oldDataMap.set(oldItem.mid, oldItem);
      });

      newData[key]['list'].forEach(newItem => {
        if (oldDataMap.has(newItem.mid)) {
          // 直接修改旧数据 防止请求到的旧数据有修改（理论上不会出现有修改的情况）
          Object.assign(oldDataMap.get(newItem.mid), newItem);
        } else {
          // 增量添加
          oldData[key]['list'].push(newItem);
          loadmoreFlag = 1;
        }
      });
      loadmoreFlag && oldData[key].__page++;
      isClick && (oldData[key].__loading = 0);
    } else {
      oldData[key] = newData[key];
      addSecSpecData(oldData[key]);
    }
  }

  return oldData
}

export {
  formatAllData,
  showNumFormat,
  mergeSecData,
  addSecSpecData,
  formatFakeData
}
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from "./store"

import vTitle from "vue-wechat-title"

Vue.use(vTitle);

Vue.config.productionTip = false

window.myConfig={
  HTTP_NAME : "Noderce" ,//网站域名 用于标题
  IMPORT_HTTP : "http://localhost:8080", //请求接口域名 在发布和开发阶段更换
  QINIU_UPLOAD_HTTP : 'http://upload.qiniup.com', //七牛云华东地区 客户端上传地址
  QINIU_IMG_HTTP_BEFER : "you qiniu server http", //七牛云 服务域名
  QINIU_IMG_STYLE : "- you style", //七牛云图片分隔符+样式
  A_PAGE_NUMBER : 15 , //每页显示数量 这个与后台应协商确认，前端用于分页组件
}
window.myFunction={
   getCookie: function(cname){
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++) 
      {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
      }
      return "";
    }
}
Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


/* eslint-disable no-new */
var vm = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})



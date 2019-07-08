const Koa_static =require("koa-static");
//定义一天的时间 单位毫秒  60*60*24*1000
const Day = 86400000;

module.exports = function(router,options){
    //设置 预设值
    options = options || {};
    options.js = options.js || 1;
    options.css = options.css || 30;
    options.img = options.img || 7;
    options.html = options.html || 7;
    options.other = options.other ||7;
    //定义文件类型
    router.all(/((\.js)|(\.jsx))$/i, Koa_static("./static", {maxAge : options * Day}));
    router.all(/((\.css))$/i, Koa_static("./static", {maxAge : options * Day}));
    router.all(/((\.jpg)|(\.gif)|(\.png))$/i, Koa_static("./static", {maxAge : options * Day}));
    router.all(/((\.html)|(\.htm))$/i, Koa_static("./static", {maxAge : options * Day}));
    router.all(/(upload_)/, Koa_static("./upload", {maxAge : options * Day}));
    router.all("*", Koa_static("./static", {maxAge : options * Day}));
}
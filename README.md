# NoderceWebProject
## This WEB practice project （Vue + Node.JS + Koa + MySQL ）

## [WIKI API](https://github.com/perwait/NoderceWebProject/wiki/Koa-API-for-Client)


# [Noderce.com](http://noderce.com)
    仅支持 1200px以上分辨率 的屏幕 正常体验，
	
## introduce
    这是一个小型的文章发布站点项目，采用前后端业务分离的实现方式。版本采取功能式迭代，
    前端的交互方式采用 fetch + FromData， 

## Stateus	
	当前是 v1.x版本，这个版本主要是为了快速上线，所以它的体验会比较糟糕，
	目前只能由 管理员发布，因为注册端口未开通，或许我们可以说的好听一点，称呼他为 私人博客。
## Config 
    Vue : src/main.js
    Koa : config.js
	
## Start 
    MySQL ： UTF-8
    All : npm i
      Vue : npm run dev
      Koa : node server

## 使用到的相关技术与框架
    Vue
    Node.js
    Koa
    MySQL
## 	使用到的相关三方服务
    [七牛云-对象存储](https://www.qiniu.com)
    [TinyMCE富文本编辑器](https://www.tinymce.com)
# version：
    1.0.2
## Add
    1 TinyMCE发布的图片资源存储，由 业务服务器存储 变更为 七牛云对象存储服务，提升访问速度并减少服务器压力
    2 修复回复不刷新不跳转Bug ， 当前页刷新 暂时 采用 切换路由 再回退的方式。
    3 更新回复后刷新页面的逻辑	
    
    


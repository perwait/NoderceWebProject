# NoderceWebProject
## 一个小型文章发布网站（Vue 2 + Node.js + Koa2 + MySQL）

## [WIKI API](https://github.com/perwait/NoderceWebProject/wiki/Koa-API-for-Client)
    所有接口说明 参考WIKI（本文末尾也列出了接口清单）

# [Noderce.com](http://noderce.com)
    PC 上正常体验，建议分辨率 1200px
    移动端 兼容阅读

## 简介
    这是一个小型的文章发布项目，采用前后端分离的实现方式。版本采取功能式迭代，
    前端的交互方式采用 fetch + FormData。

## 功能
    - 文章：发布、按主题（类目）归档、最新文章、个人主页、文章详情
    - 回复：登录用户可以回复文章
    - 主题：创建主题，主题列表
    - 分页：最新文章、所有主题、主题下文章、个人主页、回复，全部带分页
    - 富文本编辑：TinyMCE；图片直传七牛云对象存储
    - 登录：账号密码 + session（cookie）
    - 后台管理：目前只有页面骨架，后端接口尚未实现

## 技术栈
    Vue 2        基于 Vue-Cli 2（webpack 3）构建
    Node.js
    Koa2         koa-router / koa-session / koa-better-body / koa-static
    MySQL        建议 5.7 / 8.0，字符集 UTF-8
    DOMPurify    前端渲染前过滤 HTML（防 XSS）

## 目录结构
    Koa/                      后端 API
      server.js               程序入口
      config.example.js       配置模板（复制为 config.js 后填写，config.js 不提交）
      getKeys.js              生成 session 签名密钥 .keys（.keys 不提交）
      libs/
        database.js           连接池（排队上限 / 超时）
        transaction.js        查询与事务封装
        queries.js            读接口的 SQL
        validate.js           请求参数校验
        articleService.js     创建文章 / 回复
        throttle.js           频率限制
        uploadGuard.js        上传保护
        uploadToken.js        七牛云上传凭证
        md5.js
      router/
        client/index.js       前台接口
        admin/index.js        后台接口（骨架）
        staticCache.js        静态资源缓存
    Vue/                      前端
      src/main.js             前端配置（接口域名、七牛地址、分页数量……）
      src/router/             路由
      src/components/         页面与组件
      src/utils/sanitize.js   HTML 过滤
    noderce.sql               数据库结构和初始数据

## 快速开始
    1. 数据库
       MySQL 编码 UTF-8，排序规则 General_ci。创建库 noderce 并导入 noderce.sql。
       建议为项目建一个专用账号，只授予 noderce 库的 SELECT / INSERT / UPDATE / DELETE 权限，不要使用 root。
       注意：Koa 使用的 mysql 包不支持 MySQL 8 默认的 caching_sha2_password，
       需要用 mysql_native_password：
         CREATE USER 'noderce_app'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的密码';
         GRANT SELECT, INSERT, UPDATE, DELETE ON noderce.* TO 'noderce_app'@'localhost';

    2. 后端（Koa）
       cd Koa
       npm i
       复制 config.example.js 为 config.js，填写数据库、密码盐、七牛云密钥
       node getKeys.js          生成 .keys（session 签名密钥）
       node server              启动，默认端口 8080

    3. 前端（Vue）
       cd Vue
       npm i
       修改 src/main.js 里的 window.myConfig.IMPORT_HTTP 为后端接口地址
       npm run dev              开发
       npm run build            构建，产物在 dist/

       用 Node 17 及以上构建时，webpack 3 需要加环境变量：
         NODE_OPTIONS=--openssl-legacy-provider npm run build

## 配置
    Vue : src/main.js  （window.myConfig）
    Koa : config.js    （从 config.example.js 复制）

    Koa config.js
      DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_TABLE   数据库
      USER_PW_AFTER       密码校验后缀（盐），用户密码是 md5(密码 + 盐)。请改成自己的随机字符串
      SESSION_MAXAGE      session 有效期（毫秒）
      HTTP_HOST           后端监听端口
      HTTP_URL            后端对外地址
      PAGE_VIEW_VALUE     每页数量，前端 A_PAGE_NUMBER 要与之一致
      QINIU_CONFIG        七牛云空间名和 AK / SK

## 接口清单
    GET
      topThemeList                    导航栏推荐的主题
      newArtclePage                   最新文章总页数
      newArtcle/:page                 最新文章
      allThemePage                    主题总页数
      allTheme/:page                  主题列表
      themeName/:tid                  主题名称和文章数
      artcleList/:tid/:page           某主题下的文章
      artcle/:tid/:pid                文章内容
      reply/:tid/:pid/:page           文章的回复
      myIndexPage/:uid                个人主页文章总页数
      myIndex/:uid/:page              个人主页文章
    POST
      login                           登录
      getUploadToken                  七牛云上传凭证（需登录）
      uploadImg                       上传图片（需登录，只接受 jpg / png / gif / webp）
      createTheme                     创建主题（需登录）
      createArtcle                    发布文章（需登录）
      reply                           回复（需登录）

## 设计说明
    计数
      文章没有全局自增 id：文章用 (tid, pid) 定位，pid 在主题内递增；回复同理，用 (tid, pid, rid)。
      theme.t_pnum / posts.pecho 只是“下一个 pid / rid 的发号器”，
      页面上显示的文章数、回复数、用户文章数，以及分页页数，都由接口从真实数据里实时统计（libs/queries.js），
      不依赖这些存储的计数，删除内容或发号器被改动都不会导致显示错误。

    创建文章 / 回复
      在一个数据库事务里完成（加锁 -> 取号 -> 写入 -> 更新计数），全部成功才返回成功，失败整体回滚。
      不做“失败后重试”；只有死锁 / 锁等待超时才会重试，最多 2 次。
      同一用户短时间内重复提交会被拒绝（HTTP 429）。

    输入限制
      标题、正文、回复、参考文献的长度与数据库列宽一致（见 libs/validate.js）。
      数据库字符集是 utf8（最多 3 字节）：正文和回复里的 emoji 会转成 HTML 数字字符引用保存；
      标题、主题名、参考名称里不允许出现 emoji。

    安全
      上传：multipart 请求必须登录（登录请求本身是很小的表单，不受影响）；
            文件只允许保存在 uploadImg 接口，且只接受图片。
      XSS ：文章、回复、签名在前端渲染前用 DOMPurify 做白名单过滤（旧内容也受保护），
            后端入库时额外拒绝明显的脚本注入（<script>、事件属性、javascript: 链接……）。
      配置：config.js 和 .keys 不要提交，权限建议设为 600。

## 部署建议
    - 后端用 pm2 守护，前端构建后交给 Nginx
    - Nginx 反向代理接口时，client_max_body_size 建议设为 12m（图片上限 2MB，直传七牛云）
    - 更新前备份数据库和线上文件；先在本机或测试环境验证

## 第三方服务
    [七牛云-对象存储](https://www.qiniu.com)
    [TinyMCE富文本编辑器](https://www.tinymce.com)
    [Icon阿里巴巴矢量图标库](https://www.iconfont.cn)

# 版本
## 1.1.0
    修复 创建文章 / 回复在写库失败时无限重试，导致数据库被持续写入、服务器高负载的问题
    修复 主题文章数、回复数、分页页数显示错误的问题（改为实时统计）
    修复 multipart 上传没有登录限制的问题
    修复 存储型 XSS（前端渲染过滤 + 后端入库校验）
    修复 若干接口在参数缺失、页码为 0 或非法时返回 500 的问题
    修复 提交按钮没有防重复点击的问题
    新增 “最新文章”页面分页（新增接口 newArtclePage）
    新增 “所有主题”、“个人主页”分页
    调整 config.js / .keys 不再提交到仓库，提供 config.example.js

## 1.0.5
    1 修复 tinyMce 与 当前页面CSS不匹配的问题
    2 修复 苹果设备下 按钮的初始颜色不一致问题
    3 增加编辑器功能

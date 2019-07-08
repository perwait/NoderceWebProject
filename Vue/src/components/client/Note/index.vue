<template>
    <div v-wechat-title="title">
        <article class="content-ct fl bs-1">
            <div class="note">
                <div class="title">
                    <h1>关于 Noderce </h1>
                    <span>Author：<a href="">admin</a></span>
                    <span>Time：<time datetime="2019-06-27">2019-06-27</time></span>
                </div>
                <div class="txt">
                    <p>
                        &#12288;&#12288;Noderce.com 是由个人站长建立。站点内 文章内容 基本是 个人学习心得 和 部分借鉴于网络资料 的结合。<br>关于借鉴的内容，在文章底部声明 原文地址。如果触犯您的版权，请发送 Email 至 haimazouguo@live.cn ，本站承诺将在72小时内处理。给您造成不便，敬请谅解。
                    </p>
                    <p>
                        <b>&#12288;&#12288;请注意 ： 本站内容信息 完全免费 公开 ，转载时 必须注明出处 和 保持免费公开。</b>
                    </p>
                    <p>
                        &#12288;&#12288;本站技术架构为 ： Vue + Node.JS（Koa2）+ MySQL ， 富文本 ：Tinymce 。
                    </p>
                    <p>
                        &#12288;&#12288;富文本编辑器 ：Tinymce 。
                    </p>
                    <p>
                        &#12288;&#12288;Noderce.com 皆由站长独自 维护和更新，请您在任何时候 都不要恶意攻击和破坏，必要时将报案处理。
                    </p>
                </div>
            </div>
        </article>
    </div>
</template>
<script>
export default {
    data(){
        return {
            title : "关于 - Noderce"
        }
    }
}
</script>
<style  scoped>
.content-ct {background-color: #fff; margin-top: 20px; overflow: hidden; }
.note  {margin: 20px;}
.title {padding-bottom: 20px; }
.title h1 {padding-bottom: 5px; border-bottom: 1px solid #d3d3d3; margin-bottom: 5px;}
.title span {margin-right: 15px;}
.title span, .title span *{ color: #888; }
.title span a { transition: 0.5s;}
.title span a:hover {color: #ff3131}

.txt p{margin-bottom: 10px;}
</style>

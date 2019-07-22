<template>
    <div v-wechat-title="title" >
        <div class="fl content-ct">
            <article class=" content-ct bs-1">
                <div v-if="artcle!==null" class="note">
                    <div  class="title">
                        <h1>{{artcle.pname}}</h1>
                        <span><icon class="iconfont icon-c-blueviolet n-icon-user"></icon> <a href="">{{artcle.uname}}</a></span>
                        <span><icon class="iconfont icon-c-blue n-icon-theme"></icon> <router-link :to="artcle.turl">{{artcle.tname}}</router-link></span>
                        <span><icon class="iconfont icon-c-blue n-icon-time"></icon>  <time :datetime="artcle.pcreatetime">{{artcle.pcreatetime}}</time></span>
                    </div>
                    <div class="txt" >
                        <div v-html="artcle.pcentent"></div>
                        <hr>
                        <div class="resouce">
                            <label v-if="artcleRefer.length>0">参考文献</label>
                            <ul>
                                <li v-for="item in artcleRefer">
                                    <a target="_blank" :href="item.url">{{item.name}}</a>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </article>
            <div id="replys" v-if="pages>0" class="content-ct  bs-1">
                <div class="reply-box">
                    <section v-for="item in replyList">
                        <div>
                            <div class="user-box clearfloat">
                                <div class="user-img fl"><router-link :to="item.uurl"><img :src="item.ulogo" ></router-link></div>
                                <div class="user-text">
                                    <span>{{item.rid}}#</span>
                                    <span>Author ：<router-link :to="item.uurl">{{item.uname}}</router-link></span>
                                    <span>{{item.rcreatetime}}</span>
                                </div>
                            </div>
                            <div class="reply-content txt">
                                <div v-html="item.rcontent"></div>
                            </div>
                        </div>
                    </section>

                </div>
                <div id="pages" v-if="this.pages>1">
                    <ul>
                        <li v-if="page>1" @click="pageTop()">|&lt;&lt;</li> 
                        <li v-if="page>1" @click="pageBefer()">&lt;</li> 
                        <span>{{page}} / {{pages}}</span>
                        <li v-if="page<pages" @click="pageNext()">&gt;</li> 
                        <li v-if="page<pages" @click="pageLast()">&gt;&gt;|</li> 
                    </ul>
                </div>
            </div>

            <div class="content-ct  bs-1">
                
                <div v-if="userInfo!=null">
                    <TinyMCE  v-on:input="TinyBody"   :url="tinyUrl" :tokenUrl="tokenUrl" :maxsizetext="maxsizetext"  :withCredentials="withCredentials" :max-size="tinyImgSize" />
                    <p v-show="replyMsg" class="reply-msg">{{replyMsg}}</p>
                    <p id="echo-btn" @click="replyEvent()">回&#12288;&#12288;复</p>
                </div>
                <div v-if="userInfo==null" class="no-login">
                    <p>登录后进行更多操作</p>
                    <router-link to="/login">点此处登录</router-link>
                </div>
            </div>
            

           
        </div>
      
    </div>
</template>
<script>
import TinyMCE from "@/components/Tiny"
export default {
    name: "C-artcle",
    components: {
        TinyMCE
    },
    data(){
        return {
            title:`文章 - ${window.myConfig.HTTP_NAME}`,
            artcle : null,
            artcleRefer : null,
            // 请求回来的 数据格式
            /*artcleRefer : [
                {name:"HTML 简介",url:"http://www.w3school.com.cn/html/html_jianjie.asp"},
                {name:"HTML 简介",url:"http://www.w3school.com.cn/html/html_jianjie.asp"},
                {name:"HTML 简介",url:"http://www.w3school.com.cn/html/html_jianjie.asp"},
                ],*/
            tid : this.$route.params.tid, //主题id
            pid : this.$route.params.pid, //文章id
            page: this.$route.params.page, //当前回复页码
            uid : null, //用户id
            replyList : null, //回复列表
            pages : 0, //回复总页数
            userInfo : null, //免登录状态参数
            replyState : true, // 回复状态 当前是否 允许回复
            replyMsg : null,  // 回复状态信息
            tinyBody :null, //编辑器内容
            tinyMaxSize :10000, //最大字数
            tokenUrl : `${window.myConfig.IMPORT_HTTP}/getUploadToken`,
            tinyUrl :  `${window.myConfig.QINIU_UPLOAD_HTTP}`,
            tinyImgSize : 2000*1024, //限制大小2M
            maxsizetext : " 最大2M ",
            withCredentials : true //是否允许设置cookie
        }
    },
    methods:{
        //返回编辑器的内容
        TinyBody : function(data){
            this.tinyBody = data;
        },
        //上一页
        pageBefer : function(){
            let tempPage = parseInt(this.page);
            let page = tempPage-1<1?1:tempPage-1;
            this.$router.push({name:"artcle",params:{tid:this.tid,pid:this.pid,page:page}})
        },
        //第一页
        pageTop : function(){
            let page = 1;
            this.$router.push({name:"artcle",params:{tid:this.tid,pid:this.pid,page:page}})
        },
        //下一页
        pageNext: function(){
            let tempPage = parseInt(this.page);
            let page = tempPage+1>this.pages?this.pages:tempPage+1;
            this.$router.push({name:"artcle",params:{tid:this.tid,pid:this.pid,page:page}})

        },
        //最后一页
        pageLast: function(){
            let page = parseInt(this.pages);
            this.$router.push({name:"artcle",params:{tid:this.tid,pid:this.pid,page:page}})
        },
        //文章初始化
        artcleInit : function(url){
            let that = this;
            let data = fetch(url,{method:"GET"}).then(function(response){
                if(response.status===200){
                    return response.json();
                } else {
                    return {}
                }
            }).then(function(data){
                if(data.length>0){
                    if(!data[0].turl){
                        data[0].turl = `/artcleList/${data[0].p_tid}/1`
                    }
                    if(data[0].pcreatetime){
                        data[0].pcreatetime =  new Date(data[0].pcreatetime).Format("yyyy-MM-dd");
                    }
                    if(data[0].prefer){
                        data[0].prefer = JSON.parse(data[0].prefer);
                    }
                    if(!data[0].uurl){
                        data[0].uurl = `/myIndex/${data[0].p_uid}/1`
                    }
                    if(data[0].ulogo){
                        data[0].ulogo = `${window.myConfig.IMPORT_HTTP}${data[0].ulogo}` 
                    }
                    that.title=`${data[0].pname} - ${window.myConfig.HTTP_NAME}`;
                }
                return data[0];
            });
            return data;
        },
        //回复列表初始化
        replyListInit : function(url){
            let data = fetch(url,{method:"GET"}).then(function(response){
                if(response.status===200){
                    return response.json();
                } else {
                    return {}
                }
            }).then(function(data){
                if(data.length>0){
                    data.forEach(item => {
                        if(item.ulogo){
                            item.ulogo = `${window.myConfig.IMPORT_HTTP}${item.ulogo}` 
                        }
                        if(!item.uurl){
                            item.uurl=`/myIndex/${item.r_uid}/1`
                        }
                        if(item.rcreatetime){
                            item.rcreatetime =  new Date(item.rcreatetime).Format("yyyy-MM-dd");
                        }
                       
                    })
                }
                return data;
            })
            return data;
        },
        //回复
        replyEvent : function (){
            if(this.replyState){
                this.replyState=false;
                if(this.tinyBody==null){
                    this.replyMsg = "内容不能为空"
                }else if(this.tinyBody.length>this.tinyMaxSize){
                    this.replyMsg = "内容过长"
                }else {
                    ( async ()=>{
                        let that = this;
                        let _formData = new FormData();
                        _formData.append("reply",this.tinyBody);
                        _formData.append('tid',this.tid);
                        _formData.append('pid',this.pid);
                        await fetch(`${window.myConfig.IMPORT_HTTP}/reply`,{
                            method:"POST",
                            credentials: 'include',
                            body : _formData
                        }).then(function(response){
                            if(response.status===200){
                                return response.json();
                            }else {
                                return response.json();
                            }
                        }).then(function(data){
                            console.log(data)
                            if(data.error){
                                that.replyMsg = data.error;
                            }
                            if(data.ok){
                                that.replyMsg = data.ok;
                                let page = that.pages<1?1:that.pages;
                                console.log()
                                // 处理当前页刷新
                                if(page==that.page){
                                    that.$router.push("/");
                                    that.$router.go(-1);
                                }else {
                                    //跳转到最后一页
                                    that.$router.push(`/artcle/${that.tid}/${that.pid}/${that.pages}`)
                                }
                                
                            }
                            return data
                        })
                    })()
                }

            }

        }
    },
    async created(){
        {
            //判断是否有 登录状态cookie ，免登录处理
            let userInfo = window.myFunction.getCookie("userInfo");
            if(userInfo.length===0){
                this.userInfo = null;
            } else {
                userInfo = JSON.parse(userInfo);
                this.userInfo = userInfo;
                this.$store.dispatch("asideData",this.userInfo);
            }
        }
        {
            try {
                //更新 Aside 作者信息
                let postsUrl = `${window.myConfig.IMPORT_HTTP}/artcle/${this.tid}/${this.pid}`;
                this.artcle = await this.artcleInit(postsUrl);
                //更新引用
                this.artcleRefer = this.artcle.prefer;
                this.pages = Math.ceil(this.artcle.pecho/15);
                console.log(this.pages)
                this.$store.dispatch("asideData",this.artcle);
                //更新回复
                let replyUrl = `${window.myConfig.IMPORT_HTTP}/reply/${this.tid}/${this.pid}/${this.page}`;
                this.replyList = await this.replyListInit(replyUrl);
            } catch (e) {
                console.log(e)
            }
        }
    },
    async beforeRouteUpdate (to, from, next) {
        {
            try {
                if(to.params.tid===from.params.tid&&to.params.pid===from.params.pid&&to.params.page!==from.params.page){
                    //如果只变更了 page ,更新回复列表 
                    this.tid = to.params.tid;
                    this.pid = to.params.pid;
                    this.page = to.params.page; 
                    //更新回复
                    let replyUrl = `${window.myConfig.IMPORT_HTTP}/reply/${this.tid}/${this.pid}/${this.page}`
                    this.replyList = await this.replyListInit(replyUrl);
                    location.href="#replys"
                } else {
                    //其他条件变更了  ，数据全部更新
                    this.tid = to.params.tid;
                    this.pid = to.params.pid;
                    this.page = to.params.page;
                    //更新文章 和 引用 和aside
                    let postsUrl = `${window.myConfig.IMPORT_HTTP}/artcle/${this.tid}/${this.pid}`;
                    this.artcle = await this.artcleInit(postsUrl);
                    this.$store.dispatch("asideData",this.artcle);
                    this.artcleRefer = this.artcle.prefer;
                    //更新回复
                    let replyUrl = `${window.myConfig.IMPORT_HTTP}/reply/${this.tid}/${this.pid}/${this.page}`
                    this.replyList = await this.replyListInit(replyUrl);
                }
                
                next()
            } catch (e) {
                console.log(e)
            }
        }
    }
     
}
</script>
<style >
.content-ct {background-color: #fff; margin-top: 20px; }
.note  {margin: 20px; }
.title {padding-bottom: 20px; }
.title h1 {padding-bottom: 5px; border-bottom: 1px solid #d3d3d3; margin-bottom: 5px;}
.title span {margin-right: 15px;}
.title span, .title span a{ color: #888; }
.title span a { transition: 0.5s;}
.title span a:hover {color: #ff3131}

/*用于文章内容 */
.txt>* { margin-bottom: 10px;}
.txt hr { border: 0;border-bottom: 1px dashed #c3c3c3; margin: 5px 0;  }
.txt li {margin-left: 30px;}
.txt pre { background-color: #252525; letter-spacing: 1px; margin: 10px; padding: 0 15px;  padding-bottom: 5px;  border-radius: 10px; overflow: hidden; white-space: pre-wrap; word-wrap: break-word;}
.txt pre>code{ color: #fff; width: 100% }
.txt img {max-width: 100%; height:auto;}

.bg-eee {background-color: #eee;}
.resouce >* {padding-bottom: 10px; }
.resouce label{ font-size: 18px; font-weight: 500; letter-spacing: 2px; color: #464646; display: block;  }
.resouce li {margin-left: 15px; padding-left: 10px;border-left: 1px solid #777; margin-bottom: 3px; list-style: none ;}
.resouce li a { color:  #777;}
.resouce li a:hover { color:  #ff7d49;}

#echo-btn {text-align: center;line-height: 40px; margin: 10px; border: 1px solid #ddd; cursor:pointer}
#echo-btn:hover {border: 1px solid #333; background: linear-gradient(to right,rgba(243,245,249,0),rgba(243,245,249,100) 15%,rgba(243,245,249,100) 85%,rgba(243,245,249,0));}
.no-login  {margin: 30px auto; text-align: center;}
.no-login a {display: inline-block ;padding: 10px 30px; color: #f0f0f0; background-color: #ff7f50;margin-top: 10px; transform: 0.3s;}
.no-login a:hover { background-color: #ff6832;}
.reply-msg {color: #dc143c;text-align: center;height: 18px; margin: 10px; transition: 0.3s;padding: 5px 0; background-color: #ffe9ed}

.reply-box {margin: 20px;}
.reply-box section {margin-bottom: 40px; border-left: 1px solid #777; padding: 5px 0;}
.reply-box .user-box {padding-bottom: 5px; border-bottom: 1px dashed #ddd; }
.reply-box .user-box .user-img {font-size: 0; width: 50px; display: inline-block; margin-right:  15px; margin-left: 15px;}
.reply-box .user-box .user-img img{width:42px;;padding:3px;border-radius: 100%; border:1px solid #b9b9b9; transition: 0.5s;}
.reply-box .user-box .user-img:hover img{border:1px solid #ff7c24;}
.reply-box .user-text {line-height: 50px;}
.reply-box .user-text span {margin-right: 20px; color: #7c7c7c;}
.reply-box .user-text span a {color: #7c7c7c; transition: 0.5s;}
.reply-box .user-text span a:hover {color: #ff7c24;}

.reply-content {margin: 10px;}

#pages ul { text-align: center; list-style: none; margin: 10px;}
#pages li{display: inline-block;padding: 5px 10px;margin: 0 5px; border: 1px solid #777; cursor:pointer; transition: 0.5s; border-radius: 5px;}
#pages li:hover { background-color: #ff7b4b; color: #fff; border-radius:0 0 6px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.1);; }

</style>

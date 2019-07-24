<template>
    <div v-wechat-title="title">
        <div class="fl content-ct ">
            <transition name="fade">
                <loading :isLoading="isLoading"></loading>
            </transition>
            <article class="content-ct bs-1">
                <div class="artcleList">
                    <ul>
                       <li v-for="item in newArtcleList">
                            <div class="list-content">
                                <router-link class="for" :to="item.purl"></router-link>
                                <div class="clearfloat">
                                    <div class="fl list-logo"><router-link :to="item.turl"><img :src="item.tlogo"></router-link></div>
                                    <div class="">
                                        <h3>{{item.pname}}</h3>
                                        <p>
                                            <span class="dispay-show " ><icon class="iconfont icon-c-red n-icon-time"></icon> {{item.pcreatetime}}</span>
                                            <span ><icon class="iconfont icon-c-green n-icon-echo"></icon> {{item.pecho}}</span>
                                            <span ><icon class="iconfont icon-c-blue n-icon-theme"></icon> <router-link :to="item.turl">{{item.tname}}</router-link></span>
                                            <span ><icon class="iconfont icon-c-blueviolet n-icon-user"></icon> <router-link :to="item.uurl">{{item.uname}}</router-link></span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                        
                    </ul>
                </div>
            </article>
           
        </div>
      
    </div>
</template>
<script>

export default {
    name : 'C-newArtcle',

    data(){
        return {
            isLoading : true,
            title: `首页 - ${window.myConfig.HTTP_NAME}`,
            newArtcleList : []
        }
    },
    methods :{
        newArtcleInit : function(url){
            let data =  fetch(url,{method:"GET"}).then(function(response){
                if(response.status===200){
                    return response.json();
                } else {
                    return {}
                }
            }).then(function(data){
                if(data.length>0){
                    data.forEach(item =>{
                        if(item.pcreatetime){
                            item.pcreatetime  = new Date(item.pcreatetime).Format("yyyy-MM-dd");
                        }
                        if(!item.purl){
                            item.purl= `/artcle/${item.p_tid}/${item.pid}/1`
                        }
                        if(item.tlogo){
                            item.tlogo=`${window.myConfig.IMPORT_HTTP}${item.tlogo}`
                        }
                        if(!item.turl){
                            item.turl=`/artcleList/${item.p_tid}/1`
                        }
                        if(!item.uurl){
                            item.uurl = `/myIndex/${item.p_uid}/1`
                        }
                    })
                   
                }

                return data;
            });
            return data
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
                if(this.userInfo!==null){
                    this.$store.dispatch("asideData",this.userInfo);
                }
            }
        }
        {
            try {
                let url = `${window.myConfig.IMPORT_HTTP}/newArtcle/1`;
                this.newArtcleList = await this.newArtcleInit(url);
                this.isLoading =false ;
            } catch (e) {
                console.log(e)
            }
        }
    },
    async beforeRouteUpdate (to, from, next) {
         {
            try {
                let url = `${window.myConfig.IMPORT_HTTP}/newArtcle/1`;
                this.newArtcleList = await this.newArtcleInit(url);
                this.isLoading =false ;
            } catch (e) {
                console.log(e)
            }
        }
    }
}
</script>
<style  scoped>
.content-ct {background-color: #fff; margin-top: 20px; overflow: hidden; }
.note  {margin: 20px; padding-bottom: 20px;}
.title {padding-bottom: 20px; }
.title h1 {padding-bottom: 5px; border-bottom: 1px solid #d3d3d3; margin-bottom: 5px;}
.title span {margin-right: 15px;}
.title span, .title span *{ color: #888; }
.title span a { transition: 0.5s;}
.title span a:hover {color: #ff3131}



.txt>* { margin-bottom: 10px;}
.txt p{}
.txt hr { border: 0;border-bottom: 1px dashed #c3c3c3; }
.txt li {margin-left: 30px;}
.txt pre { background-color: #252525; margin: 10px; padding: 0 15px; border-radius: 10px; overflow: hidden; white-space: pre-wrap; word-wrap: break-word;}
.txt pre>code{ color: #fff; width: 100% }


.resouce >* {margin-bottom: 10px;}
.resouce label{ font-size: 18px; font-weight: 500; letter-spacing: 2px; color: #464646; display: block;}
.resouce li {margin-left: 15px; padding-left: 10px;border-left: 1px solid #777; margin-bottom: 3px; list-style: none ;}
.resouce li a { color:  #777;}
.resouce li a:hover { color:  #ff7d49;}

.artcleList ul { margin: 20px; list-style: none;}
.artcleList ul li .list-content {position: relative; padding:10px 0;  border-bottom: 1px solid #E1E3E9; }
.artcleList ul li .list-content:hover {    background: linear-gradient(to right,rgba(243,245,249,0),rgba(243,245,249,100) 15%,rgba(243,245,249,100) 85%,rgba(243,245,249,0));}
.artcleList .for {display: block; width: 100%; height: 100%; position: absolute; left: 0;top: 0;}
.artcleList p {display: block;}
.artcleList p span {position: relative;z-index: 2; margin-top: 5px; margin-right: 20px; display: inline-block;}
.artcleList h3 { font-weight: 500;}
.artcleList li:hover h3 { color: #ff8800; }
.artcleList p,.artcleList p a {color: #999999; transition: 0.5s;}
.artcleList p a:hover {color: red;}
.artcleList .list-logo {transition: 0.5s;width: 50px; font-size: 0; overflow: hidden; margin-right: 15px; position: relative; z-index: 2;}
.artcleList .list-logo img {width: 100%; border-radius: 20%;}
.artcleList li:hover .list-logo {margin-left: 15px;}

@media screen and (max-width: 1200px) {

.artcleList .dispay-show {display: none;}
}
@media screen and (min-width: 1201px) {

.artcleList .dispay-show {display: inline;}
}

</style>

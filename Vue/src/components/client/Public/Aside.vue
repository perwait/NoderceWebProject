<template>
    <div>
       <aside v-if="asideData" class="content-as  fr bs-1">
           <div class="aside ">
                <ul class="user">
                    <li class="user-logo">
                           <router-link :to="asideData.uurl"><img  :src="asideData.ulogo" ></router-link> 
                    </li>
                    <li class="user-txt">
                        <router-link :to="asideData.uurl">{{asideData.uname}}</router-link>
                    </li>
                    <li class="user-txt"><router-link :to="asideData.uurl">文章 <b>{{asideData.uartcles}}</b> 篇</router-link></li>
                    <li v-html="asideData.utxt"></li>
                    <li></li>
                    <li></li>
                </ul>   
           </div>
       </aside>
       <aside v-if="asideData==null" class="content-as  fr bs-1">
           <div class="aside ">
                <ul class="user">
                    <li class="user-logo">
                           <router-link to="/login/"><img  :src="defaultLogo" ></router-link> 
                    </li>
                    <li>登录后 可以发表主题和回复</li>
                    <li class="user-txt">
                        <router-link to="/login/">点击登录</router-link>
                    </li>
                    <li></li>
                    <li></li>
                </ul>   
           </div>
       </aside>
       
    </div>
</template>
<script>
import {mapState} from 'vuex'
export default {
    name : "C-aside",
    data(){
        return {
             defaultLogo : `${window.myConfig.IMPORT_HTTP}/img/user_default.jpg`
        }
    },
    computed:{
        ...mapState(["asideData"]),
        
    },
    created(){
    },
    methods :{

    },
    mounted : function(){
        
    },
    async beferRouteUpdate(){

    }
}
</script>
<style  scoped>
.content-as {overflow: hidden; margin-top: 20px; background-color: #fff;}
.aside {padding: 10px;}
.user { text-align: center;} 
.user li {margin-top: 10px; color: #666;}
.user-logo { font-size: 0;}
.user-logo img {width: 100px; border: 1px solid #777; border-radius: 100%; background-color: #fff; padding: 5px; }
.user-txt a{ color: #999; transition: 0.5s; font-weight: 300;} 
.user-txt a:hover { color: #ff7c24;}
</style>

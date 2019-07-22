<template>
    <div>
        <header class="header">
            <div class="container clearfix">
                <span class="fl logo">
                    <router-link to="/"><img src="@/assets/logo.png"><span class="max-750"><b>Noderce</b></span></router-link>
                </span>
                <span class="fr head-nav">
                    <ul>
                        <li><router-link to="/">首 页</router-link></li>
                        <li><router-link to="/allTheme/1">分 类</router-link></li>
                        <li><router-link to="/note">关 于</router-link></li>
                        <li v-if="userInfo!=null" class="user-logo"><router-link :to="userInfo.uurl"><img :src="userInfo.ulogo"/></router-link></li>
                        <li v-if="userInfo==null"><router-link to="/login">登 录</router-link></li>
                    </ul>
                </span>
            </div>    
        </header>
    </div>
</template>
<script>
export default {
    name : "C-header",
    data(){
        return {
            userInfo : null
        }
    },
    async created () {
        //判断是否有 登录状态cookie ，免登录处理
        let userInfo = window.myFunction.getCookie("userInfo");
        if(userInfo.length===0){
            this.userInfo = null;
        } else {
            userInfo = JSON.parse(userInfo);
            this.userInfo = userInfo;
        }
        
    }
}
</script>
<style scoped>
header.header {padding: 10px 0; background-color: #fff; border-bottom: 1px solid #666; }
.container { height: 40px;line-height: 40px;}
.header * { color: #333; }
.header .logo a { font-size: 17px; transition: 0.3s;}
.header .logo a img { margin:0 3px;height: 40px; vertical-align: middle;}
.header .logo a b {  transition: 0.3s;}
.header .logo a:hover b { color: red; letter-spacing : 3px; }

@media screen and (max-width: 800px) {
    .max-750 { display:none;}
}
@media screen and (min-width: 801px) {
    .max-750 { display: inline-block;}
}



.head-nav ul { list-style: none;}
.head-nav ul li {display: inline-block;  }
.head-nav ul li a { padding: 5px 10px;margin-left: 3px; transition: 0.5s; border-bottom: 1px solid #fff;} 
.head-nav ul li a:hover {color: red; border-bottom: 1px solid red;} 
.head-nav .user-logo {font-size: 0; vertical-align: middle;}
.head-nav .user-logo img { width: 30px; height: 30px; border-radius: 100%; vertical-align: middle; padding: 3px; border: 1px solid transparent; transition: 0.5s; }
.head-nav ul .user-logo a:hover { border-bottom:0 solid transparent; }
.head-nav ul .user-logo a:hover img {border: 1px solid #777; width: 40px; height: 40px; }
</style>

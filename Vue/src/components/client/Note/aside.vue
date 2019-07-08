<template>
    <div>
       <aside class="content-as  fr bs-1">
           <div class="aside ">
                <ul class="user">
                    <li class="user-logo">
                           <router-link to="/myIndex/1/1"><img  src="@/assets/user_admin.png" ></router-link> 
                    </li>
                    <li class="user-txt">
                        <a href="#">Admin</a>
                    </li>
                    
                    <li class="user-txt">-- 站长 --</li>
                    <li>和优秀的人在一起<br/>自己也会变得优秀</li>
                    <li></li>
                    <li></li>
                </ul>   
           </div>
       </aside>
    </div>
</template>
<script>
export default {

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

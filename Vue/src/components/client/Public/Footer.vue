<template>
    <div>
        <footer class="footer">
            <div class="container">
                <div>
                    <div v-if="friendlyList" class="liveURL tc">
                        推荐： 
                        <ul >
                            <li v-for="item in friendlyList"><a target="_blank" :href="item.url">{{item.name}}</a></li>
                        </ul>
                    </div>
                    <div>
                        <p class="tc">版权归 @Noderce.com 所有   <a target="_blank" :href="ICP.SRC">{{ICP.NUM}}</a></p>
                    </div>
                </div>
            </div>    
        </footer>
    </div>
</template>
<script>
export default {
    name : "C-footer",
    data(){
        return {
            //friendlyList : null,
            // 请求回来的 数据格式
            friendlyList : [
                {name:"favicon.ico在线制作",url:"http://www.faviconico.org/favicon"},
                {name:"菜鸟教程",url:"https://www.runoob.com/"}
                ],
            ICP : {
                SRC : window.myConfig.ICP_SRC,
                NUM :window.myConfig.ICP_NUMBER
            }    
        }
    }   

}
</script>
<style scoped>
footer.footer {  padding: 30px 0;  }
.container .tc { text-align: center; color: #888;}
.container  p a {  color: #888;}
.container p a { transition: 0.5s;}
.container p a:hover { color: red;}
.liveURL { color: #999; margin: 15px;}
.liveURL ul { list-style: none; display: inline-block;}
.liveURL ul li { display: inline-block; margin-left: 10px;}
.liveURL ul li a{ color: #999; padding-bottom: 5px; transition : 0.5s;}
.liveURL ul li a:hover{ color: #222; border-bottom: 1px solid #222;;}
</style>

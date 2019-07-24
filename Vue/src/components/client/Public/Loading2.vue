<template>
  <div :class="{'load-box':isLoad}">
    <div id="preloader_1">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>
  </div>
</template>
<script>
import { setTimeout } from 'timers';
export default {
    name: "loding",
    data(){
        return {
            isLoad :true
        }
    },
    props : ["isLoading"],
    watch  : {
        isLoading : function(val){
            if(val==true){
                this.isLoad = true;
            } else {
                let that = this;
                setTimeout(function(){
                    that.isLoad = false;
                },window.myConfig.LOADING_OK_TIME)
            }
        }
    }
}
</script>
<style scoped>

#preloader_1 {
	position: relative;
    transition: 1s;
    padding: 0px;
    opacity: 0;
    width: 120px;
    margin: 0 auto;
}
.load-box #preloader_1{
    padding: 20px;
    opacity: 1;
}

#preloader_1{
    position:relative;
}
#preloader_1 span{
    display:block;
    bottom:0px;
    width: 9px;
    height: 5px;
    background:#9b59b6;
    position:absolute;
    animation: preloader_1 1.5s  infinite ease-in-out;
}  
#preloader_1 span:nth-child(2){
    left:11px;
    animation-delay: .2s;  
}
#preloader_1 span:nth-child(3){
    left:22px;
    animation-delay: .4s;
}
#preloader_1 span:nth-child(4){
    left:33px;
    animation-delay: .6s;
}
#preloader_1 span:nth-child(5){
    left:44px;
    animation-delay: .8s;
}
@keyframes preloader_1 {
    0% {height:5px;transform:translateY(0px);background:#9b59b6;}
    25% {height:30px;transform:translateY(15px);background:#3498db;}
    50% {height:5px;transform:translateY(0px);background:#9b59b6;}
    100% {height:5px;transform:translateY(0px);background:#9b59b6;}
}


</style>



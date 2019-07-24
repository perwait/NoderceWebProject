<template>
  <div id="app">
    <router-view/>
 
  </div>
</template>

<script>

export default {

  name: 'App'
}
</script>

<style>
* {margin : 0; padding: 0;     font-family: 'pingfang SC','helvetica neue',arial,'hiragino sans gb','microsoft yahei ui','microsoft yahei',simsun,sans-serif;}
html , body { width: 100%; }
#client {width: 100%;height:100%}
.content {width: 100%; margin: 0 auto; }
a {text-decoration: none;}
.fl {float: left;}
.fr {float: right;}
#app {width: 100%;height: 100%;}



.fade-enter,
.fade-leave-active {
  height: 0;
  opacity: 0;
  padding: 0px;
}
.fade-enter-active,
.fade-leave-active {
  transition:  2s;
  height: auto;
  padding: 20px;
  
}
</style>

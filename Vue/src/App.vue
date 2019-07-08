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
html , body { width: 100%; overflow-x: hidden;}
#client {width: 100%;height:100%}
.content {width: 1200px; margin: 0 auto; }
a {text-decoration: none;}
.fl {float: left;}
.fr {float: right;}
#app {width: 100%;height: 100%;}
</style>

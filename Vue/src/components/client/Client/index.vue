<template>
  <div id="client">
  <div>
        <Header />
   </div>
   <div>
        <Nav />
   </div>
  
   <main class="main">
      <div class="container clearfloat">
          <router-view ></router-view>
          <router-view name="aside"></router-view>
      </div>
   </main>
    <div>
        <Footer />
   </div>
  </div>
</template>

<script>
import Header from '@/components/client/Public/Header'
import Footer from '@/components/client/Public/Footer'
import Nav from "@/components/client/Nav"
export default {
  name: 'Client',
  data () {
    return {
     
    }
  },
  components : {
    Header , Footer  , Nav
  }
}
</script>


<style>

* {margin : 0; padding: 0; }
html  body { width: 100%;  background-color: #e4e6dc;}
#client {width: 100%;}
.clearfloat:after{display:block;clear:both;content:"";visibility:hidden;height:0}
.clearfloat{zoom:1;}
.fl {float: left;}
.fr {float: right;}
.bs-1 { box-shadow: 0 2px 5px 0px #d4d4d4;}


.container {width: 1170px;  margin: 0 auto;}
.content-ct { width: 850px; }
.content-as { width: 290px;}
</style>

<template>
  <div>
    admin
     <editor  :init="{plugins: 'wordcount'}"></editor>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue';
export default {
  name: 'HelloWorld',
  data () {
    return {
     
    }
  },
  components: {
    'editor': Editor // <- Important part
  }
}
</script>


<style scoped>

</style>

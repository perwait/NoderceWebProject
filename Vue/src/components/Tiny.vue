<template>
  <div class="text-ed">
     <textarea :id= "Id" ></textarea>
  </div>
</template>

<script>
import './zh_CN.js'
import Editor from '@tinymce/tinymce-vue';
export default {
  name: 'App',
  data(){
    const Id = Date.now()
      return {
        Id: Id,
        Editor: null,
        DefaultConfig: {},
        

      } 
  },
  
    props: {
      value: {
        default: "",
        type: String
      },
      config: {
        type: Object,
        default: () => {
          return {
            theme: 'modern', //默认主题
            height: 200,
            max_height: 200,
            min_height: 200,
            //toolbar: true, //禁用工具栏
            resize: false, //禁用调整大小
            menubar: false, // 菜单栏
            branding: false, // 是否显示 品牌名
            elementpath: false, //隐藏底部 层级标签状态栏
            statusbar: false, //隐藏底部状态栏
            
          }
        }
      }
    },
    mounted () {
      this.init()
    },
    beforeDestroy () {
      // 销毁tinymce
      this.$emit('on-destroy')
      window.tinymce.remove(`#${this.Id}`)
      console.log("Tiny destroy")
    },
    methods: {
       init () {
        const self = this
        this.Editor = window.tinymce.init({
          // 默认配置
          ...this.DefaultConfig,
          
          // prop内传入的的config
          ...this.config, 
          
          // 挂载的DOM对象
          selector: `#${this.Id}`,
          
          setup: (editor) => {
            // 抛出 'on-ready' 事件钩子
            editor.on(
              'init', () => {
                self.loading = false
                self.$emit('on-ready')
                editor.setContent(self.value)
              }
            )
            // 抛出 'input' 事件钩子，同步value数据
            editor.on(
              'input change undo redo', () => {
                self.$emit('input', editor.getContent())
              }
            )
          }
        })
        console.log("Tiny Init");
      }
    }
}
</script>
<style scoped>
textarea { resize:none}
</style>


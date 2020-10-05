import Vue from 'vue'
import {Button , Form , FormItem ,Input ,Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 把message组件挂在在Vue原型中
Vue.prototype.$message = Message

import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(Router)

const router =  new Router({
  routes:[
    { path:'/', redirect: '/login'},
    { path:'/login', component: Login },
    { path:'/home', component: Home },
  ]
})

// 挂载路由导航守卫
// to 访问的路径   from 代表那个路径跳转而来的   next 一个函数表示放心
router.beforeEach((to, from , next) => {
  if(to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr)  return next('./login')
  next()
})

export default router

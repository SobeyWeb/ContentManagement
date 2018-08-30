import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import Index from '@/components/Index'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/helloworld',
      name: 'helloworld',
      component: HelloWorld,
      children: [
        {
          path: 'login',
          name: 'login',
          component: Login
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/index',
      alias: '/',
      name: 'index',
      component: Index
    }
  ]
})

<template>
  <div class="container">
    <h1 style="margin-bottom:50px;">
      <div style="text-aligin:center;"><img src="../assets/login_logo.png" /></div>
    </h1>

    <form class="form">
      <input type="text" :placeholder="$t('Username')" @keydown.enter="login" v-model="username" autocomplete="off">

      <input type="password" :placeholder="$t('Password')" @keydown.enter="login" v-model="password" autocomplete="off">

      <button type="button" :disabled="loading" @click="login">{{$t('Login')}}</button>

      <div class="msg-text" style="color: rgb(248, 155, 57);">{{$t(msg||errorMsg)}}</div>
    </form>
  </div>
</template>

<script>
import PERMISSION from '../dicts/permission.js'
import TYPES from '../dicts/mutationTypes.js'
import EVENT from './dicts/eventTypes.js'
export default {
  name: 'Login',
  data () {
    return {
      ip: '123',
      username: '',
      password: '',
      errorMsg: '',
      loading: false
    }
  },
  computed: {
    msg () {
      let msg = ''
      if (!this.username) {
        msg = 'Username can\'t be empty!'
      } else if (!this.password) {
        msg = 'Password can\'t be empty!'
      } else if (/[<>/:*?"|]+/g.test(this.username)) {
        msg = 'Invalid username! Username can cannot contain /: *? "< > | special symbols!'
      } else {
        msg = ''
      }
      return msg
    }
  },
  methods: {
    login () {
      if (this.msg || this.loading) {
      } else {
        this.loading = true
        this.errorMsg = 'Please Wait...'
        let isDomain = this.username.includes('\\')
        this.$store.dispatch({
          type: TYPES.LOGIN,
          data: {
            isDomain: isDomain,
            username: this.username,
            password: this.password,
            ip: this.ip
          }
        }).then(res => {
          let userInfo = res.ext
          userInfo.sitecode = userInfo.organizations[0] && userInfo.organizations[0].sitecode
          userInfo.username = userInfo.loginname.replace(/.*\\(.*)/g, '$1') // domain account
          this.$store.commit({
            type: TYPES.SET_USERINFO,
            data: userInfo
          })
          this.$store.dispatch({
            type: TYPES.INTERCEPT_AXIOS
          })
          // can user use cm or plugin
          this.$store.dispatch({
            type: TYPES.GET_USERPERMISSION,
            data: {
              system: this.$store.state.system ? 'WEBCM' : 'PREMIEREPLUGIN',
              popedomname: this.$store.state.system ? 'CANUSEWEBCM' : 'CANUSEPREMIERE'
            }
          }).then(res => {
            if (res.ext) {
              this.$app.emit(EVENT.LOGINED, [this]) // dispatch login event
              this.$router.push('/index')
              this.loading = false
              localStorage.setItem('loginName', this.username)
              // get user info
              this.$store.dispatch({
                type: TYPES.GET_USERINFOBYID
              }).then(res => {
                this.$store.state.userInfo.isAdmin = res.ext.type === 1
                this.$store.state.userInfo.permission = res.ext.funcPermission.map(item => item.permissionName)
                if (res.ext.templates && res.ext.templates.length) {
                  this.$store.state.userInfo.privilege = res.data.ext.templates[0].templatecode
                } else {
                  this.$store.state.userInfo.privilege = 'private_' + this.$store.state.userInfo.usercode
                }
              }).catch(err => {
                console.log(err)
              }) // get user permission

              this.$store.dispatch({
                type: TYPES.GET_USERPERMISSION,
                data: {
                  popedomname: 'ETAdministrator'
                }
              }).then(res => {
                this.$store.state.userInfo.roletype = res.ext
              }).catch(err => {
                console.log(err)
              })
            } else {
              this.loading = false
              this.errorMsg = 'You have no right to access the application!'
            }
          }).catch(err => {
            console.log(err)
            this.loading = false
            this.errorMsg = 'You have no right to access the application!'
          })
        }).catch(err => {
          this.loading = false
          this.errorMsg = err.message
          // console.log(err)
        })
      }
    }
  },
  created () {
    // get client ip
    this.$store.dispatch({
      type: TYPES.GET_CLIENT_IP
    }).then(res => (this.ip = res.data))

    let userName = localStorage.getItem('loginName') // Remember last login name
    this.username = userName || ''
    console.log(PERMISSION)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  width: 500px;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.container h1 {
  font-size: 40px;
  -webkit-transition-duration: 1s;
  transition-duration: 1s;
  -webkit-transition-timing-function: ease-in-put;
  transition-timing-function: ease-in-put;
  font-weight: 200;
  color: #fff;
  margin-bottom: 50px;
}
form {
  position: relative;
  z-index: 2;
}
form input {
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: 0;
  border: 1px solid rgba(255, 255, 255, 0.63);
  background-color: rgba(255, 255, 255, 0.2);
  width: 300px;
  border-radius: 3px;
  padding: 10px 15px;
  margin: 0 auto 10px auto;
  display: block;
  text-align: center;
  font-size: 18px;
  color: white;
  -webkit-transition-duration: 0.25s;
  transition-duration: 0.25s;
  font-weight: 300;
}
input:-webkit-autofill {
  border: 1px solid rgba(255, 255, 255, 0.63);
  background-color: rgba(255, 255, 255, 0.2);
}
form button {
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: 0;
  background-color: white;
  border: 0;
  padding: 10px 15px;
  color: #ffffff;
  border-radius: 3px;
  width: 300px;
  cursor: pointer;
  background: #f5a721;
  font-size: 18px;
  width: 330px;
  height: 45px;
  font-size: 18px;
  -webkit-transition-duration: 0.25s;
  transition-duration: 0.25s;
}
.msg-text {
  margin-top: 10px;
  font-size: 15px;
  height: 30px;
  line-height: 30px;
  font-family: 'proximanova,Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #fff;
  width: 330px;
  margin: 5px auto;
}
</style>

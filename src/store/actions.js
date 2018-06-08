import TYPES from '../dicts/mutationTypes.js'
import API_CONFIG from '../config/apiConfig.js'
import NODETYPES from '../dicts/guidMaps.js'
import axios from 'axios'
let md5 = require('../lib/md5.min.js').md5
export default {
  // Intercept request
  [TYPES.INTERCEPT_AXIOS] (context, payload) {
    axios.interceptors.request.use(
      config => {
        Object.assign(config.headers.common, {
          'sobeyhive-http-system': context.state.system || 'WEBCM',
          'sobeyhive-http-site': context.state.userInfo.sitecode || 'S1',
          'sobeyhive-http-token': context.state.userInfo.usertoken,
          'sobeyhive-http-tool': context.state.system || 'WEBCM'
        })
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    axios.interceptors.response.use(
      response => {
        return response
      },
      error => {
        return Promise.reject(error)
      }
    )
  },
  // get client ip for login
  [TYPES.GET_CLIENT_IP] (context, payload) {
    return axios.get(API_CONFIG[TYPES.GET_CLIENT_IP]())
  },
  // login
  [TYPES.LOGIN] (context, payload) {
    return new Promise((resolve, reject) => {
      let url = API_CONFIG[TYPES.LOGIN](payload.data.isDomain)
      axios
        .post(url, {
          LOGINNAME: payload.data.username,
          LOGINPWD: payload.data.isDomain
            ? payload.data.password
            : md5(payload.data.password),
          LOGINSUBSYSTEM: context.state.system,
          LOGINIP: payload.data.ip
        })
        .then(res => {
          if (res.data.code === '0') {
            resolve(res.data)
          } else {
            let msg = ''
            let code = res.data.code
            if (['10002', '10010', '103', '200', '201', '902'].includes(code)) {
              msg = 'Invalid Username or Password'
            } else if (['10004', '903'].includes(code)) {
              msg = 'Current account disabled!'
            } else if (['10007', '901'].includes(code)) {
              msg = res.data.msg
            } else if (['10006', '500'].includes(code)) {
              msg = 'Login call failed! Check database connection'
            } else {
              msg = 'Login failed!'
            }
            reject(new Error(msg))
          }
        })
        .catch(res => {
          reject(new Error('Login error!'))
        })
    })
  },
  // get user info
  [TYPES.GET_USERINFOBYID] (context, payload) {
    let url = API_CONFIG[TYPES.GET_USERINFOBYID]({
      userid: context.state.userInfo.userid,
      usertoken: context.state.userInfo.userid
    })
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data.code === '0') {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      })
    })
  },
  // get user permission
  [TYPES.GET_USERPERMISSION] (context, payload) {
    let url = API_CONFIG[TYPES.GET_USERPERMISSION]({
      usertoken: context.state.userInfo.usertoken
    })
    return new Promise((resolve, reject) => {
      axios
        .post(url, [
          {
            system: payload.data.system,
            tool: 'DEFAULT',
            popedomname: payload.data.popedomname
          }
        ])
        .then(res => {
          if (res.data.code === '0') {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  // node click
  [TYPES.NODE_CLICK] (context, payload) {
    let node = payload.data.target
    switch (node.guid) {
      case NODETYPES.SEARCH_RESULT:
        context.commit({
          type: TYPES.GET_NAVPATH,
          target: node,
          data: []
        })
        break
      case NODETYPES.SEARCH_TEMPLATE:
        context
          .dispatch({
            type: TYPES.GET_SEARCHRESULT,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
        break
      case NODETYPES.FAVORITE:
        context
          .dispatch({
            type: TYPES.GET_FAVORITERESULT,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
        break
      case NODETYPES.TRASHCAN:
        context
          .dispatch({
            type: TYPES.GET_TRASHCAN_OBJECTS,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
        break
      default:
        context
          .dispatch({
            type: TYPES.GET_MATERIALS,
            source: node
          })
          .then(() => {
            context.commit({
              type: TYPES.GET_NAVPATH,
              target: node,
              data: []
            })
          })
    }
  }
}

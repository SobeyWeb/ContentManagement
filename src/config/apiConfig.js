import URLCONFIG from './urlConfig.js'
import TYPES from '../dicts/mutationTypes.js'
import util from '../lib/util.js'
export default {
  [TYPES.GET_CLIENT_IP] () {
    return URLCONFIG.PROXY + '/ip'
  },
  [TYPES.LOGIN] (isDomain) {
    return isDomain
      ? URLCONFIG.CMAPI + '/CMApi/api/v2/basic/account/login'
      : URLCONFIG.CMAPI + '/CMApi/api/basic/account/login'
  },
  [TYPES.GET_USERINFOBYID] (para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getuserinfobyuserid',
      para
    )
  },
  [TYPES.GET_USERPERMISSION] (para) {
    console.log(util)
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/testfunctionpopedom',
      para
    )
  }
}

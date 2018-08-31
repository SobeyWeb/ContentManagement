import URLCONFIG from './urlConfig.js'
import TYPES from '../dicts/mutationTypes.js'
import * as util from '../lib/util.js'
export default {
  [TYPES.GET_CLIENT_IP]() {
    return URLCONFIG.PROXY + '/ip'
  },
  [TYPES.LOGIN](isDomain) {
    return isDomain
      ? URLCONFIG.CMAPI + '/CMApi/api/v2/basic/account/login'
      : URLCONFIG.CMAPI + '/CMApi/api/basic/account/login'
  },
  [TYPES.GET_USERINFOBYID](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getuserinfobyuserid',
      para
    )
  },
  [TYPES.GET_USERPERMISSION](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/testfunctionpopedom',
      para
    )
  },
  [TYPES.GET_ALLUSER](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getalluser',
      para
    )
  },
  [TYPES.GET_ALLDEPT](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getalldeptinfo',
      para
    )
  },
  [TYPES.GET_NASPATH](para) {
    return util.getUrl(
      URLCONFIG.CMAPI +
        '/CMApi/api/basic/user/getcurrentusercanwritepathbycondition',
      para
    )
  },
  [TYPES.GET_S3PATH](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/user/getcurrentuserpath',
      para
    )
  },
  [TYPES.GET_DING](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v1/entity/ding/getdinginfo',
      para
    )
  },
  [TYPES.GET_SEARCH_QUERY](para) {
    return URLCONFIG.HIVE + '/solar-api/material-list-ext/user/search-templates'
  },
  [TYPES.GET_ACTIONLIST_INFO]() {
    return URLCONFIG.PROXY + '/proxy'
  },
  [TYPES.GET_MEMBERLIST_INFO]() {
    return URLCONFIG.PROXY + '/proxy'
  },
  [TYPES.GET_MATERIALS_BY_PAGE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v2/entity/object/getchildobjects',
      para
    )
  },
  [TYPES.GET_FOLDERS](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/folder/getsimplefolderinfo',
      para
    )
  },
  [TYPES.GET_USERSPACE](para) {
    console.log(util)
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/account/getuserstoragebyname',
      para
    )
  },
  [TYPES.GETSYSPARAM](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/basic/config/getsysparam',
      para
    )
  },
  [TYPES.GET_SNSCONFIG](para) {
    return util.getUrl(
      URLCONFIG.CMAPI +
        '/CMApi/api/basic/account/getuserextendattributes/' +
        para.userid
    )
  },
  [TYPES.GET_OBJECT_INFO](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v2/entity/object/getobjectinfo',
      para
    )
  },
  [TYPES.GET_TWITTER_ACOUNTS](para) {
    return util.getUrl(URLCONFIG.CMAPI + '/CMApi/api/sns/getsnsaccounts')
  },
  [TYPES.PUBLISH_TO_SNS](para) {
    return util.getUrl(URLCONFIG.CMAPI + '/CMApi/api/sns/publishtosns')
  },
  [TYPES.GET_STUDIO](para) {
    return util.getUrl(URLCONFIG.PLAYOUT + '/api/Studio/GetStudioList')
  },
  [TYPES.GET_RUNDOWN_LIST](para) {
    return util.getUrl(URLCONFIG.PLAYOUT + '/api/Studio/GetRundownList')
  },
  [TYPES.GET_EVENTS](para) {
    return util.getUrl(URLCONFIG.PLAYOUT + '/api/Studio/GetEventList')
  },
  [TYPES.GET_PROGRAMEINFO_LIST](para) {
    return util.getUrl(URLCONFIG.PLAYOUT + '/api/Studio/GetStoryList')
  },
  [TYPES.GET_NOTIFYPLAYOUT](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/notifyplayout',
      para
    )
  },
  [TYPES.REGISTER_TO_EVENT](para) {
    return util.getUrl(URLCONFIG.PLAYOUT + '/api/Studio/RegisterOAMaterial')
  },
  [TYPES.ISONLY_TRANSNOTCODES](para) {
    return util.getUrl(URLCONFIG.PLAYOUT + '/api/Studio/IsOnlyTransNotCodec')
  },
  [TYPES.CAN_TRANSCODING](para) {
    return util.getUrl(URLCONFIG.PLAYOUT + '/api/Studio/CanTranscoding')
  },
  [TYPES.REGISTER_TO_OAFOLDER](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/transferclipoanonotify',
      para
    )
  },
  [TYPES.FRAGMENT_REGISTER](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/transferclipoanonotify',
      para
    )
  }
}

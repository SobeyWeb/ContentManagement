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
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/transferclipoanonotify'
    )
  },
  [TYPES.GET_CUSTOM_METADATA](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/metadatcustom/getcustommetadata',
      para
    )
  },
  [TYPES.RENAME](para, type) {
    if (type === 'folder') {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/entity/folder/renamefolder',
        para
      )
    } else {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/entity/object/renameobject',
        para
      )
    }
  },
  [TYPES.ADD_FOLDER](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/folder/createfolder',
      para
    )
  },
  [TYPES.RECYCLE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/deleteobjects',
      para
    )
  },
  [TYPES.DELETE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/purgeobjects',
      para
    )
  },
  [TYPES.RESTORE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/restoreobjectsfromrecycle',
      para
    )
  },
  [TYPES.GET_EXPORTSITES](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/database/getjsonbysql',
      para
    )
  },
  [TYPES.GET_FILTER_SETTING](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/database/getjsonbysql',
      para
    )
  },
  [TYPES.SET_FILTER_SETTING](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/database/updateanddelete',
      para
    )
  },
  [TYPES.SAVE_TASK](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/commongw/savetask',
      para
    )
  },
  [TYPES.GET_IMPORT_INFO](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/entityrest/getImportInfo',
      para
    )
  },
  [TYPES.GENERATING_LOW_BITRATE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/entityrest/generatinglowbitrate',
      para
    )
  },
  [TYPES.ADD_TASK](para) {
    return util.getUrl(URLCONFIG.TMSERVICE + '/sobey/plat/cmd', para)
  },
  [TYPES.MOVE_OBJECTS](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/moveobjects',
      para
    )
  },
  [TYPES.SAVE_OBJECT_INFO](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/saveobjectinfo',
      para
    )
  },
  [TYPES.GET_TRASHCAN_OBJECTS_BY_PAGE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/recycleresourcesearch',
      para
    )
  },
  [TYPES.CLEAR_TRASHCAN_OBJECTS](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/clearrecovery',
      para
    )
  },
  [TYPES.SET_STAMPBYFRAME](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/createframe',
      para
    )
  },
  [TYPES.RETRIEVE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/process/archivingmovement',
      para
    )
  },
  [TYPES.PART_RETRIEVE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/process/movementcreatenewclip',
      para
    )
  },
  [TYPES.UPDATE_MARKERPOINTS](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/updatemarkpoint',
      para
    )
  },
  [TYPES.DELETE_MARKERPOINTS](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/deletemarkpoint',
      para
    )
  },
  [TYPES.GET_FILESIZE](para, type) {
    if (type === 'folder') {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/entity/folder/foldersize',
        para
      )
    } else {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/entity/clip/clipsize',
        para
      )
    }
  },
  [TYPES.IS_PERMISSION](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/ispermission',
      para
    )
  },
  [TYPES.GET_PLANNING_INFO](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/Planning/GetPlanningInfoByGUID',
      para
    )
  },
  [TYPES.GET_FILEFORMAT](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/clip/getmediaformatdefbyid',
      para
    )
  },
  [TYPES.LOCK_OBEJCTS](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/lockobjbytype',
      para
    )
  },
  [TYPES.SET_PERMISSION](para, flag) {
    if (flag) {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/entity/object/updatepermission',
        para
      )
    } else {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/entity/object/updateentitypermission',
        para
      )
    }
  },
  [TYPES.SET_MARKER_STAMP](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/createframe',
      para
    )
  },
  [TYPES.GET_TRASHCAN_OBJECT_INFO](para) {
    return util.getUrl(
      URLCONFIG.CMAPI +
        '/CMApi/api/entity/object/recycleresourcesearchbycontentid',
      para
    )
  },
  [TYPES.COPY_OBJECT](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/copyobject',
      para
    )
  },
  [TYPES.MARKERS_TO_CLIP](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/clip/savenewclip',
      para
    )
  },
  [TYPES.SAVE_AS_NEWCLIP](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/clip/savenewclip',
      para
    )
  },
  [TYPES.GET_ICONSOURCE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/getkeyframbycontentid',
      para
    )
  },
  [TYPES.GET_MARK_ICONSOURCE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v2/entity/metadata/searchkeyframeinfo',
      para
    )
  },
  [TYPES.TRIM_SEND_TO_MPC](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/trimsendtompc',
      para
    )
  },
  [TYPES.LIVE_TRIM](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/clip/trimnewclip',
      para
    )
  },
  [TYPES.GET_TRASHCAN_FILELIST](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/object/recycleresourcefilelist',
      para
    )
  },
  [TYPES.GET_TASK](para) {
    return util.getUrl(URLCONFIG.TMSERVICE + '/sobey/plat/cmd', para)
  },
  [TYPES.ADVANCE_SEARCH_MATERIALS_BY_PAGE](flag, para1, para2) {
    if (flag) {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/v2/entity/object/searchmarkpoint',
        para1
      )
    } else {
      return util.getUrl(
        URLCONFIG.CMAPI + '/CMApi/api/v2/entity/object/fulltextadvancesearch',
        para2
      )
    }
  },
  [TYPES.SET_SEARCH_QUERY](para) {
    return util.getUrl(
      URLCONFIG.HIVE + '/solar-api/material-list-ext/user/search-templates',
      para
    )
  },
  [TYPES.MODIFY_SEARCH_QUERY](id) {
    return (
      URLCONFIG.HIVE +
      '/solar-api/material-list-ext/user/search-templates/' +
      id
    )
  },
  [TYPES.GET_CUSTOM_SEARCH_CONDTION](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/metadatcustom/getcustomfielddetails',
      para
    )
  },
  [TYPES.FULLTEXT_SEARCH_MATERIALS_BY_PAGE](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v2/entity/search/fulltextsearchnew',
      para
    )
  },
  [TYPES.SAVE_FRAME_AS_CLIP](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/clip/clipsaveasimgbyiconno',
      para
    )
  },
  [TYPES.GET_DING](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v1/entity/ding/getdinginfo',
      para
    )
  },
  [TYPES.SET_DING](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v1/entity/ding/adddingrecord',
      para
    )
  },
  [TYPES.DELETE_DING](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v1/entity/ding/deletedingrecord',
      para
    )
  },
  [TYPES.GET_DING_COUNT](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/v1/entity/ding/getdingcount',
      para
    )
  },
  [TYPES.GET_BAR_CODE](para) {
    return util.getUrl(URLCONFIG.CMAPI + '/CMApi/api/v1/entity/barcode', para)
  },
  [TYPES.GENERATE_PROXY](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/entity/flow/generateproxy',
      para
    )
  },
  [TYPES.ADD_GENERATION](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/relation/createonegeneration',
      para
    )
  },
  [TYPES.GET_GENERATION](para) {
    return util.getUrl(
      URLCONFIG.CMAPI + '/CMApi/api/relation/queryonegeneration',
      para
    )
  },
  [TYPES.PRE_SNSPUBLISH](para) {
    return util.getUrl(URLCONFIG.CMAPI + '/CMApi/api/sns/presnspublish', para)
  }
}

export function frameToTime(frame, rate) {
  var h, m, s, f
  f = Math.round(frame % rate)
  h = Math.floor(frame / (rate * 60 * 60))
  m = Math.floor(frame / (rate * 60)) % 60
  s = Math.floor(frame / rate) % 60
  return h.fixZero() + ':' + m.fixZero() + ':' + s.fixZero() + '.' + f.fixZero()
}

export const HiveEntityType = {
  ET_ENTITY_TYPE_PGM: 'biz_sobey_program',
  ET_ENTITY_TYPE_OTHER: 'biz_sobey_other',
  ET_ENTITY_TYPE_DOCUMENT: 'biz_sobey_document',
  ET_ENTITY_TYPE_PIC: 'biz_sobey_picture',
  ET_ENTITY_TYPE_AUDIO: 'biz_sobey_audio',
  ET_ENTITY_TYPE_VIDEO: 'biz_sobey_video',
  ET_ENTITY_TYPE_FOLDER: 'folder'
}
export const ObjectType = {
  ET_ObjType_Unknow: 0x00, // Invalid
  ET_ObjType_SysTemplate: 0x001, // 系统模版
  ET_ObjType_PublicTemplate: 0x002, // 公共模版
  ET_ObjType_PrivateTemplate: 0x004, // 私有模版
  ET_ObjType_Folder: 0x010, // 文件夹
  ET_ObjType_Clip: 0x020, // 素材
  ET_ObjType_Pgm: 0x040, // 节目
  ET_ObjType_Template: 0x080, // 模板
  ET_ObjType_EDL: 0x100, // EDL
  ET_ObjType_CD: 0x200, // 光盘
  ET_ObjType_Event: 0x400, // EventData（解析时临时使用）
  ET_ObjType_Plan: 0x800, // 增加planType 用于新建plan
  ET_ObjType_LKEvent: 0x1000, // 场记事件
  ET_ObjType_Doc: 0x2000, // 文稿
  ET_ObjType_SenceMark: 0x8000, // Mark Point
  ET_ObjType_File: 0xa000 // windows file
}
const ClipSubType = {
  // 素材子类型
  ET_CLIPTYPE_UNKNOW: 0x000000, // 未知素材
  ET_CLIPTYPE_AV: 0x000001, // 普通视音频素材
  ET_CLIPTYPE_V: 0x000002, // 普通视频素材
  ET_CLIPTYPE_A: 0x000004, // 普通音频素材
  ET_CLIPTYPE_XDCAM: 0x000008, // 蓝光素材
  ET_CLIPTYPE_TGA: 0x000010, // TGA素材
  ET_CLIPTYPE_IMAGE: 0x000020, // 图片
  ET_CLIPTYPE_P2: 0x000040, // P2素材
  ET_CLIPTYPE_SGCLIP: 0x000080, // SG素材，彩条素材
  ET_CLIPTYPE_HIDE: 0x000100, // 隐藏素材
  ET_CLIPTYPE_OA_EMPTYCLIP: 0x000200, // OA FOLDER中的空素材
  ET_CLIPTYPE_XDCAM_LIST: 0x000400, // 蓝光素材表现方式，为了和ET_CLIPTYPE_XDCAM，单个区分开
  ET_CLIPTYPE_P2_LIST: 0x000800, // 和XDCAM 方式一样
  ET_CLIPTYPE_INFINITY: 0x001000, // Infinity clip
  ET_CLIPTYPE_TXT: 0x002000, // txt文件
  ET_CLIPTYPE_WORD: 0x004000, // word 文件
  ET_CLIPTYPE_PPT: 0x008000, // ppt 文件
  ET_CLIPTYPE_EXCEL: 0x010000, // excel 文件
  ET_CLIPTYPE_PROJECT: 0x020000, // project 文件
  ET_CLIPTYPE_PDF: 0x040000, // pdf 文件
  ET_CLIPTYPE_MFEDL: 0x080000, // 多格式EDL素材子类型 add by wcj 2010 -5 -5
  ET_CLIPTYPE_E2: 0x100000, // E2素材
  ET_CLIPTYPE_E2_LIST: 0x200000, //
  ET_CLIPTYPE_DVD: 0x400000,
  ET_CLIPTYPE_OTHER: 0x8000000,
  ET_CLIPTYPE_ZIP: 0x10000000,
  ET_CLIPTYPE_DOCUMENT:
    this.ET_CLIPTYPE_TXT |
    this.ET_CLIPTYPE_WORD |
    this.ET_CLIPTYPE_PPT |
    this.ET_CLIPTYPE_EXCEL |
    this.ET_CLIPTYPE_PROJECT |
    this.ET_CLIPTYPE_PDF,
  ET_CLIPTYPE_PREMIERE: 0x20000000, // premiere的工程文件
  ET_CLIPTYPE_AE: 0x80000000 // After Effects的工程文件
}

export function GetEntityType(type, subtype) {
  if (type === ObjectType.ET_ObjType_Clip) {
    if (
      subtype === ClipSubType.ET_CLIPTYPE_AV ||
      subtype === ClipSubType.ET_CLIPTYPE_V ||
      subtype === 512 ||
      subtype === 1024 ||
      subtype === 2048 ||
      subtype === 8388608
    ) {
      return HiveEntityType.ET_ENTITY_TYPE_VIDEO
    } else if (subtype === ClipSubType.ET_CLIPTYPE_A) {
      return HiveEntityType.ET_ENTITY_TYPE_AUDIO
    } else if (
      subtype === ClipSubType.ET_CLIPTYPE_PPT ||
      subtype === ClipSubType.ET_CLIPTYPE_TXT ||
      subtype === ClipSubType.ET_CLIPTYPE_WORD ||
      subtype === ClipSubType.ET_CLIPTYPE_PPT ||
      subtype === ClipSubType.ET_CLIPTYPE_EXCEL ||
      subtype === ClipSubType.ET_CLIPTYPE_PROJECT ||
      subtype === ClipSubType.ET_CLIPTYPE_PDF
    ) {
      return HiveEntityType.ET_ENTITY_TYPE_DOCUMENT
    } else if (subtype === ClipSubType.ET_CLIPTYPE_IMAGE) {
      return HiveEntityType.ET_ENTITY_TYPE_PIC
    } else if (
      subtype === ClipSubType.ET_CLIPTYPE_XDCAM_LIST ||
      subtype === ClipSubType.ET_CLIPTYPE_P2_LIST
    ) {
      // P2和fileimport经来的素材，都是音视频的。
      return HiveEntityType.ET_ENTITY_TYPE_VIDEO
    } else if (
      subtype === ClipSubType.ET_CLIPTYPE_ZIP ||
      subtype === ClipSubType.ET_CLIPTYPE_OTHER
    ) {
      return HiveEntityType.ET_ENTITY_TYPE_OTHER
    } else {
      return HiveEntityType.ET_ENTITY_TYPE_OTHER
    }
  } else if (type === ObjectType.ET_ObjType_Pgm) {
    return HiveEntityType.ET_ENTITY_TYPE_PGM
  } else if (type === ObjectType.ET_ObjType_Folder) {
    return HiveEntityType.ET_ENTITY_TYPE_FOLDER
  } else {
    return HiveEntityType.ET_ENTITY_TYPE_OTHER
  }
}

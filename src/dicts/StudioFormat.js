/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import { GetTimeStringByFrameNum } from '../lib/format.js'
export const EventStatusType = {
  Idle: 0,
  NextStandby: 1,
  Cueing: 2,
  Standby: 3,
  Play: 4,
  Freeze: 5,
  End: 6,
  Skipped: 7,
  Error: 8,
  Preparing: 9,
  Skip: 10
}
var ET_VideoStandard_PAL = 0x00000001
var ET_VideoStandard_NTSC_2997 = 0x00000002
var ET_VideoStandard_1280_720_50p = 0x00004000
var ET_VideoStandard_1280_720_5994p = 0x00008000
export function getEnumKeyByValue(value, type) {
  for (var k in type) {
    if (type[k] === value) return k
  }
  return null
}
export const FilterGroupTypeOperator = {
  OR: 0,
  AND: 1
}
export const ConditionType = {
  EQUALS: 0,
  NOT_EQUALS: 1,
  CONTAINS: 2,
  NOT_CONTAINS: 3,
  LESS_THAN: 4,
  LESS_THAN_OR_EQUAL_TO: 5,
  GREATER_THAN: 6,
  GREATER_THAN_OR_EQUAL_TO: 7
}
export const StoryTypeEnum = {
  Main: 0,
  Sub: 1,
  All: 2
}
export const StudioSystemStandard = {}
export function SetStudioSystemStandard(studioId, systemStandard) {
  if (Object.keys(StudioSystemStandard).indexOf(studioId.toString()) >= 0) {
    StudioSystemStandard[studioId] = systemStandard
  } else {
    StudioSystemStandard[studioId] = systemStandard
  }
}

export function GetStudioSystemStandard(studioId) {
  if (Object.keys(StudioSystemStandard).indexOf(studioId.toString()) >= 0) {
    return StudioSystemStandard[studioId]
  } else {
    return -1
  }
}
export function strDateTime1(str) {
  var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/)
  if (r == null) return false
  var d = new Date(r[1], r[3] - 1, r[4])
  return (
    d.getFullYear() === r[1] &&
    d.getMonth() + 1 === r[3] &&
    d.getDate() === r[4]
  )
}
export function getTimeStringByFrameNum2(lFrameNum, lNtscTcMode) {
  if (lNtscTcMode === 0 || lNtscTcMode === 1 || lNtscTcMode === 2) {
    if (lNtscTcMode === 0) {
      return GetTimeStringByFrameNum(
        lFrameNum,
        lNtscTcMode === 1 ? 0 : 1,
        ET_VideoStandard_PAL,
        lNtscTcMode ? 30 : 25
      )
    } else {
      return GetTimeStringByFrameNum(
        lFrameNum,
        lNtscTcMode === 1 ? 0 : 1,
        ET_VideoStandard_NTSC_2997,
        lNtscTcMode ? 30 : 25
      )
    }
  }
  if (lNtscTcMode === 3 || lNtscTcMode === 4 || lNtscTcMode === 5) {
    if (lNtscTcMode === 3) {
      return GetTimeStringByFrameNum(
        lFrameNum,
        lNtscTcMode === 4 ? 0 : 1,
        ET_VideoStandard_1280_720_50p,
        lNtscTcMode ? 30 : 25
      )
    } else {
      return GetTimeStringByFrameNum(
        lFrameNum,
        lNtscTcMode === 4 ? 0 : 1,
        ET_VideoStandard_1280_720_5994p,
        lNtscTcMode ? 30 : 25
      )
    }
  }
}

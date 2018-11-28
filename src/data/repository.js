import treeNode from './treeNode.js'
const repository = {
  '86023a7e3f2646a2bbee8a9fec7e6bcb': [
    treeNode.trashcan
  ]
}

function getRepository(key) {
  return repository[key] || ((repository[key] = []), repository[key])
}

function setRepository(key, val) {
  if (Array.isArray(val)) {
    repository[key] = val.groupBy('guid').map(item => item[0]) // distinct
  } else {
    repository[key] = getRepository(val)
  }
}

function pureGetRepository(key) {
  return repository[key] || []
}
export {
  getRepository,
  setRepository,
  pureGetRepository
}

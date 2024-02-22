import request from './../utils/request'
import store from './../store/index'
import md5 from 'md5'
/**
 * 获取用户信息
 * @nickname {*} nickname
 * @password {*} password
 * @returns
 */
export const getUserInfo = (nickname, password) => {
  return request.post('/user/login', {
    nickname: nickname,
    password: password,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @key {*} key
 * @str {*} str
 * @step {*} step
 * @returns
 */
export const addRecord = (type, time, key, str, step) => {
  return request.post('/user/addRecord', {
    userId: store.state.userId,
    key: key,
    type: type,
    time: time,
    str: str,
    step: step,
  })
}

/**
 * 获取挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const getRecord = (id) => {
  return request.get('/user/getRecord', {
    id: id,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const start = (key) => {
  return request.post('/user/start', {
    key: key,
  })
}

/**
 * 用户可以挑战的最大维度
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const getMaxDimension = () => {
  return request.post('/user/getMaxDimension', {
    userId: store.state.userId,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const step = (dimension, str, key, num) => {
  return request.post('/user/step', {
    key: key,
    type: dimension,
    str: str,
    num: num,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const getRandom = (dimension) => {
  return request.post('/user/getRandom', {
    userId: store.state.userId,
    type: dimension,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const getRankList = () => {
  return request.get('/user/getRankList')
}

/**
 * 记录挑战记录维度
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const getRankDimension = () => {
  return request.get('/user/getRankDimension')
}

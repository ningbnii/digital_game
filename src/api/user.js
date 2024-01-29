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
 * @returns
 */
export const addRecord = (type, time) => {
  return request.post('/user/addRecord', {
    userId: store.state.userId,
    type: type,
    time: time,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const start = () => {
  return request.post('/user/start', {
    userId: store.state.userId,
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
export const step = (dimension, str) => {
  return request.post('/user/step', {
    userId: store.state.userId,
    type: dimension,
    str: str,
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

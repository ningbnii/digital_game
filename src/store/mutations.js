const mutations = {
  // 用时
  setTime(state, time) {
    state.time = time
  },
  // 昵称
  setNickname(state, nickname) {
    state.nickname = nickname
  },
  // 用户id
  setUserId(state, userId) {
    state.userId = userId
  },
  // 实时在线人数
  setOnlineNum(state, onlineNum) {
    state.onlineNum = onlineNum
  },
  // 维度
  setDimension(state, dimension) {
    state.dimension = dimension
  },
  // 最大游戏维度
  setMaxDimension(state, maxDimension) {
    state.maxDimension = maxDimension
  },
  // 是否登录
  setIsLogin(state, isLogin) {
    console.log('isLogin: ' + isLogin)
    state.isLogin = isLogin
  },
}

export default mutations

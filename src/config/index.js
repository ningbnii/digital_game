const ENV = process.env.NODE_ENV
const ENV_CONFIG = {
  // 开发环境
  development: {
    // baseUrl: 'http://127.0.0.1:8787',
    // wsNoticeUrl: 'ws://127.0.0.1:3131',
    // wsGameUrl: 'ws://127.0.0.1:7272',
    baseUrl: 'https://demo.api.wxbuluo.com',
    wsNoticeUrl: 'wss://demo.api.wxbuluo.com',
    wsGameUrl: 'wss://demo.api.wxbuluo.com/game',
  },
  //  生产环境
  production: {
    baseUrl: 'https://demo.api.wxbuluo.com',
    wsNoticeUrl: 'wss://demo.api.wxbuluo.com',
    wsGameUrl: 'wss://demo.api.wxbuluo.com/game',
  },
}

export default {
  ...ENV_CONFIG[ENV],
}

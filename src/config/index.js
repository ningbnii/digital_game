const ENV = process.env.NODE_ENV
const ENV_CONFIG = {
  // 开发环境
  development: {
    baseUrl: 'https://demo.api.wxbuluo.com',
    wsUrl: 'ws://127.0.0.1:3131',
  },
  //  生产环境
  production: {
    baseUrl: 'https://demo.api.wxbuluo.com',
    wsUrl: 'wss://demo.api.wxbuluo.com',
  },
}

export default {
  ...ENV_CONFIG[ENV],
}

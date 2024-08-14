<template>
  <div class="absolute bottom-0 left-0 mb-4 w-full text-center text-gray-700 text-sm">
    <p>温馨提示：鼠标一次可以移动多个方块，键盘只能移动一个方块，左手wasd，右手方向键</p>
    <!-- <div class="flex flex-row items-center justify-center">
      <span>学习交流QQ：296720094</span>
      <a class="flex" target="_blank" href="https://res.abeim.cn/api/qq/?qq=296720094"><img style="margin-bottom: 10px" border="0" src="https://www.wxbuluo.com/static/images/qq.png" alt="点击这里给我发消息" title="点击这里给我发消息" /></a>
    </div> -->
    <p>当前在线：{{ onlineNum }}</p>
  </div>

  <div class="absolute top-0 right-0 m-4 flex">


    <!-- <a class="hidden sm:flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 justify-center items-center" target="_blank" href="https://pan.baidu.com/s/1wVSVgXp75dmapsoDsoGu1A?pwd=bx3y">
      <svg class="icon w-100 h-200 mr-1" aria-hidden="true">
        <use xlink:href="#icon-android"></use>
      </svg>
      <svg class="icon w-100 h-200" aria-hidden="true">
        <use xlink:href="#icon-Windows"></use>
      </svg>
      <span class="ml-1">Download</span>
    </a> -->
    <a class="flex bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2 justify-center items-center" target="_blank" href="https://github.com/ningbnii/digital_game">
      <svg class="icon w-100 h-200 mr-1" aria-hidden="true">
        <use xlink:href="#icon-github"></use>
      </svg>
      <span class="ml-1">GitHub</span>
    </a>
    <button class="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded" @click="goRank">排行榜</button>
  </div>

  <div class="absolute top-0 left-0 m-4" v-show="isLogin">
    <select class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" v-model="dimension" @change="changeDimension">
      <option v-for="item in dimensionList" :key="item" :value="item">{{ item }}维</option>
    </select>
  </div>

  <div class="h-screen w-screen" ref="canvasBox">
    <div ref="myCanvas"></div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
// import * as Phaser from 'Phaser'
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin.js'
import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin.js'
import Game from '../components/game.js'
import Boot from '../components/boot.js'
import Preloader from '../components/preloader.js'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getMaxDimension } from '../api/user.js'

let myCanvas = ref(null)
let canvasBox = ref(null)
let game
const router = useRouter()
const store = useStore()

// 实时在线人数，从vuex中获取，使用计算属性
const onlineNum = computed(() => {
  return store.state.onlineNum
})

// 是否登录
const isLogin = computed(() => {
  return store.state.isLogin
})

// 游戏维度
let dimensionList = ref([])
// 默认维度为3
let dimension = ref(store.state.dimension)
watch(
  () => store.state.dimension,
  (newVal, oldVal) => {
    dimension.value = newVal
  }
)

// 获取游戏最大维度，生成维度列表dimensionList
const getDimensionList = () => {
  getMaxDimension().then((res) => {
    store.commit('setMaxDimension', res)
    dimensionList.value = []
    for (let i = 3; i <= res; i++) {
      dimensionList.value.push(i)
    }
  })
}

// 登录后再请求
watch(
  () => store.state.isLogin,
  (newVal, oldVal) => {
    if (newVal) {
      getDimensionList()
    }
  }
)

// getDimensionList()

// 监听游戏最大维度，当游戏最大维度改变时，重置维度列表
watch(
  () => store.state.maxDimension,
  (newVal, oldVal) => {
    getDimensionList()
  }
)

// 监听游戏维度，当游戏维度改变时，重置游戏

// 重置维度
const changeDimension = () => {
  store.commit('setDimension', dimension.value)
  game.scene.stop('Game')
  game.scene.start('Game', { dimension: dimension.value })
  // 选择完后，设置select失去焦点
  document.querySelector('select').blur()
}

onMounted(() => {
  let config = {
    type: Phaser.AUTO,
    render: {
      pixelArt: true, // 像素风格
      antialias: true, // 抗锯齿
      transparent: true, // 透明背景
    },
    width: canvasBox.value.clientWidth,
    height: canvasBox.value.clientHeight,
    parent: myCanvas.value,
    // backgroundColor: 'rgb(39 39 42 )',
    dom: {
      createContainer: true,
    },
    input: {
      mouse: {
        target: myCanvas.value,
      },
      touch: {
        target: myCanvas.value,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    title: 'Author QQ：296720094',
    url: 'https://wxbuluo.com',
    banner: false,
    // backgroundColor: '#fff',
    scene: [Boot, Preloader, Game],
    // 禁用右键菜单
    disableContextMenu: true,
    plugins: {
      global: [
        {
          key: 'rexRoundRectanglePlugin',
          plugin: RoundRectanglePlugin,
          start: true,
        },
        {
          key: 'rexInputTextPlugin',
          plugin: InputTextPlugin,
          start: true,
        },
      ],
    },
  }
  game = new Phaser.Game(config)
})

const goRank = () => {
  router.push('/rank')
}

onUnmounted(() => {
  for (let key in game.scene.keys) {
    if (game.scene.keys.hasOwnProperty(key)) {
      game.scene.stop(key)
      game.scene.keys[key] = undefined
    }
  }
})
</script>
<style scoped></style>

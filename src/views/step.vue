<template>
  <!-- 顶部左侧添加一个返回上一页按钮 -->
  <div class="flex flex-row items-center justify-left px-4 fixed">
    <button class="hover:bg-gray-400 font-bold py-2" @click="$router.back()">返回</button>
  </div>
  <!-- 在右上角添加一个设置速度 -->
  <div class="absolute top-0 right-0 m-4">
    <!-- 添加一个label，显示文字：播放速度 -->
    <label for="speed" class="text-gray-700">播放速度：</label>
    <select class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" v-model="speed" @change="changeSpeed">
      <option v-for="item in speedArr" :key="item" :value="item">{{ item }}</option>
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
import Step from '../components/step.js'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

let myCanvas = ref(null)
let canvasBox = ref(null)
let game

const route = useRoute()
const store = useStore()
// 获取路由参数
const id = route.query.id
const stepScene = new Step(id)

// 播放速度
let speed = ref(store.state.speed)
let speedArr = ref([1, 2, 3, 4])

// 改变速度
const changeSpeed = () => {
  store.commit('setSpeed', speed.value)
  stepScene.play()
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
    scene: [stepScene],
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

onUnmounted(() => {
  for (let key in game.scene.keys) {
    if (game.scene.keys.hasOwnProperty(key)) {
      game.scene.stop(key)
      game.scene.keys[key] = undefined
    }
  }
})
</script>

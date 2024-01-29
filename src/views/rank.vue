<template>
  <!-- 顶部左侧添加一个返回上一页按钮 -->
  <div class="flex flex-row items-center justify-left">
    <button class="hover:bg-gray-400 font-bold py-2 px-4" @click="$router.back()">返回</button>
  </div>
  <!-- 显示排行榜三个字 -->
  <div class="flex flex-col items-center justify-center">
    <div class="text-2xl font-bold">排行榜</div>
  </div>
  <!-- 显示维度3维，4维...，循环生成，以button方式展示，button颜色灰色系，横向排列 -->
  <div class="flex flex-row items-center justify-center">
    <button class="hover:bg-gray-400 font-bold py-2 px-4" v-for="item in rankDimension" :key="item" :class="activeDimension == item ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'" @click="changeDimension(item)">{{ item }}维</button>
  </div>

  <!-- 根据上面维度，显示对应维度的排行榜 -->
  <!-- 显示排行榜的表头，显示nickname和time，tailwindCss布局 -->
  <div class="flex flex-row items-center justify-center">
    <!-- 排名 -->
    <div class="w-1/2 text-center">排名</div>
    <div class="w-1/2 text-center">昵称</div>
    <div class="w-1/2 text-center">时间</div>
  </div>
  <!-- 显示排行榜的内容，显示nickname和time，tailwindCss布局，循环rankList -->
  <!-- 先循环维度，再循环排名 -->
  <div v-for="(item, index) in rankList" :key="index">
    <div class="flex flex-row items-center justify-center" v-for="(item1, index1) in item" :key="index1" v-show="activeDimension == index">
      <!-- 排名 -->
      <div class="w-1/2 text-center">{{ item1.rank }}</div>
      <div class="w-1/2 text-center" v-html="item1.nickname"></div>
      <div class="w-1/2 text-center">{{ Math.floor(item1.time / 1000) + "'" + (item1.time % 1000) + "''" }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getRankList, getRankDimension } from '../api/user.js'

let rankList = ref([])
let rankDimension = ref([])
// 激活状态的维度
let activeDimension = ref(0)

const changeDimension = (item) => {
  activeDimension.value = item
}

onMounted(() => {
  getRankList().then((res) => {
    rankList.value = res
  })

  getRankDimension().then((res) => {
    rankDimension.value = res
    // 默认激活第一个维度
    activeDimension.value = res[0]
  })
})
</script>

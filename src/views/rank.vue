<template>
  <!-- 搞一个div，固定，不跟随滚动条滚动 -->
  <div class="fixed top-0 left-0 w-full bg-white px-4">
    <!-- 顶部左侧添加一个返回上一页按钮 -->
    <div class="flex flex-row items-center justify-left">
      <button class="hover:bg-gray-400 font-bold py-2" @click="$router.back()">返回</button>
    </div>
    <!-- 显示排行榜三个字 -->
    <div class="flex flex-col items-center justify-center">
      <div class="text-2xl font-bold">排行榜</div>
      <!-- 添加一个新赛季倒计时 -->
      <div class="text-base text-gray-500">新赛季倒计时：{{ countDown }}</div>
    </div>
    <!-- 显示维度3维，4维...，循环生成，以button方式展示，button颜色灰色系，横向排列 -->
    <div class="flex flex-row items-center justify-between overflow-x-scroll">
      <button class="hover:bg-gray-400 font-bold py-2 px-4 flex-auto" v-for="item in rankDimension" :key="item" :class="activeDimension == item ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'" @click="changeDimension(item)">{{ item }}维</button>
    </div>
    <!-- 根据上面维度，显示对应维度的排行榜 -->
    <!-- 显示排行榜的表头，显示nickname和time，tailwindCss布局 -->
    <div class="flex flex-row items-center justify-center mt-2">
      <!-- 排名 -->
      <div class="w-1/2 text-center">排名</div>
      <div class="w-1/2 text-center">昵称</div>
      <div class="w-1/2 text-center">时间</div>
      <div class="w-1/2 text-center">步数</div>
      <!-- 步骤 -->
      <div class="w-1/2 text-center">步骤</div>
    </div>
  </div>

  <!-- 显示排行榜的内容，显示nickname和time，tailwindCss布局，循环rankList，奇数和偶数排名背景色区分 -->
  <!-- 先循环维度，再循环排名 -->
  <div v-for="(item, index) in rankList" :key="index" class="mt-48">
    <div class="flex flex-row items-center justify-center even:bg-gray-200 odd:bg-white py-2" v-for="(item1, index1) in item" :key="index1" v-show="activeDimension == index">
      <!-- 排名 -->
      <div class="w-1/2 text-center">{{ item1.rank }}</div>
      <div class="w-1/2 text-center" :class="item1.nickname == nickname ? 'text-red-500' : ''">{{ item1.nickname }}</div>
      <div class="w-1/2 text-center">{{ Math.floor(item1.time / 1000) + "'" + (item1.time % 1000) + "''" }}</div>
      <div class="w-1/2 text-center">{{ item1.num }}</div>
      <!-- 步骤 -->
      <div class="w-1/2 text-center">
        <!-- 一个按钮，点击跳转到步骤页面 -->
        <button class="hover:bg-gray-400 font-bold py-2 px-4" @click="goToStep(item1.id)">查看</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getRankList, getRankDimension } from '../api/user.js'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

let rankList = ref([])
let rankDimension = ref([])
// 激活状态的维度
let activeDimension = ref(0)
const store = useStore()
const router = useRouter()
const nickname = store.state.nickname

const changeDimension = (item) => {
  activeDimension.value = item
}

// 倒计时，每周日晚上12点更新排行榜
let countDown = ref('')
const countDownTime = () => {
  let now = new Date()
  let day = now.getDay()
  let hour = now.getHours()
  let minute = now.getMinutes()
  let second = now.getSeconds()
  let countDownDay = 7 - day
  let countDownHour = 23 - hour
  let countDownMinute = 59 - minute
  let countDownSecond = 59 - second
  countDown.value = countDownDay + '天' + countDownHour + '小时' + countDownMinute + '分钟' + countDownSecond + '秒'
}
setInterval(() => {
  countDownTime()
}, 1000)

// 跳转到步骤页面
const goToStep = (id) => {
  router.push({ path: '/step', query: { id: id } })
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

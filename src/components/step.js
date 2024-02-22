import GameItem from './gameItem.js'
import store from '../store/index.js'
import Swal from 'sweetalert2'

import { addRecord, start, step, getRandom, getMaxDimension, getRecord } from '../api/user.js'

export default class Step extends Phaser.Scene {
  constructor(id) {
    super('Game')
    this.id = id
  }

  init(data) {
    this.timeValue = 0
    this.timeStart = false
    // 将时间清零
    this.timeValue = 0
    this.dimension = 3
    // 移除计时器
    this.timer && this.timer.remove()
    this.isCompleteStatus = false
    this.key = ''
    this.clickNumberArr = []
  }

  async create() {
    this.gameItems = []
    // 保存数字二维数组
    this.numbers = []
    // 数字维数，4行4列

    // this.itemWidth = 100
    // 方格间隔
    this.itemPadding = 5
    // 生成随机数字
    await this.createCompleteStr()
    // 方格宽度
    // 如果是手机端，方格宽度为屏幕宽度减掉两边的padding，再除以dimension
    // 判断是否是手机端
    if (this.sys.game.device.os.desktop) {
      // pc端
      // 方格宽度为高度的1/2/dimension
      this.itemWidth = Math.round(this.sys.game.config.height / 2 / this.dimension)
    } else {
      // 手机端
      this.itemWidth = Math.round((this.sys.game.config.width - 20 - 5 * this.dimension) / this.dimension)
    }

    // 创建一个颜色数组
    const colors = []
    const colorArr = ['#FF8B8B', '#61BFAD', '#E54B4B', '#167c80', '#b7e3e4', '#efe8d8', '#005397', '#32b67a', '#fbcbc1', '#f3c9dd', '#0bbcd6', '#bfb5d7', '#f0cf61', '#0e38b1', '#a6cfe2', '#ef3e4a']
    for (let i = 0; i < this.dimension; i++) {
      colors.push(Phaser.Display.Color.HexStringToColor(colorArr[i]))
    }

    // 创建16个方块
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        // 计算数字是第几行，向上取整
        let gameItem = null
        if (this.numbers[i][j] == 0) {
          // 创建一个方块
          gameItem = new GameItem(this, 0, 0, this.itemWidth, this.numbers[i][j], i, j)
        } else {
          const col = Math.floor((this.numbers[i][j] - 1) / this.dimension)
          // 创建一个方块
          gameItem = new GameItem(this, 0, 0, this.itemWidth, this.numbers[i][j], i, j, colors[col].color)
        }

        this.gameItems.push(gameItem)
      }
    }

    // 每一秒移动
    this.step = 0

    this.play()

    // 将方块添加到一个容器中
    const container = this.add.container(0, 0, this.gameItems)
    // 设置容器的大小
    container.setSize(this.itemWidth * this.dimension + this.itemPadding * (this.dimension - 1), this.itemWidth * this.dimension + this.itemPadding * (this.dimension - 1))

    // 计算容器容器的宽度和高度
    const containerWidth = container.width
    const containerHeight = container.height
    // 计算容器的中心点
    const containerCenterX = containerWidth / 2
    const containerCenterY = containerHeight / 2

    // 添加主相机
    const mainCamera = this.cameras.main
    // 将主相机的中心点设置为容器的中心点
    // 计算容器的中心点

    mainCamera.centerOn(containerCenterX, containerCenterY)

    // 将方块分成4行4列，每个方块之间间隔10px
    Phaser.Actions.GridAlign(this.gameItems, {
      width: this.dimension,
      height: this.dimension,
      // 保留2位小数，方法为四舍五入，函数为Math.round，示例：1.2345.toFixed(2) // 1.23
      cellWidth: this.itemWidth + this.itemPadding,
      cellHeight: this.itemWidth + this.itemPadding,
      x: 0,
      y: 0,
      position: Phaser.Display.Align.TOP_LEFT,
    })

    // 在方格下方，屏幕中间，添加一个按钮，用于重新播放动画
    // 位置屏幕中间
    const button = this.add
      .text(containerCenterX, -40, 'Replay', {
        fontSize: '32px',
        color: '#000',
        padding: {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive()

    button.on('pointerdown', () => {
      this.scene.stop()
      this.scene.start()
    })
  }

  play() {
    this.speed = store.state.speed
    this.timer && this.timer.remove()
    this.timer = this.time.addEvent({
      delay: 1000 / Math.pow(2, this.speed - 1),
      callback: () => {
        if (this.isCompleteStatus) {
          // 如果完成了，则停止计时器
          this.timer.remove()
          return false
        }
        if (this.tweensArr) {
          for (let i = 0; i < this.tweensArr.length; i++) {
            if (this.tweensArr[i].isPlaying()) {
              return false
            }
          }
        }

        // 开始计时
        if (!this.timeStart) {
          this.timeStart = true
        }
        this.zeroIndex = this.findNumberIndex(0)
        // 点击的数字
        const clickNum = this.clickNumArr[this.step]
        const gameObject = this.gameItems[this.findNumberIndex(Number(clickNum))]
        // 通过数字的i和j，判断数字和0是否相邻
        // 获取当前数字的i和j
        const { i, j } = gameObject
        // 获取0的i和j
        const { i: zeroI, j: zeroJ } = this.gameItems[this.zeroIndex]
        // 如果当前数字和0相邻，则交换位置
        // 找到当前数字和0之间，垂直或水平方向上的所有数字
        // 如果当前数字和0在同一行
        let exceptZeroNumbers = []
        // 如果当前数字和0在同一列，或者在同一行，则移动，否则不移动
        if (i === zeroI || (j === zeroJ && !(i === zeroI && j === zeroJ))) {
          if (i === zeroI) {
            // 如果当前数字在0的左边
            if (j < zeroJ) {
              // 找到0左边和当前数字之间的数字，包括当前数字，不包括0，从0开始，到当前数字的位置，当前数字位置为j
              for (let k = j; k < zeroJ; k++) {
                exceptZeroNumbers.push(this.numbers[i][k])
              }
              exceptZeroNumbers.reverse()
            } else {
              // 找到0右边和当前数字之间的数字，包括当前数字，不包括0，从当前数字的位置，到0的位置，当前数字位置为j
              for (let k = zeroJ + 1; k <= j; k++) {
                exceptZeroNumbers.push(this.numbers[i][k])
              }
            }
          }

          // 如果当前数字和0在同一列
          if (j === zeroJ) {
            // 如果当前数字在0的上边
            if (i < zeroI) {
              // 找到0上边的数字
              for (let k = i; k < zeroI; k++) {
                exceptZeroNumbers.push(this.numbers[k][j])
              }
              exceptZeroNumbers.reverse()
            } else {
              // 找到0下边的数字
              for (let k = zeroI + 1; k <= i; k++) {
                exceptZeroNumbers.push(this.numbers[k][j])
              }
            }
          }

          const exceptZeroNumbersIndex = []
          exceptZeroNumbers.forEach((item) => {
            exceptZeroNumbersIndex.push(this.findNumberIndex(item))
          })
          const moveNumberArr = []

          for (let k = 0; k < exceptZeroNumbersIndex.length; k++) {
            if (k === 0) {
              moveNumberArr.push({
                number: this.gameItems[exceptZeroNumbersIndex[k]],
                x: this.gameItems[this.zeroIndex].x, // 第一个移动到0的位置
                y: this.gameItems[this.zeroIndex].y,
                i: this.gameItems[this.zeroIndex].i,
                j: this.gameItems[this.zeroIndex].j,
              })
            } else {
              moveNumberArr.push({
                number: this.gameItems[exceptZeroNumbersIndex[k]],
                x: this.gameItems[exceptZeroNumbersIndex[k - 1]].x, // 第一个移动到0的位置
                y: this.gameItems[exceptZeroNumbersIndex[k - 1]].y,
                i: this.gameItems[exceptZeroNumbersIndex[k - 1]].i,
                j: this.gameItems[exceptZeroNumbersIndex[k - 1]].j,
              })
            }
          }
          // 将0移动到当前数字的位置
          moveNumberArr.push({
            number: this.gameItems[this.zeroIndex],
            x: gameObject.x,
            y: gameObject.y,
            i: gameObject.i,
            j: gameObject.j,
          })
          this.moveNumber(moveNumberArr)
        }

        this.step++
      },
      loop: true,
    })
  }

  update() {}

  // 找到数字在gameItems中的索引
  findNumberIndex(num) {
    for (let i = 0; i < this.gameItems.length; i++) {
      if (this.gameItems[i].number === num) {
        return i
      }
    }
  }

  moveNumber(arr) {
    this.tweensArr = []

    const number = arr[arr.length - 2].number.number
    this.clickNumberArr.push(number)
    for (let i = 0; i < arr.length; i++) {
      const tween = this.tweens.add({
        targets: arr[i].number,
        x: arr[i].x,
        y: arr[i].y,
        duration: 50,
        ease: 'easeIn',
        onComplete: () => {
          this.numbers[arr[i].i][arr[i].j] = arr[i].number.number
          // 交换数字的i和j
          arr[i].number.i = arr[i].i
          arr[i].number.j = arr[i].j
          if (i === arr.length - 1) {
            this.isComplete(number)
          }
        },
      })
      this.tweensArr.push(tween)
    }
  }

  // 创建完成的字符串
  createCompleteStr() {
    return new Promise((resolve, reject) => {
      this.completeArr = []
      this.completeStr = ''
      for (let i = 1; i < this.dimension * this.dimension; i++) {
        this.completeArr.push(i)
      }
      this.completeArr.push(0)
      this.completeStr = this.completeArr.join(',')
      // 随机打乱数字
      // 将completeArr转成二维数组，每行包含this.dimension个数字
      this.numbers = []

      getRecord(this.id).then((res) => {
        this.dimension = res.type
        const arr = res.start_str.split(',').map((item) => {
          return Number(item)
        })
        for (let i = 0; i < this.dimension; i++) {
          this.numbers.push(arr.slice(i * this.dimension, (i + 1) * this.dimension))
        }
        this.clickNumArr = res.click_num_str.split(',')

        resolve()
      })
    })
  }

  // 判断是否完成
  isComplete(number) {
    // 判断是否完成

    // 遍历二维数组this.numbers，拼接成字符串，和完成的字符串比较
    let arr = []
    let str = ''
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        arr.push(this.numbers[i][j])
      }
    }

    str = arr.join(',')
    if (str === this.completeStr) {
      this.isCompleteStatus = true
    } else {
      this.isCompleteStatus = false
    }
    if (this.isCompleteStatus) {
      this.timeStart = false
    }
  }
}

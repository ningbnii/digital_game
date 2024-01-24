import GameItem from './gameItem.js'
import store from '../store/index.js'
import Swal from 'sweetalert2'
import { addRecord } from '../api/user.js'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
    this.dimension = 3 // 维数
    this.timeValue = 0
  }

  create() {
    // 播放背景音乐
    // 判断是否正在播放背景音乐，如果没有播放，则播放背景音乐，如果正在播放，则不播放
    if (!this.sound.get('music')) {
      this.sound.play('music', { loop: true })
    }
    this.gameItems = []
    // 保存数字二维数组
    this.numbers = []
    // 数字维数，4行4列

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

    // this.itemWidth = 100
    // 方格间隔
    this.itemPadding = 5
    // 生成随机数字
    this.createCompleteStr()

    // 创建16个方块
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        // 创建一个方块
        const gameItem = new GameItem(this, 0, 0, this.itemWidth, this.numbers[i][j], i, j)
        // 将方块添加到数组中
        this.gameItems.push(gameItem)
      }
    }

    // 创建一个文本，用于显示用时
    // 设置文字样式
    const fontStyle = {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#ffffff',
      fontStyle: 'bold',
      padding: 5,
      shadow: {
        color: '#000000',
        fill: true,
        offsetX: 2,
        offsetY: 2,
        blur: 4,
      },
    }
    // 计算文本的位置，位于方格的container的右上角

    this.timeText = this.add.text(0, -40, 'time：0', fontStyle)

    const nicknameText = this.add.text(0, -80, `${store.state.nickname}`, fontStyle)
    // 添加到场景中
    this.add.existing(this.timeText)
    // 文本和container右边对齐，上边对齐

    // 使用Phaser的计时器
    this.timer = this.time.addEvent({
      delay: 1,
      callback: () => {
        if (this.timeStart) {
          this.timeValue++
          // 计算出秒和毫秒
          this.second = Math.floor(this.timeValue / 1000)
          this.millisecond = this.timeValue % 1000
          // 将秒和毫秒格式化为second'millisecond''的形式
          this.timeText.setText(`time：${this.second}'${this.millisecond}''`)
        }
      },
      callbackScope: this,
      loop: true,
    })

    // 点击数字，找到该数字和0之间，垂直或水平方向上的所有数字，按照数字的顺序，依次移动到0的位置
    this.input.on('gameobjectdown', async (pointer, gameObject) => {
      // 播放音效
      this.sound.play('pickup')
      // 开始计时
      if (!this.timeStart) {
        this.timeStart = true
      }
      this.zeroIndex = this.findNumberIndex(0)

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
    })

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
  }

  // 找到数字在gameItems中的索引
  findNumberIndex(num) {
    for (let i = 0; i < this.gameItems.length; i++) {
      if (this.gameItems[i].number === num) {
        return i
      }
    }
  }

  moveNumber(arr) {
    for (let i = 0; i < arr.length; i++) {
      this.tweens.add({
        targets: arr[i].number,
        x: arr[i].x,
        y: arr[i].y,
        duration: 100,
        ease: 'Linear',
        onComplete: () => {
          this.numbers[arr[i].i][arr[i].j] = arr[i].number.number

          // // 交换数字的i和j
          arr[i].number.i = arr[i].i
          arr[i].number.j = arr[i].j
          // 判断是否完成
          this.isComplete()
        },
      })
    }
  }

  // 交换数字
  swapNumber(number1, number2) {
    const { x: x1, y: y1 } = number1
    const { x: x2, y: y2 } = number2
    // 添加动画，当所有动画执行完毕后，再执行resolve

    this.tweens.add({
      targets: number1,
      x: x2,
      y: y2,
      duration: 100,
      ease: 'Linear',
    })
    this.tweens.add({
      targets: number2,
      x: x1,
      y: y1,
      duration: 100,
      ease: 'Linear',
    })
    // number1.setPosition(x2, y2)
    // number2.setPosition(x1, y1)
  }

  // 交换数字在二维数组中的位置
  swapNumberInArray(number1, number2) {
    // 交换数字在二维数组中的位置
    const { i: x1, j: y1 } = number1
    const { i: x2, j: y2 } = number2
    const temp = this.numbers[x1][y1]
    this.numbers[x1][y1] = this.numbers[x2][y2]
    this.numbers[x2][y2] = temp
    // 交换数字的i和j
    number1.i = x2
    number1.j = y2
    number2.i = x1
    number2.j = y1
    // 判断是否完成
    this.isComplete()
  }

  // 创建完成的字符串
  createCompleteStr() {
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
    for (let i = 0; i < this.completeArr.length; i += this.dimension) {
      this.numbers.push(this.completeArr.slice(i, i + this.dimension))
    }

    // 模拟交换0和其他数字的位置，交换100次
    for (let i = 0; i < 10000; i++) {
      // 找到this.numbers中0的位置，0和它相邻的数字交换位置
      // 找到0的位置
      let zeroI = 0
      let zeroJ = 0
      for (let i = 0; i < this.dimension; i++) {
        for (let j = 0; j < this.dimension; j++) {
          if (this.numbers[i][j] === 0) {
            zeroI = i
            zeroJ = j
          }
        }
      }
      // 0和它相邻的数字交换位置
      // 随机生成一个0-3的数字，0表示上，1表示下，2表示左，3表示右
      const direction = Math.floor(Math.random() * 4)
      switch (direction) {
        case 0:
          // 0的上面有数字
          if (zeroI - 1 >= 0) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI - 1][zeroJ]
            this.numbers[zeroI - 1][zeroJ] = temp
          }
          break
        case 1:
          // 0的下面有数字
          if (zeroI + 1 < this.dimension) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI + 1][zeroJ]
            this.numbers[zeroI + 1][zeroJ] = temp
          }
          break
        case 2:
          // 0的左边有数字
          if (zeroJ - 1 >= 0) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI][zeroJ - 1]
            this.numbers[zeroI][zeroJ - 1] = temp
          }
          break
        case 3:
          // 0的右边有数字
          if (zeroJ + 1 < this.dimension) {
            const temp = this.numbers[zeroI][zeroJ]
            this.numbers[zeroI][zeroJ] = this.numbers[zeroI][zeroJ + 1]
            this.numbers[zeroI][zeroJ + 1] = temp
          }
          break
      }
    }
  }

  // 判断是否完成
  isComplete() {
    // 判断是否完成
    let isComplete = true

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
      isComplete = true
    } else {
      isComplete = false
    }
    if (isComplete) {
      this.timeStart = false
      this.sound.play('victory')
      addRecord(this.dimension, this.timeValue)

      // 弹出提示框，是否继续挑战，如果继续挑战，则将时间清零，将dimension加1，重新开始游戏
      // Swal confirm
      // 问题：Swal 的confirm按钮，点击后，会穿透到下面的方块，导致方块被点击，出现bug
      // Swal.fire({
      //   title: '恭喜你，完成了！',
      //   html: `
      //     <p>用时：${this.second}'${this.millisecond}''</p>
      //     <p>是否继续挑战第${this.dimension + 1}维？</p>
      //     `,
      //   icon: 'success',
      //   showCancelButton: true,
      //   showDenyButton: true,
      //   showConfirmButton: false,
      //   denyButtonText: '是',
      //   cancelButtonText: '否',
      // }).then((result) => {
      //   if (result.isDenied) {
      //     // 继续挑战
      //     // 将dimension加1
      //     this.dimension++
      //   }
      //   // 移除计时器
      //   this.timer.remove()
      //   // 将时间清零
      //   this.timeValue = 0
      //   this.scene.restart()
      //   console.log(this.timeStart)
      // })

      setTimeout(() => {
        const result = window.confirm(`恭喜你，完成了！用时：${this.second}'${this.millisecond}''，是否继续挑战第${this.dimension + 1}维？`)
        if (result) {
          // 继续挑战
          // 将dimension加1
          this.dimension++
        }
        // 将时间清零
        this.timeValue = 0

        // 移除计时器
        this.timer.remove()
        this.scene.restart()
      }, 200)
    }
  }
}

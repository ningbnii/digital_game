import PickUp from '../assets/sounds/pickup.mp3'
// import Music from '../assets/sounds/music.mp3'
import Victory from '../assets/sounds/victory.mp3'
import store from '../store/index.js'
import { getUserInfo } from '../api/user.js'
import { useToast } from '@/components/ui/toast/use-toast'
import Push from '../utils/push.js'
import config from '../config/index.js'

const { toast } = useToast()
export default class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader')
    // 判断是否是pc端
    this.isPC = !/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
    if (this.isPC) {
      if (!Notification) {
        console.log('您的浏览器不支持桌面通知。')
      } else {
        if (Notification.permission !== 'granted') {
          Notification.requestPermission()
        }
      }
    }
    this.loadText
    this.connection = new Push({
      url: config.wsUrl,
      app_key: '42e30ea86de1ef86c8c9ee56fec5987b',
      auth: '/plugin/webman/push/auth',
    })

    // 浏览器监听user-1频道的消息，也就是用户uid为1的消息
    this.public_channel = this.connection.subscribe('public')
    // 当user-1频道有消息时，执行回调
    this.public_channel.on('message', function (data) {
      // console.log(data)
      toast({
        description: data.content,
      })

      // 添加chrome通知
      if (this.isPc && Notification && Notification.permission === 'granted') {
        s.showNotification(data.content)
      }
    })
    // 接收有多少人在线
    this.public_channel.on('online', function (data) {
      const onlineNum = data.num
      store.commit('setOnlineNum', onlineNum)
    })

    store.commit('setIsLogin', false)
  }

  preload() {
    // Loading ...
    this.progressValue = 0
    this.loadText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'Loading 0%', {
      fontSize: '32px',
      fill: '#fff',
    })
    this.loadText.setOrigin(0.5)
    this.loadText.setStroke('#000', 6)
    this.loadText.setShadow(2, 2, '#333333', 2, true, true)
    // 加载音效
    this.load.audio('pickup', PickUp)
    this.load.audio('victory', Victory)
    // this.load.audio('music', Music)

    this.load.on('fileprogress', (file, value) => {
      switch (file.key) {
        case 'pickup':
          this.pickupProgress = value
          break
        case 'victory':
          this.victoryProgress = value
          break
        // case 'music':
        //   this.musicProgress = value
        //   break
      }
      this.progressValue = ((this.pickupProgress + this.victoryProgress) / 2) * 100

      this.loadText.setText(`Loading ${Math.round(this.progressValue)}%`)
    })
  }

  create() {
    this.nickname = store.state.nickname
    this.userId = store.state.userId

    if (this.sound.locked || !this.nickname || !this.userId) {
      // 移除加载文本
      this.loadText.destroy()
      // 添加一个输入框，用于输入昵称
      // 位置屏幕中间
      const inputText = this.add.rexInputText(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 200, 30, {
        type: 'text',
        placeholder: 'your name',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#000',
        border: '1px solid #fff',
        borderRadius: '10px',
        padding: '5px',
        textAlign: 'center',
        fixedWidth: 200,
        fixedHeight: 30,
        text: this.nickname,
      })
      // 添加一个密码输入框，用于输入密码
      // 位置屏幕中间
      const inputPassword = this.add.rexInputText(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 40, 200, 30, {
        type: 'password',
        placeholder: 'your password',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#000',
        border: '1px solid #fff',
        borderRadius: '10px',
        padding: '5px',
        textAlign: 'center',
        fixedWidth: 200,
        fixedHeight: 30,
      })

      // 添加一个按钮，用于开始游戏
      // 位置屏幕中间
      const button = this.add
        .text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 100, 'Start', {
          fontSize: '32px',
          fill: '#000',
        })
        .setInteractive()
        .setOrigin(0.5)
        // 鼠标移动上去时，字体变大，动画
        .on('pointerover', () => {
          this.tweens.add({
            targets: button,
            scale: 1.2,
            duration: 300,
          })
        })
        // 鼠标移出时，字体变小，动画
        .on('pointerout', () => {
          this.tweens.add({
            targets: button,
            scale: 1,
            duration: 300,
          })
        })
        // 鼠标移动上去，设置鼠标样式为手型
        .on('pointermove', () => {
          this.sys.canvas.style.cursor = 'pointer'
        })

        // 获取输入框的值
        .on('pointerdown', () => {
          // 如果输入框的值为空，则不做任何操作，直接返回
          if (inputText.text === '' || inputPassword.text === '') {
            return
          }

          // 保存到数据库中
          getUserInfo(inputText.text, inputPassword.text).then((res) => {
            // 将昵称保存到store中
            store.commit('setNickname', res.nickname)
            store.commit('setUserId', res.id)
            // 移除输入框和按钮
            inputText.destroy()
            button.destroy()
            // 设置登录状态
            store.commit('setIsLogin', true)
            // 开始游戏
            this.scene.start('Game')
          })
        })

      //   this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
      //     this.scene.start('Game')
      //   })
    } else {
      // 设置登录状态
      store.commit('setIsLogin', true)
      this.scene.start('Game')
    }
  }

  showNotification(content) {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    } else {
      const options = {
        body: content,
        dir: 'ltr',
        // image: 'image.jpg',
      }
      const notification = new Notification('数字方格', options)
      notification.onclick = function () {
        window.open('https://demo.wxbuluo.com/digital/')
      }
    }
  }
}

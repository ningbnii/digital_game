class GameItem extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, number, i, j, color) {
    super(scene, x, y)

    this.number = number
    this.width = width
    this.i = i // 行
    this.j = j // 列
    // 使用rexRoundRectanglePlugin插件创建一个圆角矩形,并添加到container中
    // this.rect = scene.add.rexRoundRectangle(0, 0, 100, 100, 10, 0xff0000)
    // create Color array
    this.rect = scene.add.rexRoundRectangle({
      x: 0,
      y: 0,
      width: this.width,
      height: this.width,
      radius: Math.floor(this.width / 10),
      color: color ? color : 0xffffff,
      alpha: 1,
      strokeColor: 0x2d2d2d,
      strokeWidth: 2,
    })

    // 创建一个文本，并添加到container中，位置居中，fontSize为方格宽度的一半
    this.text = scene.add.text(0, 0, this.number, {
      fontSize: this.width / 2,
      color: '#fff',
      // 加粗
      fontStyle: 'bold',
      // 阴影
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000',
        blur: 2,
        stroke: true,
        fill: true,
      },
      // 字体
      FontFamily: 'Pacifico, cursive',
    })
    this.add([this.rect, this.text])
    // 设置container的大小
    this.setSize(this.width, this.width)
    // 使文本居于矩形中间
    Phaser.Display.Align.In.Center(this.text, this.rect)
    // 将container添加到场景中
    scene.add.existing(this)
    // 如果number为0，则不显示
    if (this.number === 0) {
      this.setVisible(false)
    }
    // 添加点击事件
    this.setInteractive()
  }
}

export default GameItem

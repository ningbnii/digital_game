export default class Boot extends Phaser.Scene {
  constructor() {
    // 解释一下这里的super，super是一个函数，它代表父类的构造函数，用来新建父类的this对象，里面的Boot是父类的构造函数的名称，这里的父类是Phaser.Scene，所以这里的super就是Phaser.Scene的构造函数，它的作用是将父类的this对象继承给子类，所以这里的super('Boot')就是将Phaser.Scene的this对象继承给Boot，这样Boot就可以使用Phaser.Scene的this对象了
    super('Boot')
  }

  create() {
    this.scene.start('Preloader')
  }
}

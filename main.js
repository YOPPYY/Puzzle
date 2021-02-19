// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;


var coins =["coin1","coin5","coin10","coin50","coin100","coin500"];

var row=6;
var col=5;
var map=[];


var ASSETS = {
  image: {
    'coin1': 'img/money_coin_heisei_1.png',
    'coin5': 'img/money_coin_blank_5.png',
    'coin10': 'img/money_coin_heisei_10.png',
    'coin50': 'img/money_coin_heisei_50.png',
    'coin100': 'img/money_coin_heisei_100.png',
    'coin500': 'img/money_coin_reiwa_500_new.png',
  },
  sound: {
    'bgm1': 'sound/bgm1.mp3',
    'bgm2': 'sound/bgm2.mp3',
    'timer': 'sound/timer.mp3',
    'button': 'sound/button.mp3',
    'maru': 'sound/maru.mp3',
    'batsu': 'sound/batsu.mp3',

  },
};

// MainScene クラスを定義
phina.define('Main', {
  superClass: 'CanvasScene',
  init: function() {
    this.superInit();
    var self=this;

    var label = Label({
      text:'タイトル',
      fontSize: 48,
      x:this.gridX.center(),
      y:this.gridY.center()-50,
      fill:'white',
      stroke:'blue',
      strokeWidth:5,
    }).addChildTo(this);


    // 背景色を指定
    this.backgroundColor = '#444';

    // ar[3][2] の2次元配列を作成する
    var ar = new Array(row);
    for (y=0; y<ar.length; y++){
    ar[y] = new Array(col);

    }

    for(j=0;j<col;j++){
      for(i=0;i<row;i++){
        var id= Math.floor(Math.random()*coins.length);
        ar[j][i] = id;
        var sprite = Sprite(coins[id]).setScale(0.1).addChildTo(this);
        sprite.x=100+i*50;
        sprite.y=860-j*50;

      }
    }

  },

  onpointstart: function() {
  this.exit();
},

  });

  // Result クラスを定義
  phina.define('Result', {
    superClass: 'CanvasScene',
    init: function() {
      // 親クラス初期化
      this.superInit();
      // 背景色を指定
      this.backgroundColor = '#444';

    }
  });


  // メイン処理
  phina.main(function() {

    // アプリケーションを生成
    var app = GameApp({
      query: '#canvas',
      // Scene01 から開始
      startLabel: 'main',
      assets: ASSETS,
      // シーンのリストを引数で渡す
      scenes: [
        {
          className: 'Main',
          label: 'main',
          nextLabel: 'result',
        },
        {
          className: 'Result',
          label: 'result',
        },
      ]
    });

    app.domElement.addEventListener('touchend', function dummy() {
      var s = phina.asset.Sound();
      s.loadFromBuffer();
      s.play().stop();
      app.domElement.removeEventListener('touchend', dummy);
    });

    // 実行
    app.run();
  });

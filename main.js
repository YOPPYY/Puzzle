// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;


var coins =["coin1","coin5","coin10","coin50","coin100","coin500"];

var row=10;
var col=10;
var ar=[];
var check_h=[];
var check_v=[];
var check =[];
var queue=[];

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

    // ar[y][x] の2次元配列を作成する
    ar = new Array(row);
    for (y=0; y<ar.length; y++){
      ar[y] = new Array(col).fill(0);;
    }

    // チェック用配列作成　縦
    check_v = new Array(row);
    for (y=0; y<ar.length; y++){
      check_v[y] = new Array(col).fill(0);;
    }

    // チェック用配列作成　横
    check_h = new Array(row);
    for (y=0; y<ar.length; y++){
      check_h[y] = new Array(col).fill(0);;
    }

    // 配列作成　コンボ
    check = new Array(row);
    for (y=0; y<ar.length; y++){
      check[y] = new Array(col).fill(0);;
    }

    // 配列作成　コンボ
    del = new Array(row);
    for (y=0; y<ar.length; y++){
      del[y] = new Array(col).fill(0);;
    }


    for(j=0;j<col;j++){
      for(i=0;i<row;i++){
        var id= Math.floor(Math.random()*(coins.length-3));
        ar[j][i] = id;
        var sprite = Sprite(coins[id]).setScale(0.1).addChildTo(this);
        sprite.x=100+i*50;
        sprite.y=480+j*50;
        //sprite.y=860-j*50;

      }
    }
    console.log(ar);

  },

  onpointstart: function() {
    var combo=0;


    //探索　横
    for(var y=0;y<col; y++){
      for(var x=0;x<row-2; x++){
        var temp = ar[y][x];
        if(temp == ar[y][x+1] && temp == ar[y][x+2]){
          //console.log("hit(h) "+ temp);

          for(var i=0; i<3; i++){
            check_h[y][x+i]=temp+1;
            //console.log(y + "," + x + " + i");
          }
        }
      }
    }

    //探索　縦
    for(var x=0;x<row; x++){
      for(var y=0;y<col-2; y++){
        var temp = ar[y][x];
        if(temp == ar[y+1][x] && temp == ar[y+2][x]){
          //console.log("hit(v) "+ temp);

          for(var i=0; i<3; i++){
            check_v[y+i][x]=temp+1;
          }
        }
      }
    }


    //探索　横　縦　統合
    for(var y=0;y<col; y++){
      for(var x=0;x<row; x++){

        if(check_h[y][x] > 0){
          check[y][x] = check_h[y][x];
        }

        if(check_v[y][x] > 0){
          check[y][x] = check_v[y][x];
        }
      }
    }
    //console.log(check);


    //コンボ探索
    /*
    0. 盤面内のドロップを繰り返しで調べる。カウント未設定かつコンボ状態のドロップであれば、対象ドロップとする。
    (check)
    1. 対象ドロップに現在のカウントを設定する。

    2. 対象ドロップの上下左右を調べ、コンボ状態かつ同じ色のドロップがあれば、ドロップの位置情報をキューに格納する。

    3. キューからドロップの位置情報を取り出し、対象ドロップとする。

    4. キューの中身が無くなるまで1～3を繰り返す。中身が無くなったら、カウントアップ（+1）して次のドロップの調査へ移る。
    */


    var combo=0;

    //0. 盤面内のドロップを繰り返しで調べる。カウント未設定かつコンボ状態のドロップであれば、対象ドロップとする。
    for(var y=0; y<col; y++){
      for(var x=0; x<row; x++){

        if(check[x][y] != 0 && del[x][y]==0){

          queue.push([x,y]);//対象ドロップ

        }

          if(queue.length>0){
            // 1. 対象ドロップに現在のカウントを設定する。
            var element = queue.shift();
            var posy= element[0];
            var posx= element[1];
            //console.log(posy +"," + posx);
            console.log(queue);
            del[posx][posy]=combo+1;

            // 2. 対象ドロップの上下左右を調べ、コンボ状態かつ同じ色のドロップがあれば、ドロップの位置情報をキューに格納する。

            //上
            if(posy<col-1){
              if(check[posx][posy] == check[posx][posy+1] && check[posx][posy+1] != 0){
                queue.push([posx,posy+1]);
              }
            }

            //下
            if(posy>0){
              if(check[posx][posy] == check[posx][posy-1] && check[posx][posy-1] != 0){
                queue.push([posx,posy-1]);
              }
            }

            //左
            if(posx>0){
              if(check[posx][posy] == check[posx-1][posy] && check[posx-1][posy] != 0){
                queue.push([posx-1,posy]);
              }
            }

            //右
            if(posx<row-1){
              if(check[posx][posy] == check[posx+1][posy] && check[posx+1][posy] != 0){
                queue.push([posx+1,posy]);
              }
            }

            //3. キューからドロップの位置情報を取り出し、対象ドロップとする。




          }


            combo++;


          //console.log(queue);


      }
    }

    //消去
    //コンボ順に消す

    console.log(del);


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

// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;

var colors =["red","blue","yellow","grean","purple","pink"];

var balls =["red","blue","green","yellow","purple","pink"];
var length = 3; //3-6
var row=5; //max:12
var col=5; //max:19

var offset_x =25;
var offset_y = 25;
var coin_size = 50; //50

//アニメーション速度
var erase = 700; //700
var drop = 500; //500-750くらい

var ar=[];
var ar2=[];
var sprites=[];

var check_h=[];//
var check_v=[];//
var check =[];//
var del=[];

var clicked=false;
var finished = false;

var queue=[];
var visited=[];
var target=[];

var combo=0;
var countup=0; //落下ごとのコンボ数
var totalcombo = 0;
var totaldelete = 0;

var ASSETS = {
  image: {
    'red': 'img/1.png',
    'blue': 'img/2.png',
    'green': 'img/3.png',
    'yellow': 'img/4.png',
    'purple': 'img/5.png',
    'pink': 'img/6.png',
  },
  sound: {

    'delete': 'sound/button43.mp3',

  },
};


// MainScene クラスを定義
phina.define('Main', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
    var self=this;

    var label0 = Label({
      text:'タイトル',
      fontSize: 48,
      x:this.gridX.center(),
      y:100,
      fill:'white',
      stroke:'blue',
      strokeWidth:5,
    }).addChildTo(this);


    // 背景色を指定
    this.backgroundColor = '#444';

    var bg = DisplayElement().addChildTo(this);
    var group = DisplayElement().addChildTo(this);



    makearray();

    function makearray(){
      // ar[y][x] の2次元配列を作成する
      ar = new Array(col);
      for (y=0; y<ar.length; y++){
        ar[y] = new Array(row).fill(0);
      }

      // ar[y][x] の2次元配列を作成する
      sprites = new Array(col);
      for (y=0; y<ar.length; y++){
        sprites[y] = new Array(row).fill(0);
      }

      // ar2[y][x] の2次元配列を作成する
      ar2 = new Array(col);
      for (y=0; y<ar.length; y++){
        ar2[y] = new Array(row).fill(0);
      }

      // sprite[y][x] の2次元配列を作成する
      sprites2 = new Array(col);
      for (y=0; y<ar.length; y++){
        sprites2[y] = new Array(row).fill(0);
      }

      // チェック用配列作成　縦
      check_v = new Array(col);
      for (y=0; y<ar.length; y++){
        check_v[y] = new Array(row).fill(0);
      }

      // チェック用配列作成　横
      check_h = new Array(col);
      for (y=0; y<ar.length; y++){
        check_h[y] = new Array(row).fill(0);
      }

      // 配列作成　縦横
      check = new Array(col);
      for (y=0; y<ar.length; y++){
        check[y] = new Array(row).fill(0);
      }


      // 配列作成　コンボ
      del = new Array(col);
      for (y=0; y<ar.length; y++){
        del[y] = new Array(row).fill(0);
      }

      // 配列作成　コンボ
      visied = new Array(col);
      for (y=0; y<ar.length; y++){
        visited[y] = new Array(row).fill(0);
      }
    }



    var self=this;
    //表示
    for(j=0;j<col;j++){
      for(i=0;i<row;i++){

        var shape = Shape().setPosition(offset_x + i*coin_size,SCREEN_HEIGHT-offset_y - j*coin_size).setSize(33,33).addChildTo(bg);
        if((i+j)%2==0){shape.backgroundColor = 'SaddleBrown';}
        else{shape.backgroundColor = 'Chocolate';}

        var id= Math.floor(Math.random()*(length));
        ar[j][i] = id;

        var sprite = Sprite(balls[id]).setScale(0.1).addChildTo(group);
        sprites[j][i]=sprite;
        sprite.x = offset_x + i*coin_size;
        sprite.y = SCREEN_HEIGHT-offset_y - j*coin_size;
        sprites[j][i] = sprite;

        /*var circle = CircleShape({
          stroke: "white",
          fill: colors[id],
          radius: 20,
          x : offset_x + i*coin_size,
          y : SCREEN_HEIGHT-offset_y - j*coin_size,
        }).addChildTo(group);
        sprites[j][i]=circle;*/

      }
    }
    //console.log(ar);



  },

  onpointstart: function() {

    if(clicked==true && finished== true){
      location.reload();
    }
    else{
      clicked=true;

      var group = DisplayElement().addChildTo(this);
      var group2 = DisplayElement().addChildTo(this);
      var label = Label({x:500,y:100,fontSize:32,fill:'white',text:totalcombo}).addChildTo(this);
      var label1 = Label({x:320,y:480,fontSize:50,fill:'white',stroke:"black",strokeWidth:3,text:""}).addChildTo(this);

      matchcheck();

      function matchcheck(){
        var flag_h = false;
        var flag_v = false;

        //探索　横
        for(var y=0;y<col; y++){
          for(var x=0;x<row-2; x++){
            var temp = ar[y][x];
            if(temp == ar[y][x+1] && temp == ar[y][x+2]){
              //console.log("hit(h) "+ temp);
              flag_h = true;
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
              flag_v = true;
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
        if(flag_h || flag_v ==1){
          connectcheck();
        }
        else{
          console.log("終了");
          label1.text=totalcombo+"コンボ";
          finished=true;
        }
      }

      function connectcheck(){
        //最後のマスまで調べ終わったら終了。
        while(visited[col-1][row-1]==0){

          check_loop:
          for(var y=0; y<col; y++){
            for(var x=0; x<row; x++){
              visited[y][x]=1;
              if(check[y][x] != 0 && del[y][x]==0){
                if(queue.length==0){
                  var object={y:y, x:x};
                  queue.push(object);
                  combo++;
                  //console.log(object);
                  //console.log(queue);
                  //console.log("対象:"+y+","+x);
                  break check_loop;//visitedの変更を防ぐためループを抜ける。
                }
              }

            }
          }

          //console.log(queue);

          //4. キューの中身が無くなるまで1～3を繰り返す
          while(queue.length>0){
            //3. キューからドロップの位置情報を取り出し、対象ドロップとする。
            var element = queue.shift();
            var posx= element.x;
            var posy= element.y;

            // 1. 対象ドロップに現在のカウントを設定する。
            if(del[posy][posx]==0){
              del[posy][posx]=combo;
            }

            // 2. 対象ドロップの上下左右を調べ、コンボ状態かつ同じ色のドロップがあれば、ドロップの位置情報をキューに格納する。

            //上
            if(posy<col-1){
              if(check[posy][posx] == check[posy+1][posx] && del[posy+1][posx] == 0){
                var object={y:posy+1, x:posx};
                queue.push(object);
              }
            }

            //下
            if(posy>0){
              if(check[posy][posx] == check[posy-1][posx] && del[posy-1][posx] == 0){
                var object={y:posy-1, x:posx};
                queue.push(object);
              }
            }

            //左
            if(posx>0){
              if(check[posy][posx] == check[posy][posx-1] && del[posy][posx-1] == 0){
                var object={y:posy, x:posx-1};
                queue.push(object);
              }
            }

            //右
            if(posx<row-1){
              if(check[posy][posx] == check[posy][posx+1] && del[posy][posx+1] == 0){
                var object={y:posy, x:posx+1};
                queue.push(object);
              }
            }
          }

          //中身が無くなったら、カウントアップ（+1）して次のドロップの調査へ移る。

        }
        //探索完了
        //console.log("終了");
        //console.log(del);
        //console.log(combo);


        comboset();
      }

      function comboset(){

        //削除キュー作成　ここから
        for(var i=1; i<=combo; i++){
          var temp=[];

          //検索してキューに追加
          for(var y=0; y<col; y++){
            for(var x=0; x<row; x++){
              if(del[y][x] ==i){
                var object={y:y, x:x};
                temp.push(object);
              }
            }
          }
          target.push(temp);      //コンボ順にならべる
        }
        //ここまで
        //console.log(queue);
        animation();
      }
      function animation(){
        //if(target.length==0){console.log("0combo");}
        //console.log(target)
        if(target.length>0){


          var temp = target.shift();
          while(temp.length>0){

            var element = temp.shift();
            var posx= element.x;
            var posy= element.y;
            ar[posy][posx]=-1;

            if(temp.length==0){
              countup++;
              console.log(countup);
              SoundManager.play("delete");
              label.text=++totalcombo;
              sprites[posy][posx].tweener.fadeOut(erase)
              .call(function() {
                //this.remove();
                if(countup==combo){fall();}
                else{animation();}
              })
              .play();
            }

            else{
              //フェードアウト
              sprites[posy][posx].tweener.fadeOut(erase)
              .call(function() {
                //this.remove();
              })
              .play();
            }
          }
        }
      }
      function fall(){
        //console.log("位置変更");

        //表示
        for(j=0;j<col;j++){
          for(i=0;i<row;i++){
            var id= Math.floor(Math.random()*(length));
            ar2[j][i] = id;

            var sprite = Sprite(balls[id]).setScale(0.1).setPosition(offset_x + i*coin_size,(SCREEN_HEIGHT-offset_y-col*coin_size)-j*coin_size).addChildTo(group2);
            sprite.alpha=0;
            sprites2[j][i]=sprite;

            /*var circle = CircleShape({
              stroke: "white",
              fill: colors[id],
              radius: 20,
              x : offset_x + i*coin_size,
              y: (SCREEN_HEIGHT-offset_y-col*coin_size)-j*coin_size,
            }).addChildTo(group2);
            circle.alpha=0;
            sprites2[j][i]=circle;*/


            //盤面内だったら表示
            group2.update=function(){
              for(var c=0; c<group2.children.length; c++){
                if(group2.children[c].y>SCREEN_HEIGHT-offset_y-col*coin_size){
                  group2.children[c].alpha=1;
                }
              }
            }

          }
        }



        var sprite_moving=0; //移動未完了Sprite数
        for(x=0; x<row; x++){

          var space=0;
          for(y=0; y<col; y++){

            if(ar[y][x]==-1){
              space++;
            }
            else{
              //Spaceぶん下に移動
              ar[y-space][x] = ar[y][x];
              sprites[y][x].tweener.moveBy(0, space*50, drop).play();
            }

          }

          /*
          //空(-1)にする
          for(n=0; n<space; n++){
          ar[col-n-1][x]=-1;
        }
        */

        //空の数だけid2とspeite2からもってくる
        for(s=0; s<space; s++){
          ar[col-space+s][x]=ar2[s][x];
          //console.log(col-space+s+","+x +" <- "+ s +","+x + " ("+ ar2[s][x] +")");
          sprite_moving++;
          sprites2[s][x].tweener.moveBy(0, space*50, drop)
          .call(function() {
            sprite_moving--;

            if(sprite_moving==0){
              //console.log("移動完了　再判定");
              Reset();

            }
          })
          .play();
        }

      }
    }

    function Reset(){

      var queue=[];
      var target=[];
      combo=0;
      countup=0;

      //del　リセット
      //visited　リセット
      for(var y=0; y<col; y++){
        for(var x=0; x<row; x++){
          check[y][x]=0;
          check_h[y][x]=0;
          check_v[y][x]=0;
          del[y][x]=0;
          visited[y][x]=0;

          //sprite 更新
          var id = ar[y][x];
          sprites[y][x].remove();
          sprites[y][x] = Sprite(balls[id]).setScale(0.1).setPosition(offset_x+x*coin_size, SCREEN_HEIGHT-offset_y-y*coin_size).addChildTo(group);
          sprites2[y][x].remove();


          /*sprites[y][x].remove();
          sprites2[y][x].remove();
          var circle = CircleShape({
            stroke: "white",
            fill: colors[id],
            radius: 20,
            x : offset_x + x*coin_size,
            y : SCREEN_HEIGHT-offset_y - y*coin_size,
          }).addChildTo(group);
          sprites[y][x] = circle;*/


        }
      }
      //console.log("repeat");
      matchcheck();
    }
  }

},

});

/*
* Coinクラス
*/
phina.define("Coin", {
  // 継
  superClass: 'DisplayElement',
  // 初期化
  init: function() {
    // 親クラス初期化
    this.superInit();
  },
});

// Result クラスを定義
phina.define('Result', {
  superClass: 'DisplayScene',
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
        //nextLabel: 'result',
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

/*コンボ探索メモ

0. 盤面内のドロップを繰り返しで調べる。カウント未設定かつコンボ状態のドロップであれば、対象ドロップとする。
(check)
1. 対象ドロップに現在のカウントを設定する。

2. 対象ドロップの上下左右を調べ、コンボ状態かつ同じ色のドロップがあれば、ドロップの位置情報をキューに格納する。

3. キューからドロップの位置情報を取り出し、対象ドロップとする。

4. キューの中身が無くなるまで1～3を繰り返す。中身が無くなったら、カウントアップ（+1）して次のドロップの調査へ移る。
*/

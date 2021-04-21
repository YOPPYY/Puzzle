// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;
var v = 'v.210421'
//var colors =["red","blue","yellow","grean","purple","pink"];

//var balls =["red","blue","green","yellow","purple","pink"];
var balls =["one","two","three","four","five","six","seven","eight","nine"];
var length = 6; //3-6
var row=10; //10
var col=14; //14
var set=[];
var hi=0;

var offset_x =32;
var offset_y = 32;
var coin_size = 64;

//アニメーション速度
var erase=0; // erase * length (default:100)
var wait=100; // (default:50)
var drop = 500; //(default:500-750くらい)

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

var label0;

var combo=0;
var countup=0; //落下ごとのコンボ数
var totalcombo = 0;
var totaldelete = 0;
var max=9;
var mid;

var ASSETS = {
  image: {
    'dragon':'img/dragon.png',
    'zeus':'img/zeus.png',
    'anubis':'img/anubis.png',
    'inori':'img/inori.png',
    'one': 'img/1.png',
    'two': 'img/2.png',
    'three': 'img/3.png',
    'four': 'img/4.png',
    'five': 'img/5.png',
    'six': 'img/6.png',
    'seven': 'img/7.png',
    'eight': 'img/8.png',
    'nine': 'img/9.png',
  },
  sound: {

    'delete': 'sound/button43.mp3',
    'finish': 'sound/バーン.mp3',
  },
};

phina.define('Title', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
    var self=this;
    // 背景色を指定
    this.backgroundColor = 'saddlebrown';


    var grad = Canvas.createLinearGradient(-320, -480, 320, 480);

    grad.addColorStop(0, 'blue');
    grad.addColorStop(0.5,'lightblue');
    grad.addColorStop(0.7,'sandybrown');
    //grad.addColorStop(1, g);
    var rect = RectangleShape().setPosition(320,480).addChildTo(this).setSize(640,960);
    rect.fill=grad;

    var dra =Sprite('dragon',719,647).setScale(0.5).setPosition(170,200).addChildTo(self);
    var zeus = Sprite('zeus',800,800).setScale(0.45).setPosition(450,220).addChildTo(self);
    var anubis = Sprite('anubis',540,800).setScale(0.4).setPosition(100,810).addChildTo(self);
    var inori = Sprite('inori',556,732).setScale(0.4).setPosition(530,810).addChildTo(self);

    length= parseInt(localStorage.getItem('Puzzle_length'),10);
    if(!length){length=5;}

    Label({text:'落ちコン',fontSize: 64,x:this.gridX.center()-128,y:280,fill:'purple',stroke:'white',strokeWidth:5,}).addChildTo(this);
    Label({text:'お祈り杯',fontSize: 64,x:this.gridX.center()+128,y:280,fill:'orange',stroke:'white',strokeWidth:5,}).addChildTo(this);
    Label({text:v,fontSize: 16,x:this.gridX.center(),y:960-14,fill:'black',}).addChildTo(this);

    //Label({x:320,y:480-96,fontSize:48,text:'レベル',fill:'white'}).addChildTo(this);
    var num=Label({x:320,y:480,text:'レベル'+length,fontSize:48,fill:'black',stroke:'white',strokeWidth:5}).addChildTo(this);

    var button1=Button({x:120,y:480,width:100,height:100,fontSize:48,text:'-',fill:'white',fontColor:'black'}).addChildTo(this);
    button1.onpointstart=function(){length= Math.max(3,length-1); num.text='レベル'+length;Ball(); Score();}

    var button2= Button({x:520,y:480,width:100,height:100,fontSize:48,text:'+',fill:'white',fontColor:'black'}).addChildTo(this);
    button2.onpointstart=function(){length= Math.min(max,length+1); num.text='レベル'+length;Ball(); Score();}

    var label = Label({x:320,y:740,fontSize:32,text:'',fill:'white'}).addChildTo(self);


    Score();
    function Score(){
      var get = JSON.parse(localStorage.getItem('Puzzle_Score('+length+')'));
      if(get){hi = get[0];}

      if(hi==undefined){
      var setdata=[0,"kari"]; hi=0;
      localStorage.setItem('Puzzle_Score('+length+')',JSON.stringify(setdata));
      }
      label.text='ハイスコア\n'+hi;
    }

    Ball()
    function Ball(){
      var s=68; //間隔
      for(var a=0; a<max; a++){if(set[a])set[a].remove();}
      for(var i=0; i<length; i++){
        set[i] = Sprite(balls[i],502,502).setSize(64,64).addChildTo(self);
        set[i].setPosition(320+s*i-(s*(length-1)/2),620);
      }
    }
    var start = Button({x:320,y:860,text:'START'}).addChildTo(this);
    start.onpointstart=function(){
      erase = Math.min(500,length*100);
      localStorage.setItem('Puzzle_length',length);
      self.exit('main');

    }

  },
});


// MainScene クラスを定義
phina.define('Main', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
    var self=this;

    label0 = Label({
      text:'画面タップで開始',
      fontSize: 48,
      x:this.gridX.center(),
      y:32,
      fill:'white',
      stroke:'blue',
      strokeWidth:5,
    }).addChildTo(this);


    // 背景色を指定
    this.backgroundColor = '#444';

    var bg = DisplayElement().addChildTo(this);
    mid = DisplayElement().addChildTo(this);
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

        var shape = Shape()
        .setSize(coin_size-16,coin_size-16)
        .setPosition(offset_x + i*coin_size,SCREEN_HEIGHT-offset_y - j*coin_size).addChildTo(bg);
        if((i+j)%2==0){shape.backgroundColor = 'sienna';}
        else{shape.backgroundColor = 'Chocolate';}

        var id= Math.floor(Math.random()*(length));
        ar[j][i] = id;

        var sprite = Sprite(balls[id],502,502).setSize(62,62).addChildTo(group);
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

onpointstart: function(app) {

  label0.remove();
  if(clicked==true && finished== true){
    location.reload();
  }
  else if(clicked!=true){
    clicked=true;

    var group = DisplayElement().addChildTo(this);
    var group2 = DisplayElement().addChildTo(this);
    var label = Label({x:16,y:32,fontSize:32,align:'left',fill:'white',text:''}).addChildTo(this);
    var labeldel = Label({x:16*13,y:32,fontSize:32,align:'left',fill:'white',text:''}).addChildTo(this);
    var labelscore = Label({x:640-16,y:32,fontSize:32,align:'right',fill:'white',text:''}).addChildTo(this);

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
      //Result
      else{

        console.log("終了");
        var shape = Shape().setSize(640,64*6).setPosition(320,64+64*5).addChildTo(group);
        shape.backgroundColor = 'white';
        shape.alpha=0.9;

        //var label1 = Label({x:320,y:64+64*3+32,fontSize:48,fill:'brown',text:""}).addChildTo(group);
        //label1.text="コンボ："+totalcombo;
        //var label2 = Label({x:320,y:64+64*5,fontSize:48,fill:'brown',text:""}).addChildTo(group);
        //var label3 = Label({x:320,y:64+64*7-32,fontSize:48,fill:'brown',text:'ハイスコア：'+hi}).addChildTo(group);

        var label2 = Label({x:320,y:64+64*3+32,fontSize:64,fill:'brown',text:""}).addChildTo(group);
        var score = totalcombo * totaldelete;
        label2.text="スコア\n"+score;

        var label3 = Label({x:320,y:64+64*7-32,fontSize:64,fill:'brown',text:'ハイスコア\n'+hi}).addChildTo(group);
        SoundManager.play("finish");

        var shape = Shape().setSize(640,64*2).setPosition(320,64+64*11).addChildTo(group);
        shape.backgroundColor = 'white';
        shape.alpha=0.9;
        var label4 = Label({x:320,y:64+64*11,fontSize:64,fill:'black',text:''}).addChildTo(group);

        //送信
        //ここから


        var date = new Date();
        var db = firebase.firestore();
        var setdata=[];

        db.collection("Score").add({
          combo:totalcombo,
          delete:totaldelete,
          score:totalcombo*totaldelete,
          date:date,
          length:length,
        })
        .then(function (doc) {
          console.log("Document create with ID: ", doc.id);
          setdata.push(totalcombo*totaldelete);
          setdata.push(doc.id);

          var last= JSON.parse(localStorage.getItem('Puzzle_History'));
          if(!last){last=[];}
          last.unshift(doc.id); //追加
          if(last.length>100){
            last = last.slice(0,100); //切り捨て
          }
          localStorage.setItem('Puzzle_History',JSON.stringify(last));

          if(score>hi){
            localStorage.setItem('Puzzle_Score('+length+')',JSON.stringify(setdata));
          }

        })
        .catch(function (error) {
          console.error("Error creating document: ", error);
        });

        //ここまで
        if(score>hi){
          localStorage.setItem('Puzzle_Score('+length+')',JSON.stringify(setdata));
          label4.text='NEW RECORD';
          label4.fill='red';
          shape.backgroundColor = 'yellow';
        }
        else{
          label4.text='TRY AGAIN';
        }

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

              //console.log(totaldelete)
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
          totaldelete++;

          var element = temp.shift();
          var posx= element.x;
          var posy= element.y;
          ar[posy][posx]=-1;

          //コンボ毎の処理
          if(temp.length==0){
            countup++;
            console.log(countup);
            SoundManager.play("delete");
            totalcombo++
            label.text='コンボ:'+totalcombo+' 消去:'+totaldelete;
            //labeldel.text='消去:'+totaldelete;
            labelscore.text='スコア:'+(totalcombo * totaldelete);

            var get = JSON.parse(localStorage.getItem('Puzzle_Score('+length+')'));
            if(get){h = get[0];}
            else{h=0;}
            if(h<totalcombo * totaldelete){labelscore.fill='yellow';}

            sprites[posy][posx].tweener.fadeOut(erase).wait(wait)
            .call(function() {
              //this.remove();

              if(countup==combo){fall();}
              else{animation();}
            })
            .play();

          }

          //ドロップ毎の処理
          else{

            //フェードアウト
            sprites[posy][posx].tweener.fadeOut(erase).wait(wait)
            .call(function() {
              //this.remove();
            })
            .play();
          }

          //effect
          var b= RectangleShape({
            width:64,
            height:64,
            x:sprites[posy][posx].x,
            y:sprites[posy][posx].y,
            fill:'white',
            alpha:0.75
          }).addChildTo(mid);
          b.tweener.fadeOut(erase).wait(wait).call(function() {this.remove();}).play();

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

          var sprite = Sprite(balls[id],502,502)
          .setSize(coin_size-2,coin_size-2)
          .setPosition(offset_x + i*coin_size,(SCREEN_HEIGHT-offset_y-col*coin_size)-j*coin_size)
          .addChildTo(group2);
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
          sprites[y][x].tweener.moveBy(0, space*64, drop).wait(wait).play();
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
      sprites2[s][x].tweener.moveBy(0, space*64, drop).wait(wait)
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
      sprites[y][x] = Sprite(balls[id]).setSize(62,62).setPosition(offset_x+x*coin_size, SCREEN_HEIGHT-offset_y-y*coin_size).addChildTo(group);
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
    startLabel: 'title',
    assets: ASSETS,
    // シーンのリストを引数で渡す
    scenes: [
      {
        className: 'Title',
        label: 'title',
        nextLabel: 'main',
      },
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

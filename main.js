var canvas = document.getElementById("main")
var ctx = canvas.getContext("2d")

//ブロックの大きさ（オブジェクトの大きさの基準）
const block_s = canvas.width/16

//base
const base_speed = 10


//playerの画面上の座標（ほぼ使わん）
const player_mx = 8;
const player_my = 5;

/**
 *<---------all object's parameter format----------/
 *
 *px  どこに向かっているか 1:→  -1:←
 *py  どこに向かっているか -1:↑  1:↓
 *bx  マップでのx座標（ブロック一個右→ bx:1 by:0 ブロック一個左→ bx-1 by:0)  ※ゲーム上の座標でもある
 *by  マップでのy座標（ブロック二個下→ bx:0 by:2 ブロック二個上→ bx:0 by:-2）
 *x   実際のy座標（プログラムを管理するときに使うが、ゲーム内では表示しない）
 *y   実際のx座標
 *dir 向き 1:↑ 2:↓　3:→ 4:←
 *s   スピード
 *lv  レベル
 *alv 攻撃レベル
 *HP  体力
 *AP  攻撃力
 *
 * 
 */


//player
var player = new player_cls();

//laser
var laser_list = []

//enemy
var enemy = make_mob("enemy",1)

//reward
var reward_list = make_mob("reward",1)


//mapの数字早見表
/**
 * <--------number of objects list.----------/
 * 
 * 0: nothing space
 * 1: grass
 * 2: rock
 * 
 * 20: プレイヤーやプレイヤーの味方はここにポイントを持ってくる(味方の陣地)
 * 21: 敵はここにポイントを持ってくる
*/

//ゲームのステージマップ
var game_map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,21,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,2,2,2,2,1,2,2,2,1,1,1,1,2,0],
    [0,2,1,20,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]


//playerのスタート位置を設定
for(var i = 0;i < game_map.length;i++){
    for(var j = 0;j < game_map[i].length;j++){
        if(game_map[i][j] == 20){
            console.log(i)
            console.log(j)
            player.put(j-player_mx,i-player_my)
        }
    }
}

//mobの色々なこと

//mobを描く
//動かす処理もする
function anything_mob(){


    //mobのパラメータのリスト (list型を収納)
    //mobとかその他の複数あるものは特殊なもの以外この中に入れる
    var mob_param_list = [

        enemy, //enemy
        laser_list, //laser
        reward_list //reward
    ]

    //何をやりたいか: キーを押してplayer.move()で準備(初期化)したものをそのまま動かす
    player.move_process()



    //<-----player -----------------------/
    player.draw()

    //<-----anything mob-----------------------/

    for(var i = 0;i < mob_param_list.length;i++){
        for(var j = 0;j < mob_param_list[i].length;j++){
            var param = mob_param_list[i][j]
            param.move_process()
            param.draw()
            param.each_cmd() //それぞれのモブのオリジナルの命令　多目的
        }
    }
}

/**
 * 
 * mobを作る関数
 * mob(クラス)を作ってリストにぶち込む
 * 
 * @param str enemyなどのモブの名前
 * @returns mobのパラメータ
 * 
 */
function make_mob(str,num){
    var list_tmp = []

    for(var i = 0;i < num;i++){
        //enemy
        if(str == "enemy"){
            list_tmp.push(new enemy_cls())
            list_tmp[i].put(10,10)
        }
        if(str == "reward"){
            list_tmp.push(new reward_cls())
            list_tmp[i].put(10,8)
        }
    }

    return list_tmp
}


//攻撃する(レーザーを発射する)
function player_attack(){
    var laser = new make_laser(player.dir,player.bx,player.by)

    laser.make()

    laser_list.push(laser)
}

//laserを消す
function laser_delete(){
    var tmp  = []

    //laserを消す
    for(var i = 0;i < laser_list.length;i++){
        if(laser_list[i].px == 0 && laser_list[i].py == 0){
            //移動し終わったから消す
        }else{
            tmp.push(laser_list[i])
        }
    }
    laser_list = tmp

    //enemyを消す
    for(var i = 0;i < enemy.length;i++){
        if(enemy[i].del){
            laser_list.splice(enemy[i].col_laser,1) //enemyを打ったレーザーも削除
            enemy.splice(i,1) //enemy削除
            i--;
        }
    }

    //playerとrewardが当たったときrewardを消す
    for(var i = 0;i < reward_list.length;i++){
        if(reward_list[i].del){
            reward_list.splice(i,1) //playerと当たったrewardを削除
            player.reward += 1;
            i--;
        }
    }

}


//ゲームのステージマップをひたすら読み込んでcanvasに描く
function draw_map(input_map){

    //ステージを描いていく
    for(var i = 0;i < input_map.length;i++){
        for(var j = 0;j < input_map[i].length;j++){

            var obj_name = ""

            //描き始めるmapの最初の位置
            var draw_sx = player.bx-1
            var draw_sy = player.by-1

            //描くmapの大きさ
            var draw_w = 17
            var draw_h = 17

            if(draw_sx < 0){
                player_sx = 0
            }

            if(draw_sx <= j && draw_sx+draw_w >= j){
                if(draw_sy <= i && draw_sy+draw_h >= i){
                    switch(input_map[i][j]){
                        case 1:
                            obj_name = "grass"
                            break;
        
                        case 2:
                            obj_name = "rock"
                            break;
                        case 20: //プレイヤーやプレイヤーの味方はここにポイントを持ってくる
                            obj_name = "fside"
                            break;
                        case 21: //20の敵ver
                            obj_name = "eside"
                            break;
                        default:
                            break;
                    }   
                }
            }

            //canvasに描画
            //playerと進行方向が反対側になるようにmapを動かさなければいけないのでplayerの座標を引いている
            draw_map_obj(j*block_s-player.x,i*block_s-player.y,obj_name)
        }
    }
}

//grassとかrockとかを描く関数
function draw_map_obj(x,y,str){
    ctx.beginPath()
    
    switch(str){
        case "grass":
            ctx.rect(x,y,block_s,block_s)
            ctx.fillStyle = "#101022"
            ctx.fill()
            break;
        case "rock":
            ctx.rect(x,y,block_s,block_s)
            ctx.fillStyle = "#aaaaaa"
            ctx.fill()
            break;
        case "fside":
            ctx.rect(x,y,block_s,block_s)
            ctx.fillStyle = "#7777ff"
            ctx.fill()
            break;
        case "eside":
            ctx.rect(x,y,block_s,block_s)
            ctx.fillStyle = "#ff7777"
            ctx.fill()
            break;
        default:
            break;
    }
    ctx.closePath()
}


var onkey_count = 0; //キーを押し続けた時、プログラムで何回カウントされたか

document.onkeydown = function(e){

    //プレイヤーが移動中じゃないなら
    if(player.x == block_s*player.bx && player.y == block_s*player.by){

        //キーが押されたら移動(正確には移動の準備) and 方向転換
        if(e.key == "ArrowRight" || e.key == "Right"){//→
            player.dir = 3
            player.move(1,0)

        }else if(e.key == "ArrowLeft" || e.key == "Left"){//←
            player.dir = 4
            player.move(-1,0)

        }else if(e.key == "ArrowUp" || e.key == "Up"){//↑
            player.dir = 1
            player.move(0,-1)

        }else if(e.key == "ArrowDown" || e.key == "Down"){//↓
            player.dir = 2
            player.move(0,1)

        }

        //長押しで連続カウントはだめ。キーが一回押されたら命令を一回実行する
        if(onkey_count == 0){

            //攻撃とか色々
            if(e.key == " "){ //space attack
                player_attack()
            }
        }

    }

    onkey_count += 1
}

document.onkeyup =  function(){
    onkey_count = 0 //reset
}


//main
function game(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    draw_map(game_map)
    anything_mob() //mobの色々な関数

    laser_delete() //laserを削除する関数

    //requestAnimationFrame(game);
}

//game()

setInterval(game,5)
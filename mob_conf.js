
//mob base
class make_mob_cls{
    constructor(){
        this.px=0 //目的地までどの方向に何ブロック進めばいいか 1:→   -1:← など
        this.py=0
        this.bx=0 //移動中:目的地の座標(map上の座標)   静止しているとき:現在地のmap座標 
        this.by=0
        this.x=0  //描画関係の座標(map上の座標ではない)
        this.y=0
        this.dir=1 //向いている方向
        this.s=base_speed/5 //速さ
        this.lv=1
        this.alv=1
        this.hp=100
        this.ap=100
        this.reward = 0
        this.color = "#000000" //色

        this.delete_mode = false //このオブジェクトを消すか消さないか trueで消す


        this.avoid_filter = [1] //何のブロックはよけないか(重なってもいいブロック1の床とか)
        //ちなみにmapの数字早見表
        /**
        * <--------number of objects list.----------/
        * 
        * 0:  nothing space
        * 1:  grass
        * 2:  rock
        * 20: friend side
        * 21: enemy side
        */
    }

    draw(){
        ctx.beginPath()
        ctx.rect(this.x-player.x ,this.y-player.y ,block_s ,block_s ) //playerは移動するのでplayerの座標を引かなければいけない
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
    }

    //障害物が前にあるとき、それより先は進めなくするための関数
    avoid_obs(){

        //これがtrueの場合前に進まない。falseだったら進む
        var avoid_auth = true;

        //mobの座標が岩とかに重なっているなら戻る
        //やりたいこと: 目の前に岩とかがあったらとまるよ
        for(var i = 0;i < this.avoid_filter.length;i++){
            if(game_map[this.by][this.bx] == this.avoid_filter[i]){ //前が障害物ではなかった場合、すすむ

                avoid_auth = false

                break;
            }
        }

        //障害物が前にあった場合進まない
        if(avoid_auth){
            //戻す
            this.bx -= this.px
            this.by -= this.py

            this.px = 0
            this.py = 0
        }
    }

    //障害物とぶつかったときにどうするかをちまちま書く(正確には障害物と重なったとき)
    /**
     * 
     * @param obj_name オブジェクトの名前
     */

    collision(){
        //collision  
        /*
        switch(game_map[this.by+player_my][this.bx+player_mx]){
            default:
                break;
        } 
         */
    }

    //進む関数を初期化
    /**
     * 
     * 何ブロック進みたいか
     * 
     * @param {*number} ipx 右に1ブロック進む: 1    左に1: -1
     * @param {*number} ipy 上に1: -1    下に1: 1
     */
    move(ipx,ipy){

        //ここでは、this.px = 目的地まで何ブロックあるか
        //とする
        this.px = ipx
        this.py = ipy

        //1ブロック移動した分座標に追加
        //それぞれ0>x,yか0<x,yを見極めて-1か+1ブロック分を代入している
        if(0 < this.px){this.bx += 1}
        if(0 > this.px){this.bx -= 1}

        if(0 < this.py){this.by += 1}
        if(0 > this.py){this.by -= 1}

        this.avoid_obs()
        this.collision()

    }

    //ひたすら進む
    move_process(){

        //何をやりたいか: mobを行きたい座標(this.bx*block_s)まで連れていく。それだけ
        //原理 : ループで順番が来るときにちょっとずつ動かしている。目的の位置に着いたら止まる

        if(this.x != block_s*this.bx){ //移動中なら (今の座標が目的地の座標ではないなら)

            //そのまま動かす
            if(0 < this.px) this.x += this.s;
            if(0 > this.px) this.x -= this.s;
            

            //目的地の絶対値と今の座標の絶対値の差の絶対値がspeedより小さいと目的地を通り過ぎてしまうので、無理やり動かす。
            /**図解
             * P:mob, O:目的地
             * 
             * Pのspeedが4ブロック分だと通り過ぎてしまうので、無理やりOに座標を変えてやります。
             *             →
             * ------------P-O----------
             * 
             * ↓           p→→→
             * --------------O-P---------
             * 
             * ↓             P←p
             * --------------O----------
             */
            if(Math.abs(Math.abs(block_s*this.bx) - Math.abs(this.x)) < this.s){
                this.x = block_s*this.bx
            }
        
        }else{ //移動し終わったなら

            //1ブロック分引く(一ブロック移動したとき、目的地につくまであと何ブロックかをもとめてpxにいれる)
            if(0 < this.px){this.px -= 1}
            if(0 > this.px){this.px += 1}

            //まだ移動するなら追加。
            if(0 < this.px){this.bx += 1}
            if(0 > this.px){this.bx -= 1}

            this.avoid_obs()  //後で消す(かも)
            this.collision()  //本物のcollision

            //止まる
            //this.px = 0
        }

        if(this.y != block_s*this.by){ //移動中
            if(0 < this.py) this.y += this.s;
            if(0 > this.py) this.y -= this.s;

            if(Math.abs(Math.abs(block_s*this.by) - Math.abs(this.y)) < this.s){
                this.y = block_s*this.by
            }
        
        }else{

            //1ブロック分引く
            if(0 < this.py){this.py -= 1}
            if(0 > this.py){this.py += 1}

            //まだ移動するなら追加
            if(0 < this.py){this.by += 1}
            if(0 > this.py){this.by -= 1}

            this.avoid_obs() //後で消す(かも)
            this.collision()

            //this.py = 0
        }
    }


    /**
     * mobをその位置に置く
     * 歩くとかそういうことはしない。置くだけ
     * 
     * @param ibx ブロックでのx座標
     * @param iby ブロックでのy座標
     */
    put(ibx,iby){
        this.bx=ibx
        this.by=iby
        this.x=ibx*block_s
        this.y=iby*block_s
    }

    //それぞれのモブ自身のコマンド毎回実行される　多目的なやつ
    each_cmd(){

    }

}



//player
class player_cls extends make_mob_cls{
    constructor(){
        super()
        this.color="#00aaff"

        this.avoid_filter = [1,20,21]
    }

    avoid_obs(){

        var avoid_auth = true

        //mobの座標が岩とかに重なっているなら戻る
        //やりたいこと: 目の前に岩とかがあったらとまるよ
        //※1ブロックずつ進んでいるときしか有効ではない

        for(var i = 0;i < this.avoid_filter.length;i++){
            if(game_map[this.by+player_my][this.bx+player_mx] == this.avoid_filter[i]){

                avoid_auth = false
                break;

            }
        }

        //障害物が前にあった場合進まない
        if(avoid_auth){
            //戻す
            this.bx -= this.px
            this.by -= this.py

            this.px = 0
            this.py = 0
        }
    }

    collision(){
        switch(game_map[this.by+player_my][this.bx+player_mx]){
            default:
                break;
        } 
    }

    draw(){
        ctx.beginPath()
        ctx.rect(block_s*player_mx,block_s*player_my,block_s,block_s)
        ctx.fillStyle = "#00aaff"
        ctx.fill()
        ctx.closePath()
    }
}


//enemy
class enemy_cls extends make_mob_cls{

    constructor(){
        super(); //これがないとだめ
        this.color = "#ff0000"
        this.del = false //このオブジェクトを消すか消さないか
        this.col_laser = 0;//ぶつかったレーザー
    }
    collision(){

        switch(game_map[this.by][this.bx]){
            default:
                break;
                
        }

        //<--------mob collision----------/
        
        //laser
        for(var i = 0;i < laser_list.length;i++){
            if(laser_list[i].bx == this.bx && laser_list[i].by == this.by){
                this.del = true
                this.col_laser = i;
                console.log("aaa")
            }
        }
    }
}



//<--------------------other----------------/


//laser

class make_laser extends make_mob_cls{

    constructor(dir,bx,by){
        super();
        this.x = (player_mx+bx)*block_s
        this.y = (player_my+by)*block_s
        this.bx= player_mx+bx //プレイヤーの位置から始まりたいため、player_mxを足している
        this.by= player_my+by //同じ
        this.s = base_speed/4
        this.dir = dir
        this.color = "#00ff55"
    }

    make(){

        var laser_s = 6

        switch(this.dir){
            case 1: //↑
                this.move(0,-laser_s)
                break;
            case 2: //↓
                this.move(0,laser_s)
                break;
            case 3: //→
                this.move(laser_s,0)
                break;
            case 4: //←
                this.move(-laser_s,0)
                break;
            default:
                break;
        }
    }
}

//enemy
class reward_cls extends make_mob_cls{

    constructor(){
        super(); //これがないとだめ
        this.color = "#ffff00"
        this.del = false //このオブジェクトを消すか消さないか
        this.col_laser = 0;//ぶつかったレーザー
    }
    collision(){

        switch(game_map[this.by][this.bx]){
            default:
                break;
                
        }

        //<--------mob collision----------/
        
        //player
        if(player.bx+player_mx == this.bx && player.by+player_my == this.by){
            this.del = true
            console.log("bbb")
        }
    }
}
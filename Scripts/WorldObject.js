class WorldObject{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.drawX = this.x * rts.spaceSize;
        this.drawY = this.y * rts.spaceSize;
        this.width = width;
        this.height = height;
    }

    get worldLocation (){
        return rts.world.nodes[this.x][this.y];
    }

    draw(){
        return;
    }

    step(){
        return;
    }
}
class Wood extends Resource{
    constructor(x, y, index){
        let width = 1;
        let height = 1;
        //let canvasObj = paper
        super(x, y, width, height);

        this.woodArrayIndex = index;
        
    }

    isDepleted (person){
        if(person.lastHarvestedWood){
            var woodResourceFound = false;
            for(var x = -2; x < 3; x++){
                if(woodResourceFound){
                    break;
                }
                for(var y = -2; y < 3; y++){
                    if(rts.world.nodes[person.lastHarvestedWood.x + x] &&
                        rts.world.nodes[person.lastHarvestedWood.x + x][person.lastHarvestedWood.y + y] &&
                        rts.world.nodes[person.lastHarvestedWood.x + x][person.lastHarvestedWood.y + y].type === 1){
                        woodResourceFound = true;
                        break;
                    }
                }
            }
            return !woodResourceFound;
        }else{
            return true;
        }
    }

    draw(){
        rts.ctx.fillStyle = "#AA2244";
        rts.ctx.fillRect(this.x * rts.spaceSize, this.y * rts.spaceSize, rts.spaceSize, rts.spaceSize);
    }
}
class Base extends WorldObject{
    constructor(x, y, worldGrid){
        let width = 3;
        let height = 3;

        if((x === null || x === undefined) && (y === null || y === undefined)){
            let hittingSomething = true;
            while (hittingSomething) {
                x = parseInt(Math.random() * (worldGrid.input.length - 3 - 3)) + 3;
                y = parseInt(Math.random() * (worldGrid.input[0].length - 3 - 3)) + 3;
                
                let hit = false;
                for(let i = 0; i < width && !hit; i++){
                    for(let j = 0; j < height && !hit; j++){
                        if(worldGrid.input[x + i][y + j] === 1){
                            hit = true;
                        }
                    }
                }

                hittingSomething = hit;
            }
        }
        
        super(x, y, width, height);

        this.resources = {
			gold: 0,
			wood: 0
		};
    }

    draw(){
        rts.ctx.fillStyle = "#0000EE";
        rts.ctx.fillRect(this.x * rts.spaceSize - rts.spaceSize, this.y * rts.spaceSize - rts.spaceSize, rts.spaceSize * 3, rts.spaceSize * 3);
    }
}
class Person extends ActionObject {
    constructor(x, y, color){
        let width = 1;
        let height = 1;

        let actions = {
            gatherResource: function (resource, type){
                this.lastHarvestedWood = null;
                var boundCond = resource.isDepleted.bind(resource, this);
                this.nextGivenAct = new Behavior.ControlFlow.Repeat(
                    new Behavior.Acts.GatherResource(rts.world, rts.spaceSize, this, resource, type),
                    boundCond
                );
            },
            dropOffResources: function (){
                this.nextGivenAct = new Behavior.ControlFlow.Sequence(
                    new Behavior.Acts.GoTo(rts.world, rts.spaceSize, this, this.base.worldLocation),
                    new Behavior.Acts.DropOffResource(this.base, this)
                );
            },
            rightClick: function (targetPos){
                //harvest gold
                var selectedGoldMine = null;
                for(var i = 0; i < rts.goldMines.length; i++){
                    if(targetPos.x >= rts.goldMines[i].x - 1 && targetPos.x <= rts.goldMines[i].x + 1 &&
                        targetPos.y >= rts.goldMines[i].y - 1 && targetPos.y <= rts.goldMines[i].y + 1){
                        selectedGoldMine = rts.goldMines[i];
                        break;
                    }
                }
                
                if(selectedGoldMine){
                    if(selectedGoldMine.amount > 0){
                        var boundHarvest = this.actions.gatherResource.bind(this);
                        boundHarvest(rts.goldMines[i], "gold");
                    }
                    return;
                }
                
                //drop off resource at base
                if(targetPos.x >= this.base.x - 1 && targetPos.x <= this.base.x + 1 &&
                    targetPos.y >= this.base.y - 1 && targetPos.y <= this.base.y + 1 &&
                    (this.resources.gold > 0 || this.resources.wood > 0)){
                    var boundToBase = this.actions.dropOffResources.bind(this);
                    boundToBase();
                    return;
                }
                
                //harvest wood
                for(var w = 0; w < rts.wood.length; w++){
                    for(var w2 = 0; w2 < rts.wood[w].length; w2++){
                        if(rts.wood[w] && rts.wood[w][w2] && targetPos.x === rts.wood[w][w2].x && targetPos.y === rts.wood[w][w2].y){
                            var boundHarvest = this.actions.gatherResource.bind(this);
                            boundHarvest(rts.wood[w][w2], "wood");
                            return;
                        }
                    }
                }
                
                //attack
                
                //default move to
                var boundMove = this.actions.move.bind(this);
                boundMove(targetPos);
            }
        };

        super(x, y, width, height, actions);
        
		
		this.resources = {
			gold: 0,
			wood: 0
		};
		this.base = null;
		this.lastHarvestedWood = null;
		this.selected = false;     
        this.color = color;   
    }

    draw (){
        rts.ctx.fillStyle = this.color; //"#0000EE";
        rts.ctx.fillRect(this.drawX, this.drawY, rts.spaceSize, rts.spaceSize);
        //carrying wood
        if(this.resources.wood > 0){
            rts.ctx.fillStyle = "#AA2244";
            rts.ctx.fillRect(this.drawX, this.drawY, rts.spaceSize, Math.floor(rts.spaceSize/2));
        }
        //carrying gold
        if(this.resources.gold > 0){
            rts.ctx.fillStyle = "#CCCC22";
            rts.ctx.fillRect(this.drawX, this.drawY, rts.spaceSize, Math.floor(rts.spaceSize/2));
        }
        //is selected
        if(this.selected){
            rts.ctx.strokeStyle = "#ff7ec9";
            rts.ctx.beginPath();
            rts.ctx.arc(this.drawX + (rts.spaceSize/2), this.drawY + (rts.spaceSize/2), rts.spaceSize * 1.4, 0, Math.PI * 2);
            rts.ctx.stroke();
        }
    }

    select (){
        this.selected = true;
    }

    unselect (){
        this.selected = false;
    }
}
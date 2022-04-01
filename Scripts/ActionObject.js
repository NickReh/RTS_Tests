class ActionObject extends WorldObject{
    constructor (x, y, width, height, additionalActions){
        super(x, y, width, height);

        this.prevX = null;
        this.prevY = null;
        this.moveArray = [];
		this.currentMove = null;
		this.currentMoveStep = 1;

        this.autoActs = [];
		this.givenAct = null;
        this.nextGivenAct = null;
        
        this.initActions(additionalActions);
    }

    initActions (additionalActions){
        this.actions = {
            move: function (targetPos) {
                var targetPos = rts.world.nodes[targetPos.x][targetPos.y];
                this.nextGivenAct = new Behavior.Acts.GoTo(rts.world, rts.spaceSize, this, targetPos);
            }
        };

        Object.assign(this.actions, additionalActions);
    }

    step (){
        if(!!this.nextGivenAct && (!this.givenAct || this.givenAct.isClean)){
            this.givenAct = this.nextGivenAct;
            this.nextGivenAct = null;
        }
    
        //step through actions
        if(this.givenAct){
            var status = this.givenAct.step();
            if(status === "success"){
                this.givenAct = null;
            }else if (status === "fail"){
                this.givenAct = null;
            }
        }else if (this.autoActs.length){
            var status = this.autoActs[0].step();
            if(status === "success" || status === "fail"){
                this.autoActs.shift();
            }
        }
        
        //update world with my position as taken
        if(this.prevX !== null && this.prevY != null && (this.prevX !== this.x || this.prevY !== this.y)){
            rts.world.nodes[this.prevX][this.prevY].type = 0;
            rts.world.input[this.prevX][this.prevY] = 0;
        }
        rts.world.nodes[this.x][this.y].type = 2;
        rts.world.input[this.x][this.y] = 2;
        
        //move paper objs
        //this.canvasObj.position = new paper.Point(this.x * rts.spaceSize + (rts.spaceSize/2), this.y * rts.spaceSize + (rts.spaceSize/2));
        //if(this.selected){
        //    this.selected.position = new paper.Point(this.x * rts.spaceSize + (rts.spaceSize/2), this.y * rts.spaceSize + (rts.spaceSize/2));
       // }
    }
}
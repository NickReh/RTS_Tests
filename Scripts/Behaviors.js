//global dictionary of Behavior variables
var blackBoard = {};

var Behavior = {
	ControlFlow: {
		//All children sequentially. Any child returns fail or all children return success.
		Sequence: function (){
			this.acts = [];
			this.isClean = true;
			this.step = function (){
				if(this.acts.length){
					var status = this.acts[0].step();
					this.isClean = this.acts[0].isClean;
					
					if(status === "success"){
						this.acts.shift();
						if(this.acts.length === 0){
							return status;
						}else{
							return "running";
						}
					}else{
						return status;
					}
				}else{
					return "success";
				}
			}
			
			//init
			console.log("Sequence: ");
			for(var i = 0; i < arguments.length; i++){
				console.log(arguments[i].name);
				this.acts.push(arguments[i]);
			}
			
			return this;
		},
		//All children sequentially. Any child returns success or all children return fail.
		Select: function (){
			this.acts = [];
			this.isClean = true;
			this.step = function (){
				for(var i = 0; i < this.acts.length; i++){
					if(this.acts[i].status === "running"){
						var status = this.acts[i].act.step();
						this.isClean = this.acts[i].act.isClean;
					
						if(status === "success"){
							return "success"
						}else{
							this.acts[i].status = status;
						}
					}
				}
				
				//check if all children failed
				var failed = true;
				for(var j = 0; j < this.acts.length; j++){
					failed = this.acts[j].status === "fail";
				}
				if(failed){
					return "fail";
				}else{
					return "running";
				}
			}
			
			//init
			console.log("Select: ");
			for(var i = 0; i < arguments.length; i++){
				console.log(arguments[i].name);
				this.acts.push({act: arguments[i], status: "running"});
			}
			
			return this;
		},
		//All children at the same time. Any child returns fail or all children return success.
		Parallel: function (){
			this.acts = [];
			this.isClean = true;
			this.step = function (){
				for(var i = 0; i < this.acts.length; i++){
					if(this.acts.status === "running"){
						var status = this.acts[i].act.step();
						this.isClean = this.acts[i].act.isClean;
						
						if(status === "fail"){
							return "fail";
						}else{
							this.acts[i].status = status;
						}
					}
				}
				
				//check if all children succeeded
				var success = true;
				for(var j = 0; j < this.acts.length; j++){
					success = this.acts[j].status === "success";
				}
				
				if(success){
					return "success";
				}else{
					return "running";
				}
			}
			
			//init
			for(var i = 0; i < arguments.length; i++){
				this.acts.push({act: arguments[i], status: "running"});
			}
			
			return this;
		},
		//One child. Return the opposite of the child.
		Not: function (behavior){
			this.behavior = behavior;
			this.isClean = true;
			this.step = function (){
				var status = this.behavior.step();
				this.isClean = this.behavior.isClean;
				
				if(status === "success"){
					return "fail";
				}else if (status === "fail"){
					return "success";
				}else{
					return "running";
				}
			}
			
			return this;
		},
		//One child. Return running until condition is met, then success.
		Repeat: function (behavior, conditionFunc){
			this.behavior = behavior;
			this.isClean = true;
			this.step = function (){
				var status = this.behavior.step();
				this.isClean = this.behavior.isClean;
				
				if(status === "success" && conditionFunc()){
					return "success";
				}
				
				if(status === "success"){
					this.behavior.initialized = false;
					return "running";
				}else if(status === "fail"){
					return "fail";
				}else{
					return "running";
				}
			}
			
			return this;
		},
		//One child. Return fail if condition is not met, otherwise return what the child returns.
		Domain: function (behavior, conditionFunc){
			this.behavior = behavior;
			this.isClean = true;
			this.step = function (){
				if(!conditionFunc()){
					return "fail";
				}else{
					var behaviorResults = this.behavior.step();
					this.isClean = this.behavior.isClean;
					return behaviorResults;
				}
			}
			
			return this;
		},
		//All children in priority order. Same as Select.
		Queue: function (){
			this.acts = [];
			this.currentActIndex = 0;
			this.lastSuccessfulIndex = null;
			this.isClean = true;
			this.step = function (){
				if(this.acts.length){
					var status = this.acts[this.currentActIndex].step();
					this.isClean = this.acts[this.currentActIndex].isClean;
					
					if(status === "success"){
						this.lastSuccessfulIndex = this.currentActIndex;
						this.currentActIndex = 0;
						if(this.lastSuccessfulIndex === 0){
							return "success";
						}else{
							return "running";
						}
					}else if(status === "fail"){
						this.currentActIndex++;
						if(this.currentActIndex >= this.acts.length || this.currentActIndex === this.lastSuccessfulIndex){
							return "fail";
						}else{
							return "running";
						}
					}else{
						return "running";
					}
				}else{
					return "success";
				}
			}
			
			//init
			console.log("Queue: ");
			for(var i = 0; i < arguments.length; i++){
				console.log(arguments[i].behavior.name);
				this.acts.push(arguments[i]);
			}
			
			return this;
		}
	},
	Acts: {
		Idle: function (){
			
		},
		GoTo: function (world, spaceSize, actionObject, end){
			this.name = "GoTo";
			this.actionObject = actionObject;
			this.end = end;
			this.moveArray = [];
			this.currentMove = null;
			this.currentMoveStep = 1;
			this.isClean = true;
			this.initialized = false;
			this.init = function (){
				console.log("GoTo: " + actionObject.color + " to " + end);
				this.isClean = true;
				var start = this.actionObject.worldLocation;
				//if not a free space, find closest free space to it
				if(this.end.type > 0){
					this.end = astarClosestOpen.search(world.nodes, this.end, start);
					this.actionObject.moveCurrentClosestClosed = this.end.closestClosedSpot;
				}
				this.moveArray = astar.search(world.nodes, start, this.end, undefined, true);
				this.initialized = true;
			};
			this.step = function (){
				if(!this.initialized){
					if(this.init() === "fail"){
						return "fail";
					}
				}
				
				if(this.currentMoveStep !==1 || this.moveArray.length){
					if(this.currentMoveStep === 1){
						if(this.currentMove){
							if(this.end.type > 0){
								this.end = astarClosestOpen.search(world.nodes, this.end, this.actionObject.worldLocation);
								this.actionObject.moveCurrentClosestClosed = this.end.closestClosedSpot;
							}
							this.moveArray = astar.search(world.nodes, this.currentMove, this.end, undefined, true);
						}
						this.currentMove = this.moveArray.shift();
						//space became blocked
						if(this.currentMove.type > 0){
							return "fail";
						}
					}
					this.isClean = false;
					var diag = this.currentMove.x !== this.actionObject.x && this.currentMove.y !== this.actionObject.y;
					var moveMult = diag ? .7142857 : 1;
					this.actionObject.drawX += (this.currentMove.x - this.actionObject.x) * moveMult;
					this.actionObject.drawY += (this.currentMove.y - this.actionObject.y) * moveMult;
					
					this.currentMoveStep++;
					if((!diag && this.currentMoveStep > spaceSize) || (diag && this.currentMoveStep > (spaceSize * 1.4))){
						this.currentMoveStep = 1;
						this.isClean = true;
						this.actionObject.prevX = this.actionObject.x;
						this.actionObject.prevY = this.actionObject.y;
						this.actionObject.x = this.currentMove.x;
						this.actionObject.y = this.currentMove.y;
						this.actionObject.drawX = this.actionObject.x * spaceSize;
						this.actionObject.drawY = this.actionObject.y * spaceSize;
						//this.currentMove = null;
					}
					
					return "running";
				}else{
					return "success";
				}
			};
			
			return this;
		},
		GatherResource: function (world, spaceSize, person, resource, resourceType){
			this.name = "GatherResource";
			this.person = person;
			this.resource = resource;
			this.resourceType = resourceType;
			this.initialized = false;
			this.isClean = true;
			this.act = null;
			this.init = function (){
				console.log("GatherResource: " + person.color + " to " + resource.x + ", " + resource.y);
				this.isClean = true;
				//check if repeating harvesting and need to find a new wood spot to harvesting
				if(this.resourceType === "wood" && this.person.lastHarvestedWood){
					var woodResource = null;
					for(var x = -2; x < 3; x++){
						if(woodResource){
							break;
						}
						for(var y = -2; y < 3; y++){
							if(world.nodes[this.person.lastHarvestedWood.x + x] &&
							world.nodes[this.person.lastHarvestedWood.x + x][this.person.lastHarvestedWood.y + y] &&
							world.nodes[this.person.lastHarvestedWood.x + x][this.person.lastHarvestedWood.y + y].type === 1){
								woodResource = rts.wood[this.person.lastHarvestedWood.x + x][this.person.lastHarvestedWood.y + y];
								break;
							}
						}
					}
					if(!woodResource){
						return "fail";
					}else{
						this.resource = woodResource;
					}
				}
				
				var resourceLocation = this.resource.worldLocation;
				
				//new act
				var newAct;
				var queueAct = new Behavior.ControlFlow.Queue(
					new Behavior.ControlFlow.Domain(
						new Behavior.Acts.DropOffResource(world, spaceSize, this.person.base, this.person),
						function () {
							return arguments[0].resources.wood > 0 || arguments[0].resources.gold > 0;
						}.bind(this, this.person)
					),
					new Behavior.ControlFlow.Domain(
						new Behavior.Acts.ActuallyGatherResource(world, this.resource, this.person, this.resourceType),
						function () {
							var person = arguments[0];
							var resource = person.moveCurrentClosestClosed || arguments[1];
							if(resource){
								return (person.x + person.width > resource.x && 
								person.x < resource.x + resource.width &&
								person.y + person.height > resource.y &&
								person.y < resource.y + resource.height)
								||
								((person.x === resource.x && person.y - 1 === resource.y) ||
								(person.x - 1 === resource.x && person.y === resource.y) ||
								(person.x === resource.x && person.y + 1 === resource.y) ||
								(person.x + 1 === resource.x && person.y === resource.y));
							}
							return false;
						}.bind(this, this.person, this.resource)
					),
					new Behavior.ControlFlow.Domain(
						new Behavior.Acts.GoTo(world, spaceSize, this.person, resourceLocation),
						function (){
							return arguments[0].resources.wood === 0 || arguments[0].resources.gold === 0;
						}.bind(this, this.person)
					)						
				);
				if(this.person.resources.gold > 0 || this.person.resources.wood > 0){
					newAct = new Behavior.ControlFlow.Sequence(
						new Behavior.Acts.DropOffResource(world, spaceSize, this.person.base, this.person),
						queueAct
					);
				}else{
					newAct = queueAct;
				}
				this.act = newAct;
				this.initialized = true;
			};
			this.step = function (){	
				if(!this.initialized){
					if(this.init() === "fail"){
						return "fail";
					}
				}
				
				if(this.act){
					//check if resource is out or was taken before you got there
					switch(this.resourceType){
						case "wood":
							if(((this.person.moveCurrentClosestClosed && this.person.moveCurrentClosestClosed.type !== 1) || (!this.person.moveCurrentClosestClosed && world.input[this.resource.x][this.resource.y] !== 1)) && this.act.acts[0].behavior &&
							((this.act.acts[0].behavior.name === "GoTo" && this.act.acts[0].isClean) ||
							this.act.acts[0].behavior.name === "ActuallyGatherResource")){
								this.initialized = false;
								this.person.lastHarvestedWood = this.resource;
								if(this.init() === "fail"){
									return "fail";
								}
							}
							break;
						case "gold":
							if(this.resource.amount <= 0 && this.act.acts[0].behavior &&
							((this.act.acts[0].behavior.name === "GoTo" && this.act.acts[0].behavior.isClean) ||
							this.act.acts[0].behavior.name === "ActuallyGatherResource")){
								return "fail";
							}
							break;
						default:
							break;
					}
					var status = this.act.step();
					this.isClean = this.act.isClean;
					
					if(status === "success"){
						this.act = null;
						return "running";
					}else{
						return status;
					}
				}else{
					return "success";
				}
			};
			
			return this;
		},
		ActuallyGatherResource: function (world, resource, person, resourceType){
			this.name = "ActuallyGatherResource";
			this.resource = resource;
			this.person = person;
			this.resourceType = resourceType;
			this.resourceSteps = 0;
			this.isClean = true;
			this.initialized = false;
			this.init = function (){
				console.log("ActuallyGatherResource: " + person.color + " to " + resource.x + ", " + resource.y);
				this.initialized = true;
			};
			this.step = function (){
				if(!this.initialized){
					if(this.init() === "fail"){
						return "fail";
					}
				}
				
				this.resourceSteps++;
				switch(this.resourceType){
					case "wood":
						if(this.resourceSteps > 200){
							var woodSpot = this.person.moveCurrentClosestClosed;
							this.person.moveCurrentClosestClosed.type = 0;
							world.nodes[woodSpot.x][woodSpot.y].type = 0;
							world.input[woodSpot.x][woodSpot.y] = 0;
							this.person.resources.wood += 10;
							this.person.lastHarvestedWood = this.resource;
							delete rts.wood[woodSpot.x][woodSpot.y];
							rts.wood[woodSpot.x][woodSpot.y] = null;
							delete this.person.moveCurrentClosestClosed;
							return "success";
						}else{
							return "running";
						}
						break;
					case "gold":
						if(this.resource.amount > 0 ){
							if(this.resourceSteps > 150){
								this.resource.amount -= 10;
								this.person.resources.gold += 10;
								return "success";
							}else{
								return "running";
							}
						}
				}
				
				return "success";
			};
			
			return this;
		},
		DropOffResource: function (world, spaceSize, base, person){
			this.name = "DropOffResource";
			this.base = base;
			this.person = person;
			this.act = null;
			this.isClean = true;
			this.initialized = false;
			this.init = function (){
				console.log("DropOffResource: " + person.color + " to " + base.x + ", " + base.y);
				this.isClean = true;
				
				//get closest spot outside of base
				var xDif = this.person.x - this.base.x;
				var yDif = this.person.y - this.base.y;
				var mag = Math.sqrt((xDif * xDif) + (yDif * yDif));
				var unitX = xDif / mag;
				var unitY = yDif / mag;
				
				var goToBaseLoc;
				if(Math.abs(unitX) > Math.abs(unitY)){
					if(unitX > 0){  //right
						goToBaseLoc = world.nodes[this.base.x + 2][this.base.y];
					}else{  //left
						goToBaseLoc = world.nodes[this.base.x - 2][this.base.y];
					}
				}else{
					if(unitY > 0){  //bottom
						goToBaseLoc = world.nodes[this.base.x][this.base.y + 2];
					}else{  //top
						goToBaseLoc = world.nodes[this.base.x][this.base.y - 2];
					}
				}
				
				this.act = new Behavior.ControlFlow.Sequence(
					new Behavior.Acts.GoTo(world, spaceSize, this.person, goToBaseLoc),
					new Behavior.Acts.ActuallyDropOffResource(this.base, this.person)
				);
				
				this.initialized = true;
			};
			this.step = function (){
				if(!this.initialized){
					if(this.init() === "fail"){
						return "success";
					}
				}
				
				if(this.act){
					var status = this.act.step();
					this.isClean = this.act.isClean;
					
					if(status === "success"){
						this.act = null;
						return "success";
					}else{
						return status;
					}
				}else{
					return "success";
				}
			};
			
			return this;
		},
		ActuallyDropOffResource: function (base, person){
			this.name = "ActuallyDropOffResource";
			this.base = base;
			this.person = person;
			this.isClean = true;
			this.initialized = false;
			this.init = function (){
				console.log("ActuallyDropOffResource: " + person.color + " to " + base.x  + ", " + base.y);
				this.initialized = true;
			};
			this.step = function (){
				if(!this.initialized){
					if(this.init() === "fail"){
						return "success";
					}
				}
				
				if(this.person.resources.gold > 0 || this.person.resources.wood > 0){
					this.base.resources.gold += this.person.resources.gold;
					this.person.resources.gold = 0;
					this.base.resources.wood += this.person.resources.wood;
					this.person.resources.wood = 0;
				}
				
				return "success";
			};
			
			return this;
		}
	}
}
class Resource extends WorldObject{
    constructor(x, y, width, height, canvasObj){
        super(x, y, width, height, canvasObj);

        this.amount = 1000;
    }

    isDepleted (){
        return this.amount <= 0;
    }
}
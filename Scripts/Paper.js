var paperObj = {
	canvas: null,
	ctx: null,
	project: null,
	defaultLayer: null,
	canvasObjects: [],
	clearCanvas: function ( e ) {
		this._defaultLayer.activate();
		window.paper.project.activeLayer.removeChildren();

		this._canvas.width = this._canvas.width;
		this._context.clearRect( 0, 0, this._canvas.width, this._canvas.height );
	},
	init: function (){
		this.canvas = document.getElementById("canvas");
		this.ctx = this.canvas.getContext("2d");
		window.paper.setup(this.canvas);
		this.canvas.style.width = 600;
		this.canvas.style.height = 600;
		this.project = window.paper.projects[0];
		this.defaultLayer = this.project.activeLayer;
		window.paper.view.draw();
	},
	render: function (){
		window.paper.view.draw();
	},
	clearCanvas: function (){
		this.defaultLayer.activate();
		window.paper.project.activeLayer.removeChildren();
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
	},
	remove: function ( canvasObject ) {
		function applyIfArray ( collectionOrObject, func ) {
			if ( Array.isArray( collectionOrObject ) ) {
				_.each( collectionOrObject, func );
			} else {
				func( collectionOrObject );
			}
		}

		var r = function ( o ) {
			if ( typeof o === "undefined" || !o ) {
				return;
			}

			o.remove();

			var i = this.canvasObjects.indexOf( o );

			(i > -1) && this.canvasObjects.splice( i, 1 );
		}.bind( this );

		applyIfArray( canvasObject, r );
	},
	drawCircleFill: function (x, y, radius, fillColor, outlineColor, outlineWidth, opacity){
		with(window.paper){
			var center = new Point(x, y);
			var shape = new Shape.Circle(center, radius);
			shape.style = {
				fillColor: fillColor,
				strokeColor: outlineColor,
				strokeWidth: outlineWidth,
				opacity: opacity || 1
			};
			var path = shape.toPath(true);
			shape.remove();
			
			this.canvasObjects.push(path);
			return path;
		}
	},
	drawCircleOutline: function (x, y, radius, outlineColor, outlineWidth, opacity){
		with(window.paper){
			var center = new Point(x, y);
			var shape = new Shape.Circle(center, radius);
			shape.style = {
				strokeColor: outlineColor,
				strokeWidth: outlineWidth || 1,
				opacity: opacity || 1
			};
			var path = shape.toPath(true);
			shape.remove();
			
			this.canvasObjects.push(path);
			return path;
		}
	},
	drawRectFill: function (x, y, w, h, fillColor, outlineColor, outlineWidth, opacity){
		with(window.paper){
			var point = new Point(x, y);
			var size = new Size(w, h);
			var shape = new Shape.Rectangle(point, size)
			shape.style = {
				fillColor: fillColor,
				strokeColor: outlineColor,
				strokeWidth: outlineWidth,
				opacity: opacity || 1
			};
			var path = shape.toPath(true);
			shape.remove();
			
			this.canvasObjects.push(path);
			return path;
		}
	},
	drawRectOutline: function (x, y, h, w, outlineColor, outlineWidth, opacity){
		with(window.paper){
			var point = new Point(x, y);
			var size = new Size(w, h);
			var shape = new Shape.Rectangle(point, size)
			shape.style = {
				strokeColor: outlineColor,
				strokeWidth: outlineWidth || 1,
				opacity: opacity || 1
			};
			var path = shape.toPath(true);
			shape.remove();
			
			this.canvasObjects.push(path);
			return path;
		}
	},
	drawLine: function (pointArray, color, width, opacity, isSmooth){
		var lineStyle = {
			strokeColor: color,
			strokeWidth: width || 1,
			opacity: opacity || 1
		};
		
		with(window.paper){
			var path = new Path();
			
			_.each(pointArray, function(point){
				var point = new Point(point.x, point.y);
				path.add(point);
			}, this);
			
			if(isSmooth){
				path.smooth();
			}
		}
		
		this.canvasObjects.push(path);
		return path;
	}
}
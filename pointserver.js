class PointServer {
	constructor() {
		this.points = []; //lidarpoints
		this.inputPoints = []; // Array separado para mouse/touch
		
		// Inicializar con algunos puntos de ejemplo
		//this.points.push(new LidarPoint(width/2, height*1/4, 0));
		//this.points.push(new LidarPoint(width/2, height/2, 1));
		//this.points.push(new LidarPoint(width/2, height*3/4, 2));
	}
	display() {
		// Dibujamos todos los puntos (LIDAR + input)
		const allPoints = [...this.points, ...this.inputPoints];

		textAlign(LEFT)
		fill(255);
		textSize(30);
		text(`Puntos Totales: ${allPoints.length}`, 40, 40);
	  
		for (let i = 0; i < allPoints.length; i++) {
			fill(255, 0, 0);
			ellipse(allPoints[i].x, allPoints[i].y, 30, 30);
			fill(255);
			ellipse(allPoints[i].x, allPoints[i].y, 15,15);
			textSize(80);
			fill(255,255,0)
			text(str(allPoints[i].id), allPoints[i].x, allPoints[i].y)
		}
		
	}
	getAllPoints(){
		return [...this.points, ...this.inputPoints];
	}
	update() {
		this.inputPoints = []; // Reset input points

		// Mouse tracking
		if (mouseIsPressed) {
			this.inputPoints.push(new LidarPoint(mouseX, mouseY, 0));
		}

		// Touch tracking
		for (let i = 0; i < touches.length; i++) {
			this.inputPoints.push(new LidarPoint(touches[i].x, touches[i].y,i));
		}
	}

	processJSONtouch(_json){
		// Verificar si el JSON es válido
		if (!_json || !_json.points || !Array.isArray(_json.points)) {
			console.error('JSON inválido o no contiene puntos');
			return;
		}

		// Crear un mapa de los puntos actuales por ID para búsqueda rápida
		const currentPointsMap = {};
		for (let i = 0; i < this.points.length; i++) {
			currentPointsMap[this.points[i].id] = i;
		}

		// Crear un conjunto de IDs del nuevo JSON para verificar qué puntos eliminar
		const newPointIds = new Set();
		_json.points.forEach(point => {
			newPointIds.add(point.id);
		});

		// Eliminar puntos que ya no existen en el nuevo JSON
		for (let i = this.points.length - 1; i >= 0; i--) {
			if (!newPointIds.has(this.points[i].id)) {
				this.points.splice(i, 1);
			}
		}

		// Actualizar puntos existentes o crear nuevos
		_json.points.forEach(point => {
			const index = currentPointsMap[point.id];
			
			if (index !== undefined) {
				// Actualizar punto existente
				this.points[index].x = map(point.x,1,0,0,width) ;
				this.points[index].y = map(point.y,1,0,0,height) ;
			} else {
				// Crear nuevo punto
				this.points.push(new LidarPoint(point.x * width, point.y * height, point.id));
			}
		});

		console.log(`Procesados ${_json.total_points} puntos. Puntos actuales: ${this.points.length}`);
	}

}

class LidarPoint{
	constructor(_x,_y,_id){
		this.x = _x;
		this.y = _y;
		this.id = _id;
	}
	
	set(newX, newY) {
		this.x = newX;
		this.y = newY;
	}
}
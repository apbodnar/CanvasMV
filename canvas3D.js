var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

canvas.width = 750;
canvas.height = 750;

var model = {};
var env = {};

env.lightpos = [10,10,-100];
model.tri = [];
model.vert = [];
model.diffuse = [40,20,244];
model.ambient = 10;
model.maxdim = 0;
model.rx = 0;
model.ry = 0;

function cross(v1, v2){
	var vR = [];
	vR[0] =   ( (v1[1] * v2[2]) - (v1[2] * v2[1]) );
	vR[1] = - ( (v1[0] * v2[2]) - (v1[2] * v2[0]) );
	vR[2] =   ( (v1[0] * v2[1]) - (v1[1] * v2[0]) );
	return vR;
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
		
		model.rx = mousePos.x/100;
		model.ry = mousePos.y/100;
		
		model.drawMesh();
		
      }, false);

function openMeshFile(evt){
    var f = evt.target.files[0]; 
	var contents;
	if (f) {
		var r = new FileReader();
		r.onload = function(e) { 
			contents = e.target.result;
			parseMeshFile(contents);
		}
		r.readAsText(f);
	} else { 
		alert("Failed to load file");
	}
}

function rotateVectorY(v , theta){
	xp = v[1]*Math.cos(theta) - v[2]*Math.sin(theta);
	yp = v[1]*Math.sin(theta) + v[2]*Math.cos(theta);
	return [v[0],yp,xp];
}

function rotateVectorX(v , theta){
	xp = v[0]*Math.cos(theta) + v[2]*Math.sin(theta);
	zp = -v[0]*Math.sin(theta) + v[2]*Math.cos(theta);
	return [xp,v[1],zp];
}

function netRotate(v,dx,dy){
	var nv1 = rotateVectorX(v , dx);
	return rotateVectorY(nv1 , dy);
}

function parseMeshFile(contents){
	var table = contents.split(/\s+/g);
	var numVerts = parseInt(table[0]);
	var numTris = parseInt(table[numVerts*3+1]);
	for(var i=0; i < numVerts*3; i++){
		model.vert.push(table[i+1]);
		if(Math.abs(table[i+1]) > model.maxdim)
			model.maxdim = table[i+1];
	}	
	for(var i=0; i<numTris*3; i++){
		model.tri.push(table[numVerts*3+i+2]);
	}	
	console.log(model.maxdim);
	model.drawMesh();
}

document.getElementById('fileinput').addEventListener('change', openMeshFile, false);

function normalize(v1){
	var vR = [];
	var fMag = Math.sqrt( Math.pow(v1[0], 2) +
						Math.pow(v1[1], 2) +
						Math.pow(v1[2], 2)
					  );
	vR[0] = v1[0] / fMag;
	vR[1] = v1[1] / fMag;
	vR[2] = v1[2] / fMag;
	return vR;
}

function vsub(v1, v2){
	return [v1[0]-v2[0],v1[1]-v2[1],v1[2]-v2[2]];
}

function dot(v1, v2){
	return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2];
}

model.drawMesh = function(){
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.translate(canvas.width/2, canvas.height/2);
	var scale = [canvas.width/2/model.maxdim, canvas.height/2/model.maxdim];
	
	for(var i=0; i<model.tri.length; i+=3){
		var vert1 = [model.vert[model.tri[i]*3]*scale[0],model.vert[model.tri[i]*3+1]*scale[0],model.vert[model.tri[i]*3+2]*scale[0]];
		var vert2 = [model.vert[model.tri[i+1]*3]*scale[0],model.vert[model.tri[i+1]*3+1]*scale[0],model.vert[model.tri[i+1]*3+2]*scale[0]];
		var vert3 = [model.vert[model.tri[i+2]*3]*scale[0],model.vert[model.tri[i+2]*3+1]*scale[0],model.vert[model.tri[i+2]*3+2]*scale[0]];
		
		var nv1 = netRotate(vert1 , this.rx, this.ry);
		var nv2 = netRotate(vert2 , this.rx, this.ry);
		var nv3 = netRotate(vert3 , this.rx, this.ry);
		
		var triangle = [nv1,nv2,nv3];
		
		v1 = vsub(triangle[0],triangle[1]);
		v2 = vsub(triangle[0],triangle[2]);
		var n = normalize(cross(v1,v2));
		var intensity = dot(n,normalize(env.lightpos));;
		if(intensity > 0){
			//console.log(intensity);
			ctx.beginPath();
			//ctx.lineWidth =1;
			/*
			var color = "rgba("
					+Math.round(intensity*model.diffuse[0])+","
					+Math.round(intensity*model.diffuse[1])+","
					+Math.round(intensity*model.diffuse[2])+", 1)";
			*/

			var color = "rgba("
					+Math.round(255*n[0])+","
					+Math.round(255*n[1])+","
					+Math.round(-255*n[2])+", 1)";
			
			ctx.strokeStyle = ctx.fillStyle = color;
			//ctx.fillStyle = model.diffuse;
			ctx.moveTo(triangle[0][0],triangle[0][1]);
			ctx.lineTo(triangle[1][0],triangle[1][1]);
			ctx.lineTo(triangle[2][0],triangle[2][1]);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
			
		}
	}
	ctx.restore();
}

//model.drawMesh();

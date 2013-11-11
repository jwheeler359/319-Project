	// JavaScript Document
	// author: AJ Hinkens and Franklin Nelson
	// version 0.03
		
	//general variables
	var canvas;
	var context;
	var colors = ["rgba(0,80,106)","rgba(18,142,182,.8)","rgba(119,12,40,.8)","rgba(182,171,9,.8)","rgba(115,182,0,.8)"];//Dark Blue, Light Blue, Red, Yellow, Green
	var statusEnum = Object.freeze({'PASSED':0, 'PLANNED':1,'INPROG':2,'INCOM':3});
	var windowHeight = $(window).get(0).innerHeight; 
	var windowWidth = $(window).get(0).innerWidth;
	var classList;
	var slots = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]; // use timeSlot here and longer arrays
	
	//Prepare the canvas
	$(document).ready(function() {
					canvas = $("#mainCanvas");
					context = canvas.get(0).getContext("2d");
					resizeCanvas();
					drawLines();
					makeClassList();
					populateSidebar(classList);
					//alert("Ready!");

	});

	function makeClassList(){
		var course1 =  new course("Design",270,statusEnum.INCOM);
		classList = [course1,course1,course1,course1,course1,course1,course1,course1,course1,course1,course1,course1,course1,course1,course1,course1];
	}

	function resizeCanvas() {
		canvas.attr("width", $(window).get(0).innerWidth);
		canvas.attr("height", $(window).get(0).innerHeight);
	};

	$(window).resize(updateSize);
	
	function updateSize() {
			resizeCanvas();
			windowHeight = canvas.height();
			windowWidth = canvas.width();
			//clears the canvas of all drawn elements
			context.clearRect(0, 0, canvas.width, canvas.height);
			populateSidebar(classList);
			drawLines();
	}

	//Draw the yellow semester-division lines on the canvas
	function drawLines(){
		var lineY = windowHeight/8;
		var lineX1 = windowWidth*.22;
		if(lineX1<320){
			lineX1=320;
		}
		var lineX2 = lineX1+windowWidth*.66;
		for(var i = 1; i<=7; i++){
		      context.beginPath();
		      context.moveTo(lineX1, lineY*i);
		      context.lineTo(lineX2, lineY*i);
		      context.lineWidth = 2;
		      context.strokeStyle = colors[3];
		      context.stroke();
	     }
	}
	
	function populateSidebar(classList){
		var location = [10,10,320,100];
		var maxSidebarCapacity;
		location[2] = (windowWidth/5) - 20;
		if(location[2]<320){
			location[2]=285;
		}
		maxSidebarCapacity = Math.floor(windowHeight/(location[3]+10));
		for(var i = 0; i<classList.length; i++){
			if(i==maxSidebarCapacity){
				break;
			}
			drawClassRect(classList[i], location);
			location[1]+=110;
		}
	}
	
	function drawClassRect(course, location){
		var color = colors[2];
		
		context.beginPath();
		switch(course.status){
			case statusEnum.PASSED: 
				color = colors[4];
				break;
			case statusEnum.INPROG:
				color = colors[3];
				break;
			case statusEnum.PLANNED:
				color = colors[1];
				break;
			case statusEnum.INCOM:
				color = colors[2];
				break;
			default:
				color = "rgb(255,0,0)";		
		}
		context.rect(location[0], location[1], location[2], location[3]);
		context.fillStyle = color;
		context.fill();
	}
	
	function course(program,name,status)
	{
		this.status = status;
		this.program = program;
		this.getProgram = function(){return this.program;};
		this.name = name;
		this.getName = function(){return this.name;};
	}
	
	/*
				var stage = new Kinetic.Stage
				({
					container: 'container',
					width: 1,
					height: 1
				});
		
				var layer = new Kinetic.Layer();

				var classGroup = new Kinetic.Group
				({
					x: 100,
					y: 70,
					draggable: true
				});
				
				var classText = new Kinetic.Text
				({
					fontSize: 26,
					fontFamily: 'Calibri',
					text: 'Class',
					fill: 'black',
					padding: 10
				});
				
				var classRect = new Kinetic.Rect
				({
					width: classText.getWidth(),
					height: classText.getHeight(),
					fill: '#aaf',
					stroke: 'black',
					strokeWidth: 4
				});

				classGroup.add(classRect).add(classText);
				layer.add(classGroup);
				stage.add(layer);
	*/
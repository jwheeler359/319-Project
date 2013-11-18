	// JavaScript Document
	// author: AJ Hinkens and Franklin Nelson
	// version 0.04
		
	//general variables
	var stage;
	var lineLayer;
	var courseLayer;
	var colors = ["rgba(0,80,106)","rgba(18,142,182,.8)","rgba(119,12,40,.8)","rgba(182,171,9,.8)","rgba(115,182,0,.8)"];//Dark Blue, Light Blue, Red, Yellow, Green
	var statusEnum = Object.freeze({'PASSED':0, 'PLANNED':1,'INPROG':2,'INCOM':3});
	var windowHeight = $(window).get(0).innerHeight; 
	var windowWidth = $(window).get(0).innerWidth;
	var classList;
	var slots = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]; // use timeSlot here and longer arrays

	//Prepare the canvas
	$(document).ready(function()
	{
		createStage();
		courseLayer = new Kinetic.Layer();
		lineLayer = new Kinetic.Layer();
		makeClassList();
		drawLines();
		populateSidebar(classList);
		stage.add(lineLayer);
		stage.add(courseLayer);
	});

	function createStage(){
		stage = new Kinetic.Stage(
		{
			container: 'foreground',
			width: windowWidth,
			height: windowHeight
		});
	}
	
	function makeClassList(){
		var course1 =  new course("Design",270,statusEnum.PASSED);
		var course2 =  new course("ngiseD",72,statusEnum.INCOM);
		var course3 =  new course("Desngi",27,statusEnum.PLANNED);
		classList = [course1,course2,course3,course1,course2,course3,course1,course2,course3,course1,course2,course3,course1,course2,course3];
	}

	function resizeCanvas()
	{
		canvas.attr("width", $(window).get(0).innerWidth);
		canvas.attr("height", $(window).get(0).innerHeight);
	};

	$(window).resize(updateSize);
	
	function updateSize()
	{
		windowHeight = $(window).get(0).innerHeight; 
		windowWidth = $(window).get(0).innerWidth;
		stage.setWidth(windowWidth);
		stage.setHeight(windowHeight);
		lineLayer.removeChildren();
		courseLayer.removeChildren();
		populateSidebar(classList);
		drawLines();
	}

	//Draw the yellow semester-division lines on the canvas
	function drawLines()
	{
		var lineY = windowHeight/8;
		var lineX1 = windowWidth*.22;
		if(lineX1<320){
			lineX1=320;
		}
		var lineX2 = lineX1+windowWidth*.66;
		for(var i = 1; i<=7; i++){
		    var semesterLine = new Kinetic.Line(
			{
				points: [lineX1, lineY*i, lineX2, lineY*i],
				stroke: colors[3],
				strokeWidth: 2
			});
			lineLayer.add(semesterLine);
	     }
	}
	
	function populateSidebar(classList)
	{
		var posData = [10,10,320,100]; // [x, y, width, height]
		var maxSidebarCapacity;
		posData[2] = (windowWidth/5) - 20;
		posData[3] = (windowHeight/8)-(windowHeight*0.03);
		var yIncr = posData[3]+windowHeight*0.01;
		
		if(posData[2]<320){
			posData[2]=285;
		}
		maxSidebarCapacity = Math.floor(windowHeight/(posData[3]+10));
		for(var i = 0; i<classList.length; i++){
			if(i==maxSidebarCapacity){
				break;
			}
			drawClassRect(classList[i],posData);
			posData[1]+=yIncr;
		}
	}
	
	function drawClassRect(course, posData)
	{
		x = posData[0];
		y = posData[1];
		var color = colors[2];
		
		var classGroup = new Kinetic.Group(
		{
			x: x,
			y: y,
			id: course.getProgram() + course.getName(),
			draggable: true
		});
		
		var classText = new Kinetic.Text(
		{
			fontSize: 24,
			fontFamily: 'Arial',
			text: course.getProgram() + " " + course.getName(),
			fill: 'white',
			padding: 10
		});
		
		switch(course.status)
		{
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
				break;
		}
		
		var classRect = new Kinetic.Rect(
		{
			width: posData[2],
			height: posData[3],
			fill: color
		});

		classGroup.add(classRect).add(classText);
		courseLayer.add(classGroup);
		stage.add(courseLayer);
		
		stage.find('#' + course.getProgram() + course.getName()).on('dragend', function()
		{
			snap(this);
		});
	}
	
	function snap(shape) // http://stackoverflow.com/questions/18819077/kineticjs-drag-drop-keeping-attached-boxes-and-lines-intact
	{
		if(shape.getX()>windowWidth/5){
			var newY = shape.getY()-(.5*shape.getHeight());
			var incr = (windowHeight/8);
			newY = (Math.ceil(newY/ incr) * incr)-(incr*.89);
			shape.setY(newY);
		}
	}
	
	function course(program,name,status)
	{
		this.status = status;
		this.program = program;
		this.getProgram = function(){return this.program;};
		this.name = name;
		this.getName = function(){return this.name;};
	}

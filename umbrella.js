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
	var classList = new Array();
	var slots = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]; // use timeSlot here and longer arrays
	var career = [];
	
	//Prepare the canvas
	$(document).ready(function()
	{
		createStage();
		courseLayer = new Kinetic.Layer();
		lineLayer = new Kinetic.Layer();
		
		getXML("http://localhost:8080/TomcatProject/Project/SEMajorCourses.xml", 1);
		drawLines();
		buildSemesters();
		
		stage.add(lineLayer);
		stage.add(courseLayer);
	});
	
	function buildSemesters()
	{
		var sem1 = new Semester();
		career.push(sem1);
		
		var sem2 = new Semester();
		career.push(sem2);
		
		var sem3 = new Semester();
		career.push(sem3);
		
		var sem4 = new Semester();
		career.push(sem4);
		
		var sem5 = new Semester();
		career.push(sem5);
		
		var sem6 = new Semester();
		career.push(sem6);
		
		var sem7 = new Semester();
		career.push(sem7);
		
		var sem8 = new Semester();
		career.push(sem8);
	}
	
	function createStage()
	{
		stage = new Kinetic.Stage(
		{
			container: 'foreground',
			width: windowWidth,
			height: windowHeight
		});
	}
	
	function makeClassList(courseList)
	{
		for(var i = 0; i < courseList.length; i++)
		{
			classList.push(new course(courseList[i][1], courseList[i][0], statusEnum.PASSED));
		}
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
		var lineY = windowHeight / 8;
		var lineX1 = windowWidth * .22;
		
		if(lineX1 < 320)
		{
			lineX1 = 320;
		}
		
		var lineX2 = lineX1 + windowWidth * .66;
		
		for(var i = 1; i <= 7; i++)
		{
			var semesterLine = new Kinetic.Line(
			{
				points: [lineX1, lineY * i, lineX2, lineY * i],
				stroke: colors[3],
				strokeWidth: 2
			});
			
			lineLayer.add(semesterLine);
		}
	}
	
	function populateSidebar(classList)
	{
		var posData = [10, 10, 320, 100]; // [x, y, width, height]
		var maxSidebarCapacity;
		
		posData[2] = (windowWidth / 5) - 20;
		posData[3] = (windowHeight / 8) - (windowHeight * 0.03);
		
		var yIncr = posData[3] + windowHeight * 0.01;
		
		if(posData[2] < 320)
		{
			posData[2] = 285;
		}
		
		maxSidebarCapacity = Math.floor(windowHeight / (posData[3] + 10));
		
		for(var i = 0; i < classList.length; i++)
		{
			if(i == maxSidebarCapacity)
			{
				break;
			}
			
			drawClassRect(classList[i], posData);
			
			posData[1] += yIncr;
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
		}).on('dragend', function() { snap(this); });
		
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
		
		var classText = new Kinetic.Text(
		{
			fontSize: (classRect.getWidth() + classRect.getHeight()) / 20,
			fontFamily: 'Arial',
			text: course.getName().replace(/(?!\D)(?=\d)/,' '),
			fill: 'white',
			padding: 10
		});
		
		classGroup.add(classRect).add(classText);
		courseLayer.add(classGroup);
		stage.add(courseLayer);
	}
	
	function snap(shape)
	{
		if(shape.getX() > windowWidth / 5)
		{
			var newY = shape.getY() - ( .5 * shape.getHeight());
			var incr = (windowHeight / 8);
			
			newY = (Math.ceil(newY / incr) * incr) - (incr * .89);
			shape.setY(newY);
			
			sem = Math.floor(windowHeight % newY);
			var newX = career[sem].getSize() * 320;
			shape.setX(newX);
			career[sem].addCourse(shape);
		}
	}
	
	function course(program, name, status)
	{
		this.status = status;
		this.program = program;
		this.getProgram = function(){return this.program;};
		this.name = name;
		this.getName = function(){return this.name;};
	}
	
	function Semester()
	{
		var courses = [];
		
		function addCourse(course)
		{
			courses.push(course);
		}
		
		function removeCourse(course)
		{
			var index = courses.indexOf(course);
			courses.splice(index);
		}
		
		function getSize()
		{
			return courses.length;
		}
	}
	
	function getXML(source, updateView)
	{
		var courseList = new Array();
		
		$.get(source, function(data)
		{
			var courseCode = data.getElementsByTagName("CourseCode");
			var courseName = data.getElementsByTagName("CourseName");
			var preReq = data.getElementsByTagName("PreReq");
			var coReq = data.getElementsByTagName("CoReq");
			var credits = data.getElementsByTagName("Credits");
			
			for(var i = 0; i < courseCode.length; i++)
			{
				courseList[i] = new Array();
				
				if(courseCode[i] != null && courseCode[i].firstChild != null)
					courseList[i][0] = courseCode[i].firstChild.nodeValue;
				else
					courseList[i][0] = "Course";
				
				if(courseName[i] != null && courseName[i].firstChild != null)
					courseList[i][1] = courseName[i].firstChild.nodeValue;
				else
					courseList[i][1] = "CRSE001";
				
				if(preReq[i] != null && preReq[i].firstChild != null)
					courseList[i][2] = preReq[i].firstChild.nodeValue;
				else
					courseList[i][2] = "None";
				
				if(coReq[i] != null && coReq[i].firstChild != null)
					courseList[i][3] = coReq[i].firstChild.nodeValue;
				else
					courseList[i][3] = "None";
				
				if(credits[i] != null && credits[i].firstChild != null)
					courseList[i][4] = credits[i].firstChild.nodeValue;
				else
					courseList[i][4] = "0";
			}
		},
		"xml").done(function()
					{
						makeClassList(courseList);
						
						switch(updateView) // create boxes of each course?
						{
							case 0:
								break;
							default:
								populateSidebar(classList);
								break;
						}
					});
	}

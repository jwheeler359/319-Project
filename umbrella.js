	// JavaScript Document
	// author: AJ Hinkens and Franklin Nelson
	// version 0.05
	
	//general variables
	var stage;
	var lineLayer;
	var courseLayer;
	var colors = ["rgba(0,80,106)","rgba(18,142,182,.8)","rgba(119,12,40,.8)","rgba(182,171,9,.8)","rgba(115,182,0,.8)"];//Dark Blue, Light Blue, Red, Yellow, Green
	var statusEnum = Object.freeze({'PASSED':0, 'PLANNED':1,'INPROG':2,'INCOM':3});
	var windowHeight = $(window).get(0).innerHeight;
	var windowWidth = $(window).get(0).innerWidth;
	var classList = new Array();
	var career = new Array();
	
	//Prepare the canvas
	$(document).ready(function()
	{
		createStage();
		courseLayer = new Kinetic.Layer();
		lineLayer = new Kinetic.Layer();
		
		getXML("http://localhost:8080/TomcatProject/Project/SEMajorCourses.xml", 1);
		buildSemesters(8);
		drawLines();
		
		stage.add(lineLayer);
		stage.add(courseLayer);
	});
	
	function buildSemesters(numSemesters) // builds semesters (8 normally)
	{
		for(var i = 0; i < numSemesters; i++)
		{
			career.push(new Semester());
		}
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
			classList.push(new course(courseList[i][0], courseList[i][1], courseList[i][2], statusEnum.PASSED));
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
		var classGroup = stage.find("Group");
		var scheduledClasses = new Array();
		var semester = new Array();
		
		for(var i = 0, j = 0; i < Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)); i++)
		{
			if(classGroup[i].getX() > windowWidth / 5)
			{
				scheduledClasses.push(i);
				semester.push(Math.floor((windowHeight / (windowHeight / (Math.ceil((classGroup[i].getY() - (.5 * classGroup[i].getHeight())) / (windowHeight / 8))))) - 1));
			}
		}
		
		windowHeight = $(window).get(0).innerHeight;
		windowWidth = $(window).get(0).innerWidth;
		
		stage.setWidth(windowWidth);
		stage.setHeight(windowHeight);
		
		lineLayer.removeChildren();
		
		var posData = [320, 100]; // [width, height]
		
		posData[0] = (windowWidth / 5) - 20;
		posData[1] = (windowHeight / 8) - (windowHeight * 0.03);
		
		var yIncr = posData[1] + windowHeight * 0.01;
		
		if(posData[0] < 320)
		{
			posData[0] = 285;
		}
		
		for(var i = 0; i < Math.floor(windowHeight / (posData[1] + 10)); i++)
		{
			classGroup[i].getChildren()[0].setSize(posData[0], posData[1]);
			classGroup[i].getChildren()[1].setFontSize((classGroup[i].getChildren()[0].getWidth() + classGroup[i].getChildren()[0].getHeight()) / 20);
			
			if(scheduledClasses.indexOf(i) != -1)
			{
				snap(classGroup[i], semester[j++]);
			}
			else
			{
				classGroup[i].setPosition(10, 10 + (yIncr * i));
			}
		}
		
		drawLines();
		stage.draw(); // sync display
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
		
		for(var i = 1; i < career.length; i++)
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
			id: course.getName() + '\n' + course.getProgram() + '\n' + course.getPreReqs() + '\n' + course.getStatus(),
			draggable: true
		}).on('dragstart', function() { snap(this, -2); }).on('dragend', function() { snap(this, -1); });
		
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
	
	function snap(shape, choice)
	{
		switch(choice)
		{
			default: // snap on resize, uses "choice" as the semester
				var newY = shape.getY() - (.5 * shape.getHeight());
				var incr = (windowHeight / 8);
				
				var border = windowWidth * .22;
				
				if(border < 320)
				{
					border = 320;
				}
				
				newY = ((choice+1) * incr) - (incr * .89);
				
				shape.setY(newY);
				
				var newX = (career[choice].getCourses().indexOf(shape) + 1) * border;
				shape.setX(newX);
				break;
			case -2: // negative so the semester number can't possibly run this case
			case -1:
				if(shape.getX() > windowWidth / 5)
				{
					var newY = shape.getY() - (.5 * shape.getHeight());
					var incr = (windowHeight / 8);
					
					if(newY > ((Math.ceil(newY / incr) * incr) - (windowHeight / 16))) // formula for snap to nearest semester
					{
						newY += incr - (incr * .60);
					}
					
					if(newY < 0) // keep classes inside window
					{
						newY += incr;
					}
					else if(newY > windowHeight)
					{
						newY -= incr;
					}
					
					var sem = Math.floor((windowHeight / (windowHeight / (Math.ceil(newY / incr)))) - 1); // get semester number (0-7)
					
					var border = windowWidth * .22;
					
					if(border < 320)
					{
						border = 320;
					}
					
					switch(choice)
					{
						case -2: // remove course (use with dragstart)
							if(career[sem].getCourses().indexOf(shape) != -1)
							{
								for(var i = career[sem].getCourses().indexOf(shape); i+1 < career[sem].getSize(); i++)
								{
									career[sem].getCourses()[i+1].setX((i+1) * border);
								}
								
								career[sem].removeCourse(shape);
							}
							break;
						case -1: // add course and snap to position (use with dragend)
							newY = (Math.ceil(newY / incr) * incr) - (incr * .89);
							
							shape.setY(newY);
							
							if(career[sem].getCourses().indexOf(shape) == -1)
							{
								career[sem].addCourse(shape);
							}
							
							var newX = (career[sem].getSize()) * border;
							shape.setX(newX);
							break;
					}
					stage.draw(); // this updates the position
				}
				break;
		}
	}
	
	function course(name, program, preReqs, status)
	{
		this.name = name;
		this.program = program;
		this.preReqs = preReqs;
		this.status = status;
		
		this.getName = function(){return this.name;};
		this.getProgram = function(){return this.program;};
		this.getPreReqs = function(){return this.preReqs;};
		this.getStatus = function(){return this.status;};
	}
	
	function Semester()
	{
		var courses = new Array();
		var totalCredits = new Array();
		
		this.getCourses = function(){return courses;};
		this.getSize = function(){return courses.length;};
		this.getTotalCredits = function(){return courses.length;};
	}
	
	Semester.prototype.addCourse = function(course)
	{
		this.getCourses().push(course);
	}
	
	Semester.prototype.removeCourse = function(course)
	{
		this.getCourses().splice(this.getCourses().indexOf(course), 1);
	}
	
	Semester.prototype.getCourseInfo = function(course)	// [0] = name, [1] = program, [2] = preReqs, [3] = status
	{
		return this.getCourses()[this.getCourses().indexOf(course)].getId().split(/(?!.)/); // split based on newline
	}
	
	function getXML(source, updateView)
	{
		var courseList = new Array();
		
		$.get(source, function(data)
		{
			var courseCode = data.getElementsByTagName("CourseCode");
			var courseName = data.getElementsByTagName("CourseName");
			var preReq = data.getElementsByTagName("PreReq");
			
			for(var i = 0; i < courseCode.length; i++)
			{
				courseList[i] = new Array();
				
				if(courseCode[i] != null && courseCode[i].firstChild != null)
				{
					courseList[i][0] = courseCode[i].firstChild.nodeValue;
				}
				else
				{
					courseList[i][0] = "Course";
				}
				
				if(courseName[i] != null && courseName[i].firstChild != null)
				{
					courseList[i][1] = courseName[i].firstChild.nodeValue;
				}
				else
				{
					courseList[i][1] = "CRSE001";
				}
				
				if(preReq[i] != null && preReq[i].firstChild != null)
				{
					courseList[i][2] = preReq[i].firstChild.nodeValue;
				}
				else
				{
					courseList[i][2] = "None";
				}
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

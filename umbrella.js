	// JavaScript Document
	// author: AJ Hinkens and Franklin Nelson
	// version 0.06
	
	//general variables
	var stage;
	var lineLayer;
	var courseLayer;
	var colors = ["rgba(115, 182, 0, .8)",	// Green
	              "rgba(18, 142, 182, .8)",	// Light Blue
	              "rgba(182, 171, 9, .8)",	// Yellow
	              "rgba(119, 12, 40, .8)",	// Red
	              "rgba(0, 80, 106, 1)"];	// Dark Blue
	var statusEnum = Object.freeze({'PASSED':0, 'PLANNED':1, 'INPROG':2, 'INCOM':3});
	var windowHeight = $(window).get(0).innerHeight;
	var windowWidth = $(window).get(0).innerWidth;
	var classList = new Array();
	var career = new Array();
	var currentSemester;
	
	// prepare the canvas
	$(document).ready(function()
	{
		createStage();
		courseLayer = new Kinetic.Layer();
		lineLayer = new Kinetic.Layer();
		
		//getXML("http://localhost:8080/TomcatProject/Project/Course.xml", 1); // for server use
		getXML("Course.xml", 1);
		buildSemesters(8);
		setCurrentSemester(0);
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
	
	function setCurrentSemester(semester)
	{
		currentSemester = semester;
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
			classList.push(new course(	courseList[i][0], // name
										courseList[i][1], // program
										courseList[i][2], // prerequisites
										courseList[i][3], // credits
										courseList[i][4], // description
										statusEnum.INCOM));
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
		var classGroup = stage.find(".ClassGroup"); // all the draggable classes
		var scheduledClasses = new Array(); // classes that are in semester rows
		var semester = new Array(); // array of values which courses are placed in
		
		for(var i = 0; i < classGroup.length; i++)
		{
			if(i >= Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10))) // sidebar capacity
			{
				break;
			}
			
			if(classGroup[i].getX() > windowWidth / 5) // if not in sidebar
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
		
		posData[0] = (windowWidth / 5) - 20; // width
		posData[1] = (windowHeight / 8) - (windowHeight * 0.03); // height
		
		var yIncr = posData[1] + windowHeight * 0.01; // distance between elements in sidebar
		
		if(posData[0] < 320)
		{
			posData[0] = 285;
		}
		
		for(var i = 0, j = 0; i < classGroup.length; i++)
		{
			if(i >= Math.floor(windowHeight / (posData[1] + 10)))
			{
				break;
			}
			
			classGroup[i].getChildren()[0].setSize(posData[0], posData[1]); // size of rectangle
			classGroup[i].getChildren()[1].setFontSize(classGroup[i].getChildren()[0].getHeight() / 3); // font size
			classGroup[i].getChildren()[1].setOffsetY(-(classGroup[i].getChildren()[0].getHeight() / 3)); // center text
			
			if(scheduledClasses.indexOf(i) != -1) // if on semester row
			{
				snap(classGroup[i], semester[j++]);
			}
			else // if on sidebar
			{
				classGroup[i].setPosition(10, 10 + (yIncr * i)); // snap on sidebar
			}
		}
		
		drawLines();
		stage.draw(); // sync display
	}
	
	function drawLines() // draw the yellow semester-division lines on the canvas
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
				stroke: colors[statusEnum.INPROG],
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
			if(i >= maxSidebarCapacity) // if sidebar is full
			{
				break;
			}
			
			drawClassRect(classList[i], posData);
			
			posData[1] += yIncr;
		}
	}
	
	function drawClassRect(course, posData)
	{
		var classGroup = new Kinetic.Group(
		{
			x: posData[0],
			y: posData[1],
			name: "ClassGroup", // for selection by "shape.find()"
			id: course.name + '\n' + course.program + '\n' + course.preReqs + '\n' + course.credits + '\n' + course.description, // this is used to store the information for the course
			draggable: true
		}).on('dragstart', function() { snap(this, -2); }).on('dragend', function() { snap(this, -1); }); // set drag functions
		
		var classRect = new Kinetic.Rect(
		{
			width: posData[2],
			height: posData[3],
			fill: colors[course.status] // rectangle color based on course status
		});
		
		var classText = new Kinetic.Text(
		{
			fontSize: classRect.getHeight() / 3, // adjust size based on height of rectangle
			fontFamily: 'Arial',
			text: course.name.replace(/(?!\D)(?=\d)/, ' '), // adds space between letters and numbers
			offset: [-10, -(classRect.getHeight() / 3)], // center text
			fill: 'white'
		});
		
		classGroup.add(classRect).add(classText);
		courseLayer.add(classGroup);
		stage.add(courseLayer);
	}
	
	function snap(shape, choice) // choice serves as semester number when >= 0
	{
		switch(choice)
		{
			case -2: // negative so the semester number can't possibly run this case
			case -1:
				if(shape.getX() > windowWidth / 5) // if not in sidebar
				{
					var newY = shape.getY() - (.5 * shape.getHeight());
					var incr = (windowHeight / 8);
					
					if(newY > ((Math.ceil(newY / incr) * incr) - (windowHeight / 16))) // formula for snap to nearest semester
					{
						newY += incr - (incr * .59);
					}
					
					if(newY < 0) // keep classes inside window
					{
						newY += incr;
					}
					else if(newY > windowHeight) // ditto
					{
						newY -= incr;
					}
					
					var sem = Math.floor((windowHeight / (windowHeight / (Math.ceil(newY / incr)))) - 1); // get semester number (0-7)
					
					var border = windowWidth * .22; // sidebar width
					
					if(border < 320)
					{
						border = 320;
					}
					
					switch(choice)
					{
						case -2: // remove course (use with dragstart)
							if(career[sem].getCourses().indexOf(shape) != -1)
							{
								for(var i = career[sem].getCourses().indexOf(shape); i+1 < career[sem].getCourses().length; i++)
								{
									career[sem].getCourses()[i+1].setX((i+1) * border); // shift courses in front of removed one back
								}
								
								career[sem].removeCourse(shape); // GET RID OF THIS COURSE
							}
							break;
						case -1: // add course and snap to position (use with dragend)
							newY = (Math.ceil(newY / incr) * incr) - (incr * .89);
							
							shape.setY(newY);
							
							if(career[sem].getCourses().indexOf(shape) == -1)
							{
								career[sem].addCourse(shape);
								
								if(sem == currentSemester) // if the semester is the current one
								{
									shape.getChildren()[0].setFill(colors[statusEnum.INPROG]);
								}
								else // if the semester is not the current one
								{
									shape.getChildren()[0].setFill(colors[statusEnum.PLANNED]);
								}
							}
							var newX = (career[sem].getCourses().length) * border;
							shape.setX(newX);
							break;
					}
				}
				
				else
				{
					switch(choice) // snaps to sidebar if placed over it
					{
						case -1:
							shape.setPosition(10, 10 + ((((windowHeight / 8) - (windowHeight * 0.03)) + (windowHeight * 0.01)) * (stage.find(".ClassGroup").indexOf(shape))));
							shape.getChildren()[0].setFill(colors[statusEnum.INCOM]);
							break;
					}
				}
				
				stage.draw() // this updates the position
				break;
			default: // snap on resize, uses "choice" as the semester
				var border = windowWidth * .22; // sidebar width
				
				if(border < 320)
				{
					border = 320;
				}
				
				shape.setPosition((career[choice].getCourses().indexOf(shape) + 1) * border, ((choice + 1) * (windowHeight / 8)) - ((windowHeight / 8) * .89))
				break;
		}
	}
	
	function course(name, program, preReqs, credits, description, status)
	{
		this.name = name;
		this.program = program;
		this.preReqs = preReqs;
		this.credits = credits;
		this.description = description;
		this.status = status;
	}
	
	function Semester()
	{
		var courses = new Array();
		var credits = 0;
		
		this.getCourses = function(){return courses;}; // courses in this semester
		this.getCredits = function(){return credits;}; // credits of every course in semester combined
		this.setCredits = function(value){credits = value;}; // set credits
	}
	
	Semester.prototype.addCourse = function(course)
	{
		this.getCourses().push(course);
		
		if(isFinite(course.getId().split(/(?!.)/)[3])) // exclude courses that are required "R"
		{
			this.setCredits(this.getCredits() + parseFloat(course.getId().split(/(?!.)/)[3]));
		}
	}
	
	Semester.prototype.removeCourse = function(course)
	{
		this.getCourses().splice(this.getCourses().indexOf(course), 1);
		
		if(isFinite(course.getId().split(/(?!.)/)[3])) // exclude courses that are required "R"
		{
			this.setCredits(this.getCredits() - parseFloat(course.getId().split(/(?!.)/)[3]));
		}
	}
	
	Semester.prototype.getCourseInfo = function(course) // [0] = name, [1] = program, [2] = preReqs, [3] = credits, [4] = description
	{
		return this.getCourses()[this.getCourses().indexOf(course)].getId().split(/(?!.)/); // split based on newline
	}
	
	function getXML(source, updateView)
	{
		var courseList = new Array(); // array of data
		
		$.get(source, function(data)
		{
			var code = data.getElementsByTagName("Code"); // name
			var courseName = data.getElementsByTagName("CourseName"); // program
			var preReq = data.getElementsByTagName("PreReq"); // preReq
			var credits = data.getElementsByTagName("Credits"); // credits
			var description = data.getElementsByTagName("Description"); // description
			
			for(var i = 0; i < code.length; i++)
			{
				courseList[i] = new Array(); // array of data #2
				
				if(code[i] != null && code[i].firstChild != null) // if there is a value
				{
					courseList[i][0] = code[i].firstChild.nodeValue;
				}
				else // default
				{
					courseList[i][0] = "Course";
				}
				
				if(courseName[i] != null && courseName[i].firstChild != null) // if there is a value
				{
					courseList[i][1] = courseName[i].firstChild.nodeValue;
				}
				else // default
				{
					courseList[i][1] = "CRSE001";
				}
				
				if(preReq[i] != null && preReq[i].firstChild != null) // if there is a value
				{
					courseList[i][2] = preReq[i].firstChild.nodeValue;
				}
				else // default
				{
					courseList[i][2] = "None";
				}
				
				if(credits[i] != null && credits[i].firstChild != null) // if there is a value
				{
					courseList[i][3] = credits[i].firstChild.nodeValue;
				}
				else // default
				{
					courseList[i][3] = '0';
				}
				
				if(description[i] != null && description[i].firstChild != null) // if there is a value
				{
					courseList[i][4] = description[i].firstChild.nodeValue;
				}
				else // default
				{
					courseList[i][4] = '';
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

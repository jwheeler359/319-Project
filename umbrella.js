	// JavaScript Document
	// author: AJ Hinkens and Franklin Nelson
	// version 0.08
	
	//general variables
	var stage;
	var lineLayer;
	var courseLayer;
	var minorSelected = false;
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
		createStage(); // build stage for KineticJS elements
		courseLayer = new Kinetic.Layer();
		lineLayer = new Kinetic.Layer();
		
		//getXML("http://localhost:8080/TomcatProject/Project/SECore.xml", 1); // for server use
		//getXML("SECore.xml", 1);
		
		buildSemesters(8); // create semesters
		setCurrentSemester(0); // change current semester
		drawLines(); // draw semester lines
		
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
			container: 'middleground',
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
										courseList[i][5], // type
										statusEnum.INCOM));
		}
	}
	
	$(window).resize(updateSize);
	
	function updateSize()
	{
		/////////////
		// Classes //
		/////////////
		var scheduledClasses = new Array(); // classes that are in semester rows
		var semester = new Array(); // array of values which courses are placed in
		
		if(minorSelected == true)
		{
			var classGroup = stage.find(".MinorClassGroup");
		}
		else
		{
			var classGroup = stage.find(".MajorClassGroup");
		}
		
		for(var i = 0; i < classGroup.length; i++)
		{
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
		
		var posData = [305, 100]; // [width, height]
		
		posData[0] = (windowWidth / 5) - 35; // width
		posData[1] = (windowHeight / 8) - (windowHeight * 0.03); // height
		
		var yIncr = posData[1] + windowHeight * 0.01; // distance between elements in sidebar
		
		if(posData[0] < 305)
		{
			posData[0] = 270;
		}
		
		var visibleClassHeight = Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) * yIncr;
		var totalClassHeight = classGroup.length * yIncr;
		for(var i = 0, j = 0; i < classGroup.length; i++)
		{
			classGroup[i].getChildren()[0].setSize(posData[0], posData[1]); // size of rectangle
			classGroup[i].getChildren()[1].setFontSize(classGroup[i].getChildren()[0].getHeight() / 3); // font size
			classGroup[i].getChildren()[1].setOffsetY(-(classGroup[i].getChildren()[0].getHeight() / 3)); // center text
			classGroup[i].setClip([0, posData[1], posData[0], 0]);
			
			if(scheduledClasses.indexOf(i) != -1) // if on semester row
			{
				snap(classGroup[i], semester[j++]);
			}
			else // if on sidebar
			{
				classGroup[i].setPosition(25, -(((((stage.find(".ScrollBarGroup")[0].getChildren()[1].getY() + (totalClassHeight / visibleClassHeight)) * Math.floor(totalClassHeight / visibleClassHeight)) - 35))) + (yIncr * i)); // snap on sidebar
			}
			
			if(classGroup[i].getX() <= windowWidth / 5)
			{
				// cuts off classes that go too high
				if(classGroup[i].getY() < 10) // highest visible element
				{
					if(classGroup[i].getY() < (10 - classGroup[i].getChildren()[0].getHeight()))
					{
						classGroup[i].hide();
					}
					else
					{
						classGroup[i].show();
						classGroup[i].setClipY(classGroup[i].getChildren()[0].getHeight());
						classGroup[i].setClipHeight(-(classGroup[i].getChildren()[0].getHeight() - Math.abs(10 - classGroup[i].getY())));
					}
				}
				
				// cuts off classes that go too low, if they exist
				if(classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)] != null)
				{
					if(classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].getY() < (windowHeight * .946428571)) // lowest visible element
					{
						if(classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].getY() > ((windowHeight * .946428571) + classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].getChildren()[0].getHeight()))
						{
							classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].hide();
						}
						else
						{
							classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].show();
							classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].setClipY(0);
							classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].setClipHeight(Math.abs(classGroup[i + (Math.floor(windowHeight / (posData[1] + 10)) - 1)].getY() - (windowHeight * .946428571)));
						}
					}
				}
				
				if(classGroup[i].getY() >= 10 && classGroup[i].getY() <= ((windowHeight * .946428571) - classGroup[i].getChildren()[0].getHeight()))
				{
					classGroup[i].show();
					classGroup[i].setClipHeight(0);
				}
				else if(classGroup[i].getY() < (10 - classGroup[i].getChildren()[0].getHeight()) || classGroup[i].getY() > ((windowHeight * .946428571) + classGroup[i].getChildren()[0].getHeight()))
				{
					classGroup[i].hide();
				}
			}
		}
		
		//////////////////
		// Progress Bar //
		//////////////////
		var barData = [0, 0, 0, 0, 0]; // # of boxes of each color (+5th one in case of break)
		
		for(var i = 0; i < classGroup.length; i++)
		{
			barData[colors.indexOf(classGroup[i].getChildren()[0].getFill())]++; // index of the color that the rect currently is
		}
		
		for(var i = 0, j = 0; i < barData.length - 1; i++)
		{
			stage.find(".ProgressBarGroup")[0].getChildren()[i].setSize((windowWidth / 64), ((windowHeight - 35) * barData[i]) / classGroup.length);
			stage.find(".ProgressBarGroup")[0].getChildren()[i].setY(j);
			
			j += stage.find(".ProgressBarGroup")[0].getChildren()[i].getHeight();
		}
		
		stage.find(".ProgressBarGroup")[0].setX(windowWidth - 40);
		
		////////////////
		// Scroll Bar //
		////////////////
		var maximumCapacity = classGroup.length - (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)));
		
		if(maximumCapacity < 1)
		{
			maximumCapacity = 1;
		}
		
		var sliderLocation = (stage.find(".ScrollBarGroup")[0].getChildren()[1].getY()) / (stage.find(".ScrollBarGroup")[0].getChildren()[0].getHeight() - stage.find(".ScrollBarGroup")[0].getChildren()[1].getHeight());
		
		stage.find(".ScrollBarGroup")[0].getChildren()[0].setHeight(windowHeight - 40); // background of scroll bar
		stage.find(".ScrollBarGroup")[0].getChildren()[1].setHeight(Math.abs(stage.find(".ScrollBarGroup")[0].getChildren()[0].getHeight() / maximumCapacity)); // the scroll bar slider
		stage.find(".ScrollBarGroup")[0].getChildren()[1].setY((stage.find(".ScrollBarGroup")[0].getChildren()[0].getHeight() - stage.find(".ScrollBarGroup")[0].getChildren()[1].getHeight()) * sliderLocation); // set slider to equivalent positon when resized
		
		///////////
		// Lines //
		///////////
		lineLayer.removeChildren();
		drawLines();
		
		/////////////////
		// Update View //
		/////////////////
		stage.draw();
	}
	
	function resizeSemester(semesterNum) // resizes all tiles in a semester NEEDS WORK
	{
		var courses = career[semseterNum].getCourses(); //gets an array of all the course tiles within a semester
		for(var i = 0; i < courses.length; i++)
		{
			//snap(courses[i], -2);
			//snap(courses[i], -1);
		}
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
		var posData = [25, 10, 310, 100]; // [x, y, width, height]
		var maxSidebarCapacity;
		
		posData[2] = (windowWidth / 5) - 35;
		posData[3] = (windowHeight / 8) - (windowHeight * 0.03);
		
		var yIncr = posData[3] + windowHeight * 0.01;
		
		if(posData[2] < 305)
		{
			posData[2] = 270;
		}
		
		maxSidebarCapacity = Math.floor(windowHeight / (posData[3] + 10));
		
		for(var i = 0; i < classList.length; i++)
		{
			if(i >= maxSidebarCapacity)
			{
				drawClassRect(classList[i], posData, false);
			}
			else
			{
				drawClassRect(classList[i], posData, true);
			}
			
			posData[1] += yIncr;
		}
	}
	
	function drawClassRect(course, posData, visible)
	{
		if(minorSelected == true)
		{
			var classGroup = new Kinetic.Group(
			{
				x: posData[0],
				y: posData[1],
				clip: [0, posData[3], posData[2], 0],
				visible: visible,
				name: "MinorClassGroup", // for selection by "shape.find()"
				id: course.name + '\n' + course.program + '\n' + course.preReqs + '\n' + course.credits + '\n' + course.description + '\n' + course.type, // this is used to store the information for the course
				draggable: true
			})
			.on('dragstart', function() // removes class when picked up
			{
				this.setClipHeight(0);
				snap(this, -2);
			})
			.on('dragend', function() // adds class if placed on semester bar, snaps regardless
			{
				snap(this, -1);
			});
		}
		else
		{
			var classGroup = new Kinetic.Group(
			{
				x: posData[0],
				y: posData[1],
				clip: [0, posData[3], posData[2], 0],
				visible: visible,
				name: "MajorClassGroup", // for selection by "shape.find()"
				id: course.name + '\n' + course.program + '\n' + course.preReqs + '\n' + course.credits + '\n' + course.description + '\n' + course.type, // this is used to store the information for the course
				draggable: true
			})
			.on('dragstart', function() // removes class when picked up
			{
				this.setClipHeight(0);
				snap(this, -2);
			})
			.on('dragend', function() // adds class if placed on semester bar, snaps regardless
			{
				snap(this, -1);
			});
		}
		
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
		
		classRect.on('dblclick', function(){
			var descript = classGroup.getId().split('\n');
			var description = "Course Code: "+descript[0]+"\n"+"Course Name: "+descript[1]+'\n'+ "Prerequisite: "+ descript[2]+'\n'+"Credits: "+ descript[3]+'\n'+ "Description: "+ descript[4];
			alert(description);
			});
		classGroup.add(classRect).add(classText);
		courseLayer.add(classGroup);
		stage.add(courseLayer);
	}
	
function drawProgressBar(update)
	{
		if(minorSelected == true)
		{
			var classGroup = stage.find(".MinorClassGroup");
		}
		else
		{
			var classGroup = stage.find(".MajorClassGroup");
		}
		var barData = [0, 0, 0, 0, 0]; // # of boxes of each color (+5th one in case of break)
		
		for(var i = 0; i < classGroup.length; i++)
		{
			barData[colors.indexOf(classGroup[i].getChildren()[0].getFill())]++; // index of the color that the rect currently is
		}
		
		posData = windowHeight - 35;
		
		switch(update)
		{
			case 0: // first creation
				var barGroup = new Kinetic.Group(
				{
					x: windowWidth - 40,
					y: 20,
					name: "ProgressBarGroup",
				});
				
				for(var i = 0, j = 0; i < barData.length - 1; i++)
				{
					var barRect = new Kinetic.Rect(
					{
						y: j,
						width: (windowWidth / 64),
						height: (posData * barData[i]) / classGroup.length, // number of classes with this status
						fill: colors[i]
					});
					
					j += barRect.getHeight(); // shifts next rect to right of previous one //not any more
					barGroup.add(barRect);
				}
				
				courseLayer.add(barGroup);
				stage.add(courseLayer);
				break;
			default: // update
				for(var i = 0, j = 0; i < barData.length - 1; i++)
				{
					stage.find(".ProgressBarGroup")[0].getChildren()[i].setSize((windowWidth / 64), (posData * barData[i]) / classGroup.length);
					stage.find(".ProgressBarGroup")[0].getChildren()[i].setY(j);
					
					j += stage.find(".ProgressBarGroup")[0].getChildren()[i].getHeight();
				}
				
				stage.find(".ProgressBarGroup")[0].setX(windowWidth - 40);
				break;
		}
	}
	
	function drawScrollBar()
	{
		if(minorSelected == true)
		{
			var classGroup = stage.find(".MinorClassGroup");
		}
		else
		{
			var classGroup = stage.find(".MajorClassGroup");
		}
		
		var scrollBarGroup = new Kinetic.Group(
		{
			x: 5,
			y: 120,
			name: "ScrollBarGroup"
		});
		
		var scrollBarArea = new Kinetic.Rect(
		{
			width: 15,
			height: windowHeight-140,
			fill: 'black',
			opacity: 0.3
		});
		
		var maximumCapacity = classGroup.length - Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10));
		
		if(maximumCapacity < 1)
		{
			maximumCapacity = 1;
		}
		
		var scrollBar = new Kinetic.Rect(
		{
			width: 15,
			height: Math.abs(scrollBarArea.getHeight() / maximumCapacity),
			fill: colors[2],
			draggable: true,
			dragBoundFunc: function(pos)
			{
				var newY = pos.y;
				
				if(newY < 10)
				{
					newY = 10;
				}
				else if(newY > scrollBarArea.getHeight() - this.getHeight() + 10)
				{
					newY = scrollBarArea.getHeight() - this.getHeight() + 10;
				}
				
				return {x: this.getAbsolutePosition().x, y: newY};
			},
			opacity: 0.9,
		})
		.on('dragmove', function()
						{
							var classHeight = ((windowHeight / 8) - (windowHeight * 0.03)) + (windowHeight * 0.01);
							var visibleClassHeight = (windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) * classHeight;
							var totalClassHeight = classGroup.length * classHeight;
							
							for(var i = 0; i < classGroup.length; i++)
							{
								if(classGroup[i].getX() <= windowWidth / 5)
								{
									classGroup[i].setPosition(25, -(((((this.getPosition().y + (totalClassHeight / visibleClassHeight)) * (totalClassHeight / visibleClassHeight)) - 35))) + (classHeight * i));
									
									// cuts off classes that go too high
									if(classGroup[i].getY() < 10) // highest visible element
									{
										if(classGroup[i].getY() < (10 - classGroup[i].getChildren()[0].getHeight()))
										{
											classGroup[i].hide();
										}
										else
										{
											classGroup[i].show();
											classGroup[i].setClipY(classGroup[i].getChildren()[0].getHeight());
											classGroup[i].setClipHeight(-(classGroup[i].getChildren()[0].getHeight() - Math.abs(10 - classGroup[i].getY())));
										}
									}
									
									// cuts off classes that go too low, if they exist
									if(classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)] != null)
									{
										if(classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].getY() < (windowHeight * .946428571)) // lowest visible element
										{
											if(classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].getY() > ((windowHeight * .946428571) + classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].getChildren()[0].getHeight()))
											{
												classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].hide();
											}
											else
											{
												classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].show();
												classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].setClipY(0);
												classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].setClipHeight(Math.abs(classGroup[i + (Math.floor(windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) - 1)].getY() - (windowHeight * .946428571)));
											}
										}
									}
									
									if(classGroup[i].getY() >= 10 && classGroup[i].getY() <= ((windowHeight * .946428571) - classGroup[i].getChildren()[0].getHeight()))
									{
										classGroup[i].show();
										classGroup[i].setClipHeight(0);
									}
									else if(classGroup[i].getY() < (10 - classGroup[i].getChildren()[0].getHeight()) || classGroup[i].getY() > ((windowHeight * .946428571) + classGroup[i].getChildren()[0].getHeight()))
									{
										classGroup[i].hide();
									}
								}
							}
						}); // shifts classes in sidebar based on y position
		
		scrollBarGroup.add(scrollBarArea).add(scrollBar);
		courseLayer.add(scrollBarGroup);
		stage.add(courseLayer);
	}
	
	function snap(shape, choice) // choice serves as semester number when >= 0
	{
		if(minorSelected == true)
		{
			var classGroup = stage.find(".MinorClassGroup");
		}
		else
		{
			var classGroup = stage.find(".MajorClassGroup");
		}
		
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
						newY += incr - (incr * .60);
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
								drawProgressBar(1);
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
							//change shape width to fit screen, etc.
							var shapeWidth = ((windowWidth * .6) / 4);
							if(career[sem].getCourses().length > 4)
							{
								shapeWidth = (windowWidth * .6) / career[sem].getCourses().length;
							}
							for(var i = 0; i < shape.getChildren().length; i++)
							{
								shape.getChildren()[i].setWidth(shapeWidth);
							}
							currentShapeWidth = shape.getChildren()[0].getWidth();
							//alert("shape.getWidth() = " + currentShapeWidth);
							var separationDistance = currentShapeWidth + currentShapeWidth * 0.13;
							
							var newX = border + separationDistance * (career[sem].getCourses().length - 1);
							shape.setX(newX);
							drawProgressBar(1);
							break;
					}
				}
				
				else
				{
					switch(choice) // snaps to sidebar if placed over it
					{
						case -1:
							var classHeight = ((windowHeight / 8) - (windowHeight * 0.03)) + (windowHeight * 0.01);
							var visibleClassHeight = (windowHeight / (((windowHeight / 8) - (windowHeight * 0.03)) + 10)) * classHeight;
							var totalClassHeight = classGroup.length * classHeight;
							
							shape.setPosition(25, -(((((stage.find(".ScrollBarGroup")[0].getChildren()[1].getY() + (totalClassHeight / visibleClassHeight)) * (totalClassHeight / visibleClassHeight)) - 35))) + (classHeight * classGroup.indexOf(shape)));
							shape.getChildren()[0].setFill(colors[statusEnum.INCOM]);
							
							// cuts off classes that go too high
							if(shape.getY() < 10) // highest visible element
							{
								if(shape.getY() < (10 - shape.getChildren()[0].getHeight()))
								{
									shape.hide();
								}
								else
								{
									shape.show();
									shape.setClipY(shape.getChildren()[0].getHeight());
									shape.setClipHeight(-(shape.getChildren()[0].getHeight() - Math.abs(10 - shape.getY())));
								}
							}
							
							// cuts off classes that go too low, if they exist
							else if(shape.getY() < (windowHeight * .946428571)) // lowest visible element
							{
								if(shape.getY() > ((windowHeight * .946428571) + shape.getChildren()[0].getHeight()))
								{
									shape.hide();
								}
								else
								{
									shape.show();
									shape.setClipY(0);
									shape.setClipHeight(Math.abs(shape.getY() - (windowHeight * .946428571)));
								}
							}
							
							if(shape.getY() >= 10 && shape.getY() <= ((windowHeight * .946428571) - shape.getChildren()[0].getHeight()))
							{
								shape.show();
								shape.setClipHeight(0);
							}
							else if(shape.getY() < (10 - shape.getChildren()[0].getHeight()) || shape.getY() > ((windowHeight * .946428571) + shape.getChildren()[0].getHeight()))
							{
								shape.hide();
							}
							
							drawProgressBar(1);
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
	
	function course(name, program, preReqs, credits, description, type, status)
	{
		this.name = name;
		this.program = program;
		this.preReqs = preReqs;
		this.credits = credits;
		this.description = description;
		this.type = type;
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
	
	Semester.prototype.getCourseInfo = function(course) // [0] = name, [1] = program, [2] = preReqs, [3] = credits, [4] = description, [5] = type
	{
		return this.getCourses()[this.getCourses().indexOf(course)].getId().split(/(?!.)/); // split based on newline
	}
	
	function getXML(source, updateView, type, selected)
	{
		var courseList = new Array(); // array of data
		
		viewClasses(type);
		
		/*if(minorSelected==true && type=='minor'){
			courseLayer.destroy();
			courseLayer = new Kinetic.Layer();
			drawScrollBar();
			stage.add(courseLayer);
		}
		if(majorSelected==true && type=='major')
		{
			courseLayer.destroy();
			courseLayer = new Kinetic.Layer();
			drawScrollBar();
			stage.add(courseLayer);
		}*/
		
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
				
				courseList[i][5] = type;
			}
			
			switch(type)
			{
				case 0:
					minorSelected = false;
					break;
				case 1:
					minorSelected = true;
					break;
			}
			viewClasses(type);
		},
		"xml").done(function()
					{
						makeClassList(courseList);
						
						switch(updateView) // create boxes of each course?
						{
							case 0:
								break;
							default:
								if((minorSelected == true && stage.find(".MinorClassGroup")[0] == null) || (minorSelected == false && stage.find(".MajorClassGroup")[0] == null))
								{
									populateSidebar(classList); // fill sidebar
								}
								else // placeholder for refreshing classes
								{
									
								}
								
								if(stage.find(".ProgressBarGroup")[0] == null)
								{
									drawProgressBar(0); // draw progress bar
								}
								else
								{
									drawProgressBar(1); // update progress bar
								}
								
								if(stage.find(".ScrollBarGroup")[0] == null)
								{
									drawScrollBar(); // drag scroll bar on left end of sidebar
								}
								else // placeholder for updating scroll bar size
								{
									
								}
								
								break;
						}
					});
	}
	
	function viewClasses(focus)	// 0 = Major
	{							// 1 = Minor
		if(minorSelected == true)
		{
			var classGroup = stage.find(".MinorClassGroup");
		}
		else
		{
			var classGroup = stage.find(".MajorClassGroup");
		}
		
		for(var i = 0; i < classGroup.length; i++)
		{
			var descript = classGroup[i].getId().split(/(?!.)/)[5];
			
			if(classGroup[i].getX() <= windowWidth / 5 && descript != focus)
			{
				classGroup[i].setVisible(false);
			}
			else
			{
				classGroup[i].setVisible(true);
			}
		}
		
		stage.draw();
	}

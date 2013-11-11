	var stage = new Kinetic.Stage
	({
		container: canvas
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
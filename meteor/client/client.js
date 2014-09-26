Template.sensors.values = function() {
	return Sensors.find({name: {$ne: ""}}, {sort:{name:1}});
}

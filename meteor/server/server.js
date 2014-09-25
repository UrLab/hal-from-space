Meteor.methods({
	update : function() {
		console.log("In update function");
		// Read from file private/toread
		var sensor_value = Assets.getText("toread");
		console.log(sensor_value);
		// If Sensor({name:"toread"}) already exists, update it, otherwise create it
		console.log(Sensors.upsert({name:"toread"}, {$set: {value:sensor_value}}));
	}
});
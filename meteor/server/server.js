Meteor.methods({
	update : function() {
		console.log("In update function");
		// Read from file private/toread
		// If Sensor({name:"toread"}) already exists, update it, otherwise create it
	}
});
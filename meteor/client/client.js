Template.sensors.values = function() {
	return Sensors.find({});
}

Template.updateButton.events = {
	'click #update' : function(event) {
		Meteor.call("update");
	}
}
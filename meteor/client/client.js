Template.sensors.values = function() {
	return Sensors.find({name: {$ne: ""}}, {sort:{name:1}});
}

Template.updateButton.events = {
	'click #update' : function(event) {
		Meteor.call("update");
	}
}
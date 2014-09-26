hal-from-space
==============

Meteor.js interface for controlling HAL

# Installing Meteor & dependencies

	$ curl https://install.meteor.com | /bin/sh

MongoDB and pyMongo have to be installed.

# Running server on localhost

	$ cd meteor/
	$ meteor

The server will run on http://localhost:3000

# How it works on 131

When HAL is launched, we need to : 

* start the meteor server
* retreive the port on which the db runs (hal-from-space/meteor/.meteor/local/db/METEOR_PORT)
* start a python script which checks if the db is up-to-date with the driver values
* start a python script which reads on the HAL socket of changes and writes those changes to the db in real-time

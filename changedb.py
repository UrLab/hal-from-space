#!/usr/bin/python

import pymongo
from random import seed, randint
from datetime import datetime

seed(datetime.now())
randval = randint(0, 1000)

m = pymongo.MongoClient('localhost', 3001)
db = m.meteor

if (db.sensors.count()):
	db.sensors.update({'name':"toread"}, {'$set':{'value':randval}})
else:
	db.sensors.insert({'name':"toread", 'value':randval})
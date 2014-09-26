#!/usr/bin/python

import pymongo
from random import seed, randint
from datetime import datetime

seed(datetime.now())
randval = randint(0, 1000)

m = pymongo.MongoClient('localhost', 3001)
db = m.meteor


db.sensors.update({'name':"toread"}, {'$set':{'value':randval}})
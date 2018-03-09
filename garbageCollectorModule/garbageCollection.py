#!/usr/bin/python

####
# This module searches through a collection of database entries
# for entries whose creation date is older than 6 months 
# and has at least one entry.
####
import pprint
import sys
import pymongo
import datetime
import time
import calendar
from bson.json_util import loads, dumps
#Mongo Database
from pymongo import MongoClient
from datetime import date
from dateutil.relativedelta import relativedelta

#Import Configuration from Config File
import config

#Open Log File
logFile = open("/home/ubuntu/garbageCollector/log.txt", "a")
#Log datetime
logFile.write(datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S\n"))

#connect to database
MONGO_CLIENT_URL = "mongodb://{}:{}@{}:{}/{}".format(config.DB_USER, config.DB_USER_PW, config.DB_HOST, config.DB_PORT, config.DB)

try:
    dbclient = MongoClient(MONGO_CLIENT_URL)
    db = getattr(dbclient, config.DB)
    collection = db.whatsThatWeirdThing
 
except:
    print("Failure opening database. Is Mongo running? Correct password?")
    sys.exit(1)

# Get 6 months prior to today's date
d = datetime.date.today() + relativedelta(months=-6)
# Get dateTime object
dateAndTime = datetime.datetime(year=d.year, month=d.month, day=d.day)
# Split datetime object into tuples
dateTimeTuples = datetime.datetime.timetuple(dateAndTime)
# Get epoch seconds from tuples
epoch_seconds = calendar.timegm(dateTimeTuples);
# Get epoch milliseconds from seconds
epoch_milli = epoch_seconds*1000;

# 
# Get posts with no responses and whose creation date < epoch_milli
search_criteria = { 
    "$and": [
        {"responses": []}, 
        {"creation_date": {"$lt": epoch_milli}}
]}

#Log documents to be deleted
to_be_deleted = collection.find(search_criteria) 
for doc in to_be_deleted:
    with open('log.json', 'a') as fp:
        thing = dumps(doc)
        logFile.write(thing + "\n")

#Delete documents
result = collection.delete_many(search_criteria)

#Close Log File
logFile.write("Num Documents Deleted: %i\n" % result.deleted_count)
logFile.close()

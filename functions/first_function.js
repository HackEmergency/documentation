# count the number of tweets
db.getCollection('tweets').count({})     # 30678

# find entries with a particular value
db.getCollection('tweets').count({id: 605648211793944576})  # find the IDs equal to blah

# count the number (%) of tweets with geo-coded info
100 * (1 - ( db.getCollection('tweets').count({coordinates: null}) / db.getCollection('tweets').count({})))  # 17%

# can we use aggregate to find out multiple tweets from same user?
# attempt 1
db.tweets.aggregate([
                     { $group: { _id: "$id", total: { $sum: 1} } },
                     { $sort: { total: -1 } }
                   ])  # 30678 entries....single tweets from each user? I think we are using id in main document rather 
                   than sub-document... http://docs.mongodb.org/manual/core/data-model-design/
# attempt 2 (worked)
db.tweets.aggregate([
                     { $group: { _id: "$user.id", total: { $sum: 1} } },
                     { $sort: { total: -1 } }
                   ]) # 3677 entries, much better. note need to use $user.id to refer to something in the sub document
                   # top entry tweets 687 times.
                   
# aggregate only geo_enabled tweets (doesn't work currently)
db.tweets.aggregate([
                     { $match : { user.geo_enabled : true } },
                     { $group : { _id: "$user.id", total: { $sum: 1} } },
                     { $sort : { total: -1 } }
                   ])
# this one doesn't work either
db.tweets.aggregate([
                     { $project : { geo_e: {$ifNull: ["$coordinates",1] } } },  # creates a field "geo_e" 1 if null
                     { $group : { _id: "$user.id", total: { $sum: "$geo_e" } } },
                     { $match : { total : { $gte: 1} } },
                     { $sort : { total: -1 } }
                   ])
                   
# working with polygons
# this doesn't seem to work https://blog.codecentric.de/en/2013/03/mongodb-geospatial-indexing-search-geojson-point-linestring-polygon/
# seems like we need to load in geoJSON
# the query whether points are in which polygon



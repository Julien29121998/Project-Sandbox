const monk=require('monk')
const connectionString2='localhost:27017/mevn'
const connectionString=process.env.MONGODB_URI || 'localhost/mevnStack'
const db=monk(connectionString2)

module.exports=db

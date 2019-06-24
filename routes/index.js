var express = require('express');
var request= require('request');
var router = express.Router();
var db_url='';
if (process.env.DATABASE_USER && process.env.DATABASE_PASSWORD) {
  db_url='mongodb://'+process.env.DATABASE_USER+':'+process.env.DATABASE_PASSWORD+'@'+process.env.MONGODB_SVC+':'+process.env.MONGODB_SERVICE_PORT+'/';
} else {

  db_url='mongodb://'+process.env.MONGODB_SVC+':'+process.env.MONGODB_SERVICE_PORT+'/';
}
console.log(db_url);
//var db_user=process.env.DB_USER;
//var db_password=process.env.DB_PASSWORD;
//var mongodb=require('mongodb');
const client_type=process.env.CLIENT_TYPE;
const MongoClient = require('mongodb').MongoClient;
const masterURL=process.env.MASTERURL;
/* GET home page. */
router.get('/', function(req, res, next) {

  console.log(db_url);
  if (client_type=='master') {
        console.log("************Primary site");
        // try to initialize the db on every request if it's not already
        // initialized.
        // Use connect method to connect to the server
        MongoClient.connect(db_url, function(err, client) {
          if (!err)
          console.log("Connected successfully to server");

          const  db = client.db('countDB');
          if (db) {
                const col= db.collection('counts');
                col.count({}, function(error, numOfDocs) {
                        console.log('I have '+numOfDocs+' documents in my collection');
                        //
                        if (numOfDocs==0) {
                          col.insertOne({id: 1, count: 0, timestamp: Date.now()}, function(err, r) {
                                if (err)
                                 console.log(err.message);
                                console.log('inserted '+r.insertedCount);
                                client.close();
                          })
                        } else {

                               col.findOneAndUpdate({id: 1}, {$inc: {count: 1}}, {
                                returnOriginal: false
                                //, sort: [[a,1]]
                                , upsert: true
                                }, function(err, r) {
                                        console.log('updated '+Object.keys(r.value));
                                        res.render('index.html', { pageCountMessage : r.value.count});
                                        client.close();
                                });

                        }
                });//count

          } //if db

        }); //MongoClient


  } else {
console.log("*****************************secondary site");
var options = {uri: masterURL+'/update'};
request( options, function (error, response, body) {
  console.error('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
  res.render('index.html', { pageCountMessage : JSON.parse(body).count+''});
  //req.url("/update");
  //next();
});

 
  } //client type
}) // router.get;


router.get('/update', function(req, res, next) {
        MongoClient.connect(db_url, function(err, client) {
          if (!err)
          console.log("Connected successfully to server");

          const  db = client.db('countDB');
          if (db) {
                const col= db.collection('counts');
                col.count({}, function(error, numOfDocs) {
                        console.log('I have '+numOfDocs+' documents in my collection');
                               col.findOneAndUpdate({id: 1}, {$inc: {count: 1}}, {
                                returnOriginal: false
                                //, sort: [[a,1]]
                                , upsert: true
                                }, function(err, r) {
                                        console.log('updated '+Object.keys(r.value));
                                        //res.render('index.html', { pageCountMessage : r.value.count});
					res.json({count: r.value.count});

                                        client.close();
                                });
                });//count

          } //if db

        }); //MongoClient
})

router.get('/getCount', function(req, res, next) {
	console.log('get Count' );
	MongoClient.connect(db_url, function(err, client) {
          if (!err)
          console.log("Connected successfully to server");
	    const  db = client.db('countDB');
     		if (db) {
                	const col= db.collection('counts');
                	col.find({id:1}).limit(1).toArray(function(err, docs) {
                        	console.log(docs);
				//res.render('index.html', { pageCountMessage : docs[0].count});
                                res.json({count: docs[0].count});
                        	client.close();
                	});
     		}//if db
	 
	});

});

router.get('/getSite', function(req, res, next) {
console.log('get site info '+process.env.SITE);
res.status(200).send(process.env.SITE);
});


router.get('/'+process.env.SITE, function(req, res, next) {
res.sendfile('views/index-'+process.env.SITE+'.html');
});

router.get('/rest/hello/:name', function(req, res, next) {
  //res.send('{"response": "hello "+req.params.name }');
  res.send({ response: req.params.name});
});

//
router.get('/rest/run/:loop/:loopSleep', function(req, res, next) {
  //res.send('{"response": "hello "+req.params.name }');
  var loop= req.params.loop;
  var loopSleep= req.params.loopSleep;
  for (i=0; i < loop ; i++) {
	let k = i;
	setTimeout( function() {
		console.log("do intensive computation "+k);},loopSleep*(k+1));
  }
  res.send({ loop: loop, sleep: loopSleep });
});


module.exports = router;

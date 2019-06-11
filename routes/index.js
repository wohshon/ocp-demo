var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
res.sendfile('views/index.html');
});

router.get('/rest/hello/:name', function(req, res, next) {
  //res.send('{"response": "hello "+req.params.name }');
  res.send({ response: req.params.name});
});


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

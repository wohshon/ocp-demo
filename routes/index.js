var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile("views/index.html");
});

router.get('/rest/hello/:name', function(req, res, next) {
  //res.send('{"response": "hello "+req.params.name }');
  res.send({ response: req.params.name});
});


module.exports = router;

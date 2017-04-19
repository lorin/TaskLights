var express = require('express');
var router = express.Router();
var Blink1 = require('node-blink1');
var blink1 = new Blink1();

function cancel() {
  if (typeof pulse !== 'undefined' && typeof schdl !== 'undefined') {
    pulse.clear();
    schdl.cancel();
  }
  blink1.setRGB(0, 0, 0);
}

/* GET home page. */
module.exports = router;

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Blink1' });
});

router.post('/Blink/off', function (req, res, next) {
  cancel();
  res.status(200).redirect('/');
});

router.post('/Blink/editOn', function (req, res, next) {
  //cancel();
  blink1.setRGB(0, 150, 0);
  res.status(200).redirect('/');
});

router.post('/Blink/editOff', function (req, res, next) {
  //cancel();
  blink1.setRGB(150, 0, 0);
  res.status(200).redirect('/');
});
var PushBullet = require('pushbullet');
var request = require('request-promise');
var cheerio = require('cheerio');

var pusher = new PushBullet('o.8o7mqsZc1kdM8L2kjRze9Q05ho3vInac');
var deviceId = ['ujzQUYoSUJosjAa6CVa7P2', 'ujzQUYoSUJosjAcFt9bJMy'];
var a = [];
var options = {
  uri: 'https://www.investing.com/currencies/eth-usd-technical?cid=1010808',
  method: 'GET',
  headers: {
    'User-Agent': 'Request-Promise'
  },
  transform: function(body) {
    return cheerio.load(body);
  }
};
var oldIndicator = '';

setInterval(function() {
  request('https://btc-e.com/api/3/ticker/eth_usd')
    .then(function(body) {
      var obj = JSON.parse(body);
      var price = obj.eth_usd.sell;
      var last = a[a.length - 1];
      if (last != price || a[0] == undefined) {
        a.push(obj.eth_usd.sell);
        console.log(last);
      }
      var result = last - a[0];
      // console.log(result);
      if (last != undefined && (result >= 2 || result <= -2)) {
        pusher.note(
          deviceId[0],
          'Price change: from ' + a[0].toString() + ' to ' + last.toString(),
          a.toString(),
          function(err, res) {}
        );
        a = [];
        a.push(last);
      }
    })
    .catch(function(err) {
      console.log(err);
    });
  request(options)
    .then(function($) {
      var indicator = $('.summary > span:first-child').text();
      if (indicator != oldIndicator) {
        console.log(indicator);
        for (var i = 0; i < deviceId.length; i++) {
          pusher.note(
            deviceId[i],
            'Indicator change alert: ' + indicator,
            indicator,
            function(err, res) {}
          );
        }
      }
      oldIndicator = indicator;
    })
    .catch(function(err) {
      console.log(err);
    });
}, 2000);

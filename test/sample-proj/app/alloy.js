
var Promise = require('es6-promise').Promise;
var superagent = require('superagent');

superagent.get('https://github.com/CureApp').end(function(err, res) {
  console.log(res.text.slice(0, 199));
});


p = new Promise(function(resolve, reject) {
  superagent.get('https://github.com/CureApp').end(function(err, res) {
    if (err) return reject(err);
    resolve(res);
  });
});

p.then(function(res) {
  console.log(res.text.slice(0, 400));
}, function(err) {
  console.log(err);
});

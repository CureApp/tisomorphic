# tisomorphic

Make npm modules available in Titanium.


## installation
in your titanium project root
```sh
npm install --save-dev tisomorphic
```

## requirements

- Alloy project
- `app/lib` must exist

## usage

```sh
npm install --save superagent es6-promise # modules to use
npm run tisomorphic
```

that's all. You can use superagent and es6-promise by Node.js way.

```js
var Promise = require('es6-promise').Promise;
var superagent = require('superagent');

var p = new Promise(function(resolve, reject) {
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
```

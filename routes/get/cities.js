'use strict';

var http = require('http');
var https = require('https');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var route = function route(req, res, next, abe) {

  var host = abe.config.geomaj;
  host = host.split('/');
  var httpUse = http;
  var defaultPort = 80;
  if(host[0] === 'https:') {
    httpUse = https;
    defaultPort = 443;
  }
  host = host[2].split(':')

  var options = {
    hostname: host[0],
    port: (typeof host[1] !== 'undefined' && host[1] !== null) ? host[1] : defaultPort,
    path: '/api/geo/getCities?locale=' + req.query.lang + '&name=' + req.query.q,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': 0
    }
  };

  var body = ''

  var localReq = httpUse.request(options, (localRes) => {
    localRes.setEncoding('utf8');
    localRes.on('data', (chunk) => {
      body += chunk;
    });
    localRes.on('end', () => {
      var json
      try {
        json = JSON.parse(body)
        json = json.cities
      } catch(e) {
        console.log(e);
        return res.send({
          cities:[]
        })
      }

      var result = []
      Array.prototype.forEach.call(json, (j) => {
        j.nomofficielfils = j.nomofficielfils.toLowerCase()
        j.nomDisplay = j.nomofficielfils
        j.nomDisplay = j.nomDisplay.split('')
        j.nomDisplay[0] = j.nomDisplay[0].toUpperCase()
        j.nomDisplay = j.nomDisplay.join('')
        j.codegeofils = j.codegeofils.toLowerCase()
        if(typeof j.nomalternatif !== 'undefined' && j.nomalternatif !== null) {
          j.nomalternatif = j.nomalternatif.toLowerCase()
        }else {
          j.nomalternatif = j.nomofficielfils
        }
        result.push(j)
      })
      res.send(JSON.stringify(result))
    })
  });

  localReq.on('error', (e) => {
    console.log('durville on error')
    console.log(e)
  });

  // write data to request body
  localReq.write('');
  localReq.end();
}

exports.default = route
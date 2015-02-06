// Generated by CoffeeScript 1.8.0
(function() {
  var Promise, api, configPath, data, fs, getBridgeIp, getLigths, hue, ip, offLights, onLights, onecolor, register, username, _;

  hue = require('node-hue-api');

  fs = require('fs');

  Promise = require('bluebird');

  _ = require('lodash');

  onecolor = require('onecolor');

  configPath = process.env.HOME + '/.hue.json';

  api = null;

  getBridgeIp = function() {
    return new Promise(function(done) {
      return hue.nupnpSearch().then(function(bridges) {
        var b;
        b = bridges[0];
        return done(b.ipaddress);
      }).done();
    });
  };

  register = function() {
    api = new hue.HueApi();
    return getBridgeIp().then(function(ip) {
      return api.registerUser(ip, null, null).then(function(username) {
        fs.writeFileSync(configPath, JSON.stringify({
          ip: ip,
          username: username
        }));
        return console.log('write file to', configPath);
      }).fail(function() {
        return console.log('register failed');
      }).done();
    });
  };

  getLigths = function() {
    return new Promise(function(done) {
      return api.connect().then(function(result) {
        return api.lights().then(function(lights) {
          return done(lights);
        }).done();
      }).done();
    });
  };

  onLights = function(opts) {
    if (opts == null) {
      opts = {};
    }
    return new Promise(function(done) {
      return getLigths().then(function(_arg) {
        var lights;
        lights = _arg.lights;
        return Promise.all(lights.map(function(light) {
          return new Promise(function(done) {
            var color, rgb, state;
            color = opts.color ? (rgb = onecolor(opts.color).rgb(), [~~(rgb.r() * 255), ~~(rgb.g() * 255), ~~(rgb.b() * 255)]) : ['255', '255', '255'];
            state = _.defaults(opts, {
              on: true,
              bri: 254,
              sat: 236,
              ct: 153,
              effect: 'none',
              rgb: color
            });
            return api.setLightState(light.id, state).then(done);
          });
        })).then(done);
      });
    });
  };

  offLights = function() {
    return new Promise(function(done) {
      return getLigths().then(function(_arg) {
        var lights;
        lights = _arg.lights;
        return Promise.all(lights.map(function(light) {
          return new Promise(function(done) {
            var state;
            state = hue.lightState.create();
            return api.setLightState(light.id, state.off()).then(done);
          });
        })).then(done);
      });
    });
  };

  if (fs.existsSync(configPath)) {
    data = require(process.env.HOME + '/.hue.json');
    ip = data.ip;
    username = data.username;
  } else {
    register();
    return;
  }

  api = new hue.HueApi(ip, username);

  module.exports = {
    register: register,
    offLights: offLights,
    onLights: onLights
  };

}).call(this);

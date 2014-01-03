var vows = require('vows'),
  assert = require('assert'),
  fs = require('fs'),
  stripColorCodes = require('..');

vows.describe('Srtip color codes').addBatch({
  'Given a colorized string': {
    topic: fs.readFileSync(__dirname + '/fixture/with-colors').toString(),

    'When stripping colors': {
      topic: function(strWithColors){
        return stripColorCodes(strWithColors);
      },

      'Then the string should not contain any color code': function(withoutColor){
        assert.equal(withoutColor, fs.readFileSync(__dirname + '/fixture/without-colors').toString());
      }
    }
  }
}).exportTo(module);

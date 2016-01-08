

var defaultFormatter = require('./formatter');

module.exports = function () {
  
  var formatter = defaultFormatter();
  return function(css, result) {
    
    var report = formatter({
      messages: result.messages,
      source: result.root.source.input.from,
    });

    if (!report) return;

    /// send to stdout...
    console.log(report);
  };
};

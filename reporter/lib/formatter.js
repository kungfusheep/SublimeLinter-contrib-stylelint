

var path = require("path");

module.exports = function(opts) {
    
    return function(input) {
        var messages = input.messages;

        if (!messages || !messages.length) return undefined;

        var output = "\n";

        messages.forEach(function(w) {
            output += messageToString(w) + "\n";
        });

        return output;

        function messageToString(message) {
            var str = "";
            var match;
            if (message.node && message.node.source && message.node.source.start) {
                str += message.node.source.start.line + ":" +
                       message.node.source.start.column + "  ";
            }
            else if( (match = /( line) (\d+)/g.exec(message.text)) && match.length > 1 ) {

                str += "" + match[2] + ":1  ";
            }

            str += message.text;
            return str;
        }
    };
};

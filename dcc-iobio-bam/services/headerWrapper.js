#!/usr/bin/env node

var port = 9001,
    minion = require('../index.js')(port);

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'wrapperHeader',
   path: 'wrapperHelper.sh',
   args: ['-'],
   // instructional data used in /help
   description : 'Wrapper around samheader service',
   exampleUrl : ""
};

// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);
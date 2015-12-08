#!/usr/bin/env node

var port = 8002,
    minion = require('../index.js')(port);

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'bamstatsAlive',
   path :  'statsWrapper.py',
   inputOption: '-fake',
   description : 'utility for bam files',
   exampleUrl : "fill in"
};

// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);
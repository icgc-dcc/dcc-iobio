/*
 * Copyright (c) 2016 The Ontario Institute for Cancer Research. All rights reserved.                            
 *                                                                                                              
 * This program and the accompanying materials are made available under the terms of the GNU Public License v3.0.
 * You should have received a copy of the GNU General Public License along with                                 
 * this program. If not, see <http://www.gnu.org/licenses/>.                                                    
 *                                                                                                              
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY                          
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES                         
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT                          
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                               
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED                         
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;                              
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER                             
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN                        
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * Based on work from iobio: https://github.com/iobio
 * 
 * This file incorporates work covered by the following copyright and permission notice:  
 * 
 *    The MIT License (MIT) 
 *
 *    Copyright (c) <2014> 
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 *    associated documentation files (the "Software"), to deal in the Software without restriction,
 *    including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *    and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 *    subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included
 *    in all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 *    THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 *    SOFTWARE.
 */

var server = module.exports = {};

server.init = function(port) {
    var express = require('express'),
        app = express(),
        http = require('http'),
        server = http.createServer(app),
        BinaryServer = require('binaryjs').BinaryServer,
        self = this

    self.config = require('./config');
    self.bs = BinaryServer({server: server});
    self.app = app;
    self.server = server;

    server.listen(port);

    // keep track of connected clients
    self.clients = {};

    // command line arguments
    self.cmdArgs = { debug : false}
    if (process.argv.indexOf('--debug') != -1) self.cmdArgs.debug = true;
    if (process.argv.indexOf('--platform') != -1) self.config.platform = process.argv[process.argv.indexOf('--platform')+1];
    console.log('platform = ' + self.config.platform);

    // add public folder
    app.use('/', express.static(__dirname + '/public'));

    // add status service
    app.get('/status', function(req, res){
        res.header('Content-Type', 'application/json');
        res.header('Charset', 'utf-8')
        res.send(req.query.callback + '({"status": "running"});');
    });

    // add status service
    app.get('/help', function(req, res){
        var fs = require("fs");
        var ejs = require("ejs");
        var fullUrl = req.protocol + "://" + req.get('host');
        var compiled = ejs.compile(fs.readFileSync(__dirname + '/template/help.ejs', 'utf8'));
        self.tool['serviceUrl'] = fullUrl;
        var html = compiled( self.tool );
        res.send(html);
    });

    // handle http requests
    app.get('/', function (req, res) {
        if(req.query.cmd == undefined) {
            // return instructions for empty commands
            var fs = require("fs");
            var ejs = require("ejs");
            var fullUrl = req.protocol + "://" + req.get('host');
            var compiled = ejs.compile(fs.readFileSync(__dirname + '/template/help.ejs', 'utf8'));
            self.tool['serviceUrl'] = fullUrl;
            var html = compiled( self.tool );
            res.send(html);
        } else {
            // execute command
            res.writeHead(200, {
                "Content-Type": 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            });

            if(req.query.binary) req.query.encoding = 'binary';
            req.query.protocol = req.query.protocol || 'http';
            self.debug = req.query.debug || false;

            var Command = require('./cmd.js');
            var command = new Command()
            command.on('error', function(error) {
                console.log(self.tool.name + ' Error: ' + error);
                // stream.error(self.tool + ' Error: ' + error); // how do you pass errors up the http chain?
            })
            command.on('createClientConnection', function(connection, command) {
                // bubble up createClientConnection with http?
                console.log("Attempting to use local file with http protocol. Must use websocket protocol")
            });
            command.on('log', function(msg) {
                // log message
                console.log(msg);
                // if debugging send msg to client
                // if (self.debug) // can't send back via http
                //     stream.error(self.tool.name + 'Debug: ' + msg)
            })
            if(command.init(self.tool, req.query)) {
                command.run(res, self.getClients(), self.server.address().address + ':' + self.server.address().port);
            }
        }
    });

    return this;
}

// handle websocket requests
server.listen = function(tool) {

    var self = this;
    self.cmd = null;
    self.tool = tool;
    var bs = self.bs;
    bs.commands = {};

    bs.on('connection', function(client, options) {
        self.client = client;
        self.closing = false;
        client.on('stream', function(stream,options) {
            // handle params
            var urlParser = require('./utils/utils').parseUrlParams;
            var params = options.params || {};
            if (params['cmd'] == undefined && params['url'] != undefined) {
                var q = urlParser(params['url']).query;
                for (var attr in q) { params[attr] = q[attr]; } // merge params in query into params object
            }
            self.debug = params.debug || false;
            if (params.getNodeUrl) {
                self.getServerAddress(function(serverAddress) {
                    // pass serverAddress to client
                    stream.createClientConnection({id:null, 'serverAddress':serverAddress});
                })
            }

            stream.on('err', function(err) {
                console.log('caught stream error: ' + err);
                stream.error(self.tool.name + 'Caught Stream Error: ' + err)
            })
            if(options.event == "clientConnected") {
                var dataCommand = bs.commands[options.connectionID];
                dataCommand.emit('clientConnected', stream);
            }
            if(options.event == "setID") {
                client.connectionID = options.connectionID;
                self.clients[options.connectionID] = client.id;
            }
            if(options.event == 'run') {
                params.protocol = params.protocol || 'websocket';
                if (params.binary) {params.encoding = 'binary';} // backwards compatibility fix
                params.encoding = params.encoding || 'utf8';

                var Command = require('./cmd.js');
                var command = new Command();
                self.curCmd = command;
                command.on('error', function(error) {
                    stream.error(self.tool.name + ' Error: ' + error);
                })
                command.on('log', function(msg) {
                    // Log message
                    console.log(msg);
                    // if debugging send msg to client
                    if (self.debug) {
                        console.log('In Debug Mode')
                        stream.error(self.tool.name + 'Debug: ' + msg)
                    }
                })
                command.on('createClientConnection', function(connection, command) {
                    // Pass event up stream
                    stream.createClientConnection(connection);
                    // Set id
                    client.connectionID = connection.id;
                    self.clients[connection.id] = client.id;
                })
                // Initialize command
                if (command.init(self.tool, params)) {
                    // Run command
                    self.getServerAddress(function(serverAddress) {
                        // ICGC DCC - Make sure we can track the programs pid and the pid of its children
                        if (!self.closing && stream.writable) {
                            var psTree = require('ps-tree');
                            self.curPid = command.run(stream, self.getClients(),serverAddress );
                            psTree(self.curPid, function(err, children) { self.children = children });
                        }
                    });
                }
             }
        })
        client.on('close', function() {
            // ICGC DCC - Cleanup of spawned processes and their children. Removed unused client related cleanup.
            self.closing = true;
            var cp = require('child_process');
            var psTree = require('ps-tree');
            cp.spawn('/bin/kill', ['-9'].concat(self.children.map(function (p) {
                psTree(p.PID, function (err, children) {
                    cp.spawn('/bin/kill', ['-9'].concat(children.map(function (pp) { return pp.PID })));
                });
                return p.PID;
            })));
            cp.spawn('/bin/kill', ['-9', self.curPid]);
            delete self.curCmd;
            cp.spawn('/home/iobio/iobio/bin/cleaner.sh');
        })
    });
};

server.getBrowserClient = function(minion) {
    if (minion.query.id != undefined) {
        var bs = this.bs;
        var clientId = this.clients[source.query.id];
        var client = bs.clients[clientId];
    } else {
        var client = this.client;
    }

    return client;
}

server.getClients = function() {
    var clients = {};
    var self = this;
    Object.keys(this.clients).forEach(function(queryId) {
        var clientId = self.clients[queryId];
        clients[queryId] = self.bs.clients[clientId];
    })

    return clients;
}

server.getServerAddress = function(callback) {
    var self = this;
    var method = this.config.platform;
    if ( method == 'default')
        callback(null);
    else if ( method == 'amazon') {
        var http = require("http");
        http.get('http://169.254.169.254/latest/meta-data/public-hostname', function(res) {
            res.on('data', function (chunk) {
                var hostname = chunk.toString('utf8').split('compute-1.amazonaws.com')[0] + 'iobio.io';
                callback(hostname + '/' + self.tool.name);
            });
        })
    }
}

server.close = function() {
    this.server.close();
}



module.exports = server;

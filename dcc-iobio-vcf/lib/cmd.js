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

var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    shortid = require('shortid');

// run command
var cmd = function(){}

// inherit eventEmitter
inherits(cmd, EventEmitter);

cmd.prototype.init = function(tool, params) {
    // Call EventEmitter constructor
    EventEmitter.call(this);

    var self = this;

    this.tool = tool;
    this.minions = [];
    var rawArgs = [];
    var args = [];
    var binPath = require('path').resolve(__dirname, '../bin/');
    var path = require('path').resolve(binPath, tool.path);

    var cmd = params['cmd'];
    // split commands by space into array, while escaping spaces inside double quotes
    if (cmd != undefined) rawArgs = cmd.match(/(?:[^\s"]+|"[^"]*")+/g)

    // look for minion remote sources
    for( var i=0; i < rawArgs.length; i++) {
        var arg = rawArgs[i];
        if ( arg.match(/^[\'\"].*[\'\"]$/) )
            args.push( arg.slice(1,arg.length-1) ); // remove quotes
        else
            args.push( arg );
    }

    // add default options of tool
    if (tool.options != undefined)
        args = tool.options.concat( args );

    // add default arguments of tool
    if (tool.args != undefined)
        args = args.concat( tool.args );

    // check that executable path is in bin sandbox for security
    var IsThere = require("is-there");
    var resolvedPath = require("path").resolve(path);
    if ( binPath != resolvedPath.substr(0, binPath.length) ) {
        var error = "Program path not in executable directory. Only programs in iobio/bin/ directory are executable";
        self.emit('log', error);
        self.emit('error', error);
        return false;
    } else if( !IsThere(resolvedPath) ) {
        var error = "Program not found. Only programs in iobio/bin/ directory are executable";
        self.emit('log', error);
        self.emit('error', error);
        return false;
    }
    self.path = path;
    self.args = args;
    self.params = params;
    return true;
}

cmd.prototype.run = function(stream, clients, serverAddress) {
    var self = this,
        spawn = require('child_process').spawn;

    // spawn tool as new process
    self.emit('log', 'command: ' + self.path + ' ' + self.args);
    if (stream.writable) {
        var prog = spawn(self.path, self.args);
    } else {
        return 0;
    }

    if(self.params.parseByLine || self.params.format != undefined) {
        var utils = require('./utils/utils')
        var reader = self.params.parseByLine ? utils.lineReader : utils.chunkReader
        reader(prog, function(data) {
            var fs = require('fs');
            if (self.params.format != undefined) {
                if (self.tool[self.params.format] == undefined) {
                    stream.write( data );
                } else
                    stream.write( self.tool[self.params.format](data) )
            } else {
                stream.write( data );
            }
        });
    } else {
        if(self.params.encoding != 'binary') prog.stdout.setEncoding(self.params.encoding);
        prog.stdout.pipe(stream);
    }

    // go through minion sources
    self.minions.forEach(function(minion) {
        var parsed = require('./utils/utils').parseUrlParams(minion)
        // get correct protocol
        if (self.params.protocol == 'websocket')
            var Runner = require('./protocol/ws');
        else if (self.params.protocol == 'http')
            var Runner = require('./protocol/http');

        // execute minion commands
        var runner = new Runner();
        runner.on('error', function(error) { self.emit('error', error); });
        runner.on('createClientConnection', function(connection) { self.emit('createClientConnection', connection); });
        runner.on('log', function(msg) { self.emit('log', msg); });
        runner.run(minion, prog);
    })

    prog.stderr.on('data', function (error) {
        self.emit('error', 'stderr - ' + error);
    });

    prog.on("close", function() {
        stream.end();
    })

    prog.stdin.on('error', function() {
        self.emit('error', 'error writing to program. possibly unconsumed data in pipe');
    })

    prog.on('error', function(err) {
        self.emit('error', 'prog threw an error - ' + err);
    })

    prog.on('exit', function (code) {
        if (code !== 0) {
            var error = 'prog process exited with code ' + code
            self.emit('error', error);
        } else {
            stream.end();
        }
    });

    // ICGC DCC - Here we return the pid of the spawned process so we can reap it later
    return prog.pid;
}

module.exports = cmd;

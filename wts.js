var EventEmitter = require('events').EventEmitter;
var util = require('util');

//Will act as pipes in commands
var File = function(){
	this.active = false;
	this.events = [];
}

util.inherits(File, EventEmitter);

File.prototype.write = function(msg){
	//TODO: there could be a type/category of message being written also
	//console('File got data ' + msg)
	//console.log(this)
	this._generateEvent('data', msg);
}
	
File.prototype.pause = function(){
	//If it is paused; hereafter events are not generated until resume() is called
	this.active = false;
	this.emit('pause');
}

File.prototype.resume = function(){
	//Only after it is resumed, we start delievering events. Before resuming they are stored safely in an array
	this.active = true;
	this.emit('resume');
	this._processEventQueue()
}

//Private method to facilitated delivery of events only after file is resumed
File.prototype._generateEvent = function(ev, data){
	this.events.push([ev, data]);
	if(this.active){
		this._processEventQueue()
	}
}

//private method that runs the queue
File.prototype._processEventQueue = function(){
	while(ev = this.events.shift()){
		this.emit(ev[0], ev[1]);
	}	
}

//To signify we have no more things to left in this file
File.prototype.end = function(){
	this._generateEvent('end');
}

/*
Command represents a shell Command.
It will do an atomic single work.
It accepts params that can be used by sub-classing commands

*/
var Command = function(params){
	//console.log('Command');
	this.params = params;
}

util.inherits(Command, EventEmitter);

//Outputs `m` to Standard Output
Command.prototype.output = function(m){
	//console.log(m);
	this.stdout.write(m);
}

//Prepares the command and runs it in context of the process instance passed.
Command.prototype.run = function (myProcess){
	this.stdin = myProcess.stdin;
	this.stdout = myProcess.stdout;
	this.execute();	
}

//Ensures Command is sub-classed and then run by actual command and not just the prototype
Command.prototype.execute = function(){
	throw new Exception('Execute needs to be overridden');
}

//Signifies that the command is done. It is individual commands responsibility to specify when it is over.
//Note: There is nothing automated to say when the command is over. We leave this responsibility on the developer building command to tell when it is done
Command.prototype.end = function(){
	this.stdout.end()
	this.emit('end')	
}

//One of the most useful methods. Pass it a file object and from now the command can start listening to this file read events on the function `onStdInput`
//One more thing is, this command will end as soon as the standard input ends.
Command.prototype.input = function(file){
	var that = this;
	if(file){
		that.stdin = file;
	}
	that.stdin.on('data', function(data){that.onStdInput(data);});
	that.stdin.on('end', function(){that.end()});
	that.stdin.resume();
}

//ScriptLine represents a line in a shell script.
//You would never need to extend it. Just use it the way it is
var ScriptLine = function(){
	Command.call(this, arguments)
	this.commands = []
}

util.inherits(ScriptLine, Command);

ScriptLine.prototype.execute = function(){
	//console.log('ScriptLine execute')
	var commands = this.commands;
	var length = commands.length;
	var i=0;
	var that=this;

	//for first process standard input is ended
	for(i=0; i<length; ++i){
		//for first process stdin is ScriptLine.stdin
		if(i==0){
			var stdin = this.stdin;
		}
		else{
			var stdin = stdout; 
		}
		//for last process stdout = ScriptLine.stdout
		if(i==(length - 1)){
			var stdout = this.stdout;
		}
		else{
			var stdout = new File();
		}
		
		var tempProcess = {stdin : stdin, stdout : stdout};
		process.nextTick(callbacker(commands[i], commands[i].run, tempProcess))
	}
	
	//when the last command ends; ScriptLine ends
	commands[length-1].on('end', function(){
		//console.log('Script Line End where legth = '+length);
		that.end();
	})
}

ScriptLine.prototype.add = function(c){
	this.commands.push(c);
}

var MyProcess = function(o){
	this.stdin = o.stdin;
	this.stdout = o.stdout;
	this.active = false;
	this.events = [];
	this.data='';
	
	//start listening on stdout and storing it as data
	var that = this;
	that.stdout.on('data', function(d){
		//console.log('Got Data')
		that.data += d
		that._generateEvent('data', d)
	})
	that.stdout.resume()
}

util.inherits(MyProcess, EventEmitter);

MyProcess.prototype.pause = function(){
	this.active = false;
	this.emit('pause');
}

MyProcess.prototype.resume = function(){
	//Only after it is resumed, we start delievering events. Before resuming they are stored safely in an array
	this.active = true;
	this.emit('resume');
	this._processEventQueue()
}

//Private method to facilitated delivery of events only after file is resumed
MyProcess.prototype._generateEvent = function(ev, data){
	this.events.push([ev, data]);
	if(this.active){
		//console.log('Processing Queue')
		this._processEventQueue()
	}
	else{
		//console.log('Not Processing Queue')		
	}
}

MyProcess.prototype._processEventQueue = function(){
	while(ev = this.events.shift()){
		this.emit(ev[0], ev[1]);
	}	
}

//To signify we have no more things to send
MyProcess.prototype.end = function(){
	//console.log('process end')
	this._generateEvent('end');
}


var Script = function(){
	Command.call(this, arguments)
	this.lines = [];
}

util.inherits(Script, Command);	

Script.prototype.execute = function(){
	//console.log('Script execute')
	var that = this;
	var lines = this.lines;
	var length = lines.length;
	var waitToEnd = length;
	var i = 0;
	var processes = []
	
	for(i=0; i<length; i++){
		var line = lines[i]

		//console('i = '+i +' creating new STDOUT')
		var stdout = new File();
		var p=new MyProcess({stdin : this.stdin, stdout : stdout})
		p.on('data',function(data){
			that.stdout.write(data)
		})
		
		//if its first process; resume process
		if(i===0){
			p.resume()
		}
		else{
			processes[i-1].on('end', function(j){
				return function(){
					j.resume();
				}
			}(p))
		}
		
		line.on('end', function(j){
			return function(){
				//console.log('Command end')
				j.end();
			}
		}(p))

		processes.push(p)
		//console.log(tempProcess)
		process.nextTick(callbacker(line, line.run, p))
	}
	p.on('end', function(){
		that.end()
	})
	
	//console.log('Running first line')
	//console.log(tempProcess)
	//console.log('Ran first line')
}

Script.prototype.add = function(l){
	this.lines.push(l);
}

var callbacker = function(obj, method1, params){
	return function(){
		method1.call(obj, params);
	}
}


exports.Script = Script
exports.Command = Command
exports.ScriptLine = ScriptLine

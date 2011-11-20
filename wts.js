var EventEmitter = require('events').EventEmitter;
var util = require('util');

<<<<<<< HEAD
/*
PausableEventIssuer
--------------------
A PausableEventIssuer is an EventEmiiter self can be paused and resumed
*/
var PausableEventIssuer = function(){
	PausableEventIssuer.super_.call(this, arguments)

	//At initial stage, it is not paused.
	this._isPaused=false
	this._eventsStack=[]
}

//PausableEventIssuer is a subclass of EventEmitter
util.inherits(PausableEventIssuer, EventEmitter);

PausableEventIssuer.prototype.pause = function(){
	//If it is paused; hereafter events are not generated until resume() is called
	this.issue('pause');
	this._isPaused = true;
}

PausableEventIssuer.prototype.resume = function(){
	//Only after it is resumed, we start delievering events. Before resuming they are stored safely in an array
	this._isPaused = false;
	this.issue('resume');
}

//issue pushes event in events array; and processes events if state is not paused. 
PausableEventIssuer.prototype.issue = function(ev, data){
	this._eventsStack.push({'event' : ev, 'data': data});
	if(this instanceof MyProcess && ev =='data'){
		//console.log(ev + ',, ' + data)
		//console.log(this._eventsStack)
	}
	if(!this._isPaused){
=======
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
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
		this._processEventQueue()
	}
}

<<<<<<< HEAD
//private method self loops through the events queue and emits them.
PausableEventIssuer.prototype._processEventQueue = function(){
	//console.log(this._eventsStack);
	while(ev = this._eventsStack.shift()){
		//call EventEmitter.emit to emit the event
		//console.log('--> --> '+ev.event+', '+ev.data)
		//console.log(this._eventsStack);
		this.emit(ev.event, ev.data)
	}	
}



/*
RWFile
------
RWFile Will act as Command.stdout and command.stdin.
It is Readable, Writeable File with minimum capabilities of generating 2 events - data, end.
*/
var RWFile = function(){
	RWFile.super_.call(this, arguments)
	
	//At its initial stage, its paused; because stdin starts only when stdin.resume is called
	this.pause();
	
	//flag to see if file is done
	this._hasEnded = false
}

util.inherits(RWFile, PausableEventIssuer);

RWFile.prototype.write = function(msg){
	//TODO: there could be a type/category of message being written also
	if(!this.isClosed()){
		this.issue('data', msg);
	}
	else{
		throw new Exception('File has ended')
	}
}
	
//To signify file has reached its end
RWFile.prototype.end = function(){
	if(!this.isClosed()){
		this._hasEnded = true
		this.issue('end')
	}
}

RWFile.prototype.isClosed = function(){
	return this._hasEnded
}

/*
Command
------
A command, in WTS, corresponds to a Shell Command - providing its basic features -  
		1) Performs some operation //in method execute
		2) Can optionally read Stdin // by calling this.input()
		3) Writes output to Stdout // by calling this.output()
		4) Once written, can be reused. //In Pipes, or Scripts
		5) extending `Command` and implementing its abstract method `execute`.
		6) Can be run individually or in ScriptLine or in Script.
		7) Has to specifically signal that it is done. ;by calling this.end()
*/
var Command = function(args){
	this.args = args;
=======
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
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
}

util.inherits(Command, EventEmitter);

<<<<<<< HEAD
//One of the most useful methods. Pass it a file object and a callback, the command can starts listening to this file read events.
//if dontEndWithInput is set to true; the command will not end when stdin ends. else command will end automatically as stdin ends.
Command.prototype.input = function(file, callback, dontEndWithInput){
	var self = this;
	var p = self.process
	if(file){
		p.stdin = file;
	}
	if(!callback){
		callback = self.onStdInput
	}
	p.stdin.on('data', function(data){self.onStdInput(data);});
	//TODO:: Check if it works well with sort command
	if(! dontEndWithInput){
		p.stdin.on('end', function(){self.end()});
	}
	p.stdin.resume();
}

//Writes `m` to Standard Output
Command.prototype.output = function(m){
	this.process.stdout.write(m);
	//console.log(this.process.stdout._eventsStack)
}

//Prepares and returns process object
Command.prototype.prepare = function (myProcess){
	//TODO: p = process; foreach in second argument, p.k = v; foreach in first argument p.k = v
	if(!this.process){
		var p = myProcess;
		if(!(p instanceof MyProcess)){
			p = new MyProcess(myProcess);
		}
		//command and process both store references to each other
		p.command=this
		this.process=p
	}
	return this.process
=======
//Outputs `m` to Standard Output
Command.prototype.output = function(m){
	//console.log(m);
	this.stdout.write(m);
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
}

//Prepares the command and runs it in context of the process instance passed.
Command.prototype.run = function (myProcess){
<<<<<<< HEAD
	this.prepare(myProcess)
	//execute is abstract method; needs to be implemented in sub classes
	this.execute()
	return this.process;
=======
	this.stdin = myProcess.stdin;
	this.stdout = myProcess.stdout;
	this.execute();	
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
}

//Ensures Command is sub-classed and then run by actual command and not just the prototype
Command.prototype.execute = function(){
	throw new Exception('Execute needs to be overridden');
}

<<<<<<< HEAD
//Signifies self the command is done. It is individual commands responsibility to specify when it is over.
//Note: There is nothing automated to say when the command is over. We leave this responsibility on the developer building command to tell when it is done
Command.prototype.end = function(){
	//Most of the interactions is done on command.stdout. Ending command.stdout will signal it to other processes in general.
	if(this.process.stdout != process.stdout){
		//console.log('command.process.stdout.end')
		this.process.stdout.end();
	}
	//Currently no one listens to this event //TODO: emit end when stdout ends. Process will listen to ths event
	this.emit('end')
}

/*
TODO: addArgument, addOption, getArgument, getOption is the right approach
*/

//setArgument and getArgument enable seting arguments on Commands
Command.prototype.setArgument = function(name, value){
	this.args[name] = value
}

Command.prototype.getArgument = function(name){
	return this.args[name]
}

/*

*/

var MyProcess = function(o){
	MyProcess.super_.call(this, arguments);
	
	var self=this
	self.obj = o;
	self._command=null;
	self._hasEnded = false;
	
	var stdout = self.obj.stdout
	
	this.__defineGetter__("stdout", function(){
		return stdout
	});	
	
	this.__defineGetter__("stdin", function(){
		return self.obj.stdin
	});	

	this.__defineGetter__("stderr", function(){
		return self.obj.stderr
	});
	
	//command is to be set and get usin setter and getter because we need to read through its events
	this.__defineGetter__("command", function(){
		return self._command
	});

	this.__defineSetter__("command", function(command){
		self._command = command;
	});

	//at first it is paused.
	this.pause();
	//start listening on stdout and storing it as data
	stdout.on('data', function(d){
		self.issue('data', d)
	})

	stdout.on('end', function(){
		//console.log('process.end')
		self.end(0); //TODO::success and other status messages
	})
	//resume stdout when process is resumed.
	//TODO::Think; will it create any problem?
	self.on('resume', function(){
		stdout.resume()
	})
}

util.inherits(MyProcess, PausableEventIssuer);

//Runs the command
MyProcess.prototype.run = function(){
	//console.log('running')
	this.command.run(this)
}

//To signify we have no more things to send
MyProcess.prototype.end = function(status){
	//console.log('issued end in myProcess.')
	this._hasEnded = true
	this.issue('end', status);
}

MyProcess.prototype.hasEnded= function(){
	return this._hasEnded
=======
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
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
}

//ScriptLine represents a line in a shell script.
//You would never need to extend it. Just use it the way it is
var ScriptLine = function(){
	Command.call(this, arguments)
	this.commands = []
}

<<<<<<< HEAD
//ScriptLine is a command
=======
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
util.inherits(ScriptLine, Command);

ScriptLine.prototype.execute = function(){
	//console.log('ScriptLine execute')
	var commands = this.commands;
	var length = commands.length;
	var i=0;
<<<<<<< HEAD
	var self=this;
	var thisProcess = this.process
=======
	var that=this;
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618

	//for first process standard input is ended
	for(i=0; i<length; ++i){
		//for first process stdin is ScriptLine.stdin
		if(i==0){
<<<<<<< HEAD
			var stdin = thisProcess.stdin;
		}
		else{
			var stdin = stdout
		}
		//for last process stdout = ScriptLine.stdout
		if(i==(length - 1)){
			var stdout = thisProcess.stdout
		}
		else{
			var stdout = new RWFile()
		}
		
		var p = commands[i].prepare({stdin : stdin, stdout : stdout})
		process.nextTick(callbacker(p, p.run))
=======
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
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
	}
	
	//when the last command ends; ScriptLine ends
	commands[length-1].on('end', function(){
		//console.log('Script Line End where legth = '+length);
<<<<<<< HEAD
		self.end();
=======
		that.end();
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
	})
}

ScriptLine.prototype.add = function(c){
	this.commands.push(c);
}

<<<<<<< HEAD
var Script = function(){
	Script.super_.call(this, arguments)
=======
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
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
	this.lines = [];
}

util.inherits(Script, Command);	

Script.prototype.execute = function(){
	//console.log('Script execute')
<<<<<<< HEAD
	var self = this;
	var thisProcess = self.process;
	var lines = self.lines;
	var length = lines.length;
	var i = 0;
	var processes = []
	
	var outputSequencer = new OutputSequencer(thisProcess.stdout)
	
=======
	var that = this;
	var lines = this.lines;
	var length = lines.length;
	var waitToEnd = length;
	var i = 0;
	var processes = []
	
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
	for(i=0; i<length; i++){
		var line = lines[i]

		//console('i = '+i +' creating new STDOUT')
<<<<<<< HEAD
		var stdout = new RWFile();
		if(line instanceof MyProcess){
			p = line
		}
		else{
			var p=line.prepare({stdin : this.stdin, stdout : stdout})			
		}
		/*p.on('data',function(data){
			thisProcess.stdout.write(data)
=======
		var stdout = new File();
		var p=new MyProcess({stdin : this.stdin, stdout : stdout})
		p.on('data',function(data){
			that.stdout.write(data)
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
		})
		
		//if its first process; resume process
		if(i===0){
			p.resume()
		}
		else{
<<<<<<< HEAD
			//resume the process only when previous process exists.
			processes[i-1].on('end', function(currentProcess, j){
				return function(){
					currentProcess.resume();
				}
			}(p, i-1))
		}
		
		processes.push(p)*/
		if(! (line instanceof MyProcess)){
			process.nextTick(callbacker(p, p.run))
		}
		outputSequencer.add(p)
	}
	
	outputSequencer.end() //We are done with adding processes to outputSequencer
	//script ends; when last process ends
	/*p.on('end', function(){
		//console.log('last process ended. Ending Script')
		self.end()
	})*/
	
	outputSequencer.on('end', function(){
		//console.log('last process ended. Ending Script')
		self.end()
	})
=======
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
	
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618
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


<<<<<<< HEAD
var OutputSequencer = function(stdout){
	this.stdout = stdout
	this._processes = []
}

util.inherits(OutputSequencer, EventEmitter)

OutputSequencer.prototype.add = function(p){
	var self = this
	var processes = self._processes
	processes.push(p)
	var lastIndex = processes.length -1
	
	p.on('data', function(data){
		self.stdout.write(data)
	})
	
	//if this is first process; resume it
	if(lastIndex == 0 || processes[lastIndex - 1].hasEnded()){
		p.resume()
	}
	else{
		//resume it; when previous process ends
		processes[lastIndex - 1].on('end', function(proc){
			return function(){
				proc.resume()
			}
		}(p))
	}
}

OutputSequencer.prototype.end = function(){
	//console.log('OutputSequencer end called')
	var self = this
	var processes = self._processes
	var lastIndex = processes.length -1
	
	if(processes[lastIndex].hasEnded()){
		//console.log('OutputSequencer ends')
		self.emit('end')		
	}
	else{
		processes[lastIndex].on('end', function(){
			//console.log('OutputSequencer ends')
			self.emit('end')
		})
	}
}

exports.Script = Script
exports.Command = Command
exports.ScriptLine = ScriptLine
exports.PausableEventIssuer = PausableEventIssuer
exports.RWFile = RWFile
exports.OutputSequencer = OutputSequencer
exports.MyProcess = MyProcess
/*
examples

Command Substitution
====================
var h = new EchoAfter500 ({message: 'What the Shell'}).run({stdout: new RWFile()})
var b = new EchoAfter2000 ({message: 'Its gonna Rock'}).run({stdout: new RWFile()})
var f = new EchoAfter500 ({message: 'a small module of RoChStar project'}).run({stdout: new RWFile()})
var l = new Layout({head: h, body: b, foot: f})

1) `run` returns a process object and this process object, henceforth, is used to access the command.
2) The recieving command recieves the process object. Should subscribe to process.data and .end events in the logic.
*/
=======
exports.Script = Script
exports.Command = Command
exports.ScriptLine = ScriptLine
>>>>>>> bebdd1f90644c0b444bdcf6438bbbc37fd74f618

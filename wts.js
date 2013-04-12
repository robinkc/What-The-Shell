var restler = require('restler')
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var http = require('http');

var Command = function(args){ 
	//console.log(args);
	this.args = args;
	this._outputData = [];
	this._isPaused = true;
	this._isEnded = false;
	this.run();
}

util.inherits(Command, EventEmitter);

//Args
Command.prototype.setArgument = function(name, value){
	this.args[name] = value
}

Command.prototype.getArgument = function(name){
	return this.args[name]
}

Command.prototype.setArguments = function(args){
	this.args = args;
	//console.log(this.args);
}

//START
Command.prototype.init = function(){
	//ignore; do nothing
}

//EXECUTE
Command.prototype.run = function(){
	this.init();
	this.execute(); //To be implemented by sub class
}

//End
Command.prototype.end = function(status){
	//console.log('Command ending');
	this._isEnded = true;
	this._processEvents();
	return this;
}

//INPUT
Command.prototype.input = function(data){
	//ignore; do nothing
}

Command.prototype.endInput = function(){
	//ignore; do nothing
}

//OUTPUT
Command.prototype.output = function(data){
	this._outputData.push(data); 
	//console.log(this._outputData);
	this._processEvents();
	return this;
}

Command.prototype.resumeOutput = function(){
	this._isPaused = false;
	this._processEvents();
}

Command.prototype.pauseEvents = function(){
	this._isPaused = true;
}

Command.prototype._processEvents = function(){
	if(this._isPaused){
		//console.log('output is paused');
		return;
	}
	while (data = this._outputData.shift()){
		//If data is instanceOf command we need to do something here
		if(data instanceof Command){
			//on commands output emit my data
			var self = this;
			data.on('output', function(data){
				self.emit('output', data);
			});

			//pause self events further;
			self.pauseEvents();

			//resume self output when the other command ends
			data.on('end', function(){
				self.resumeOutput();
			});

			//resume the other command output
			data.resumeOutput();

			//no further processing events now
			return;
		}
		else{
			//normal output
			this.emit('output', data);
		}
	}
	if(this._isEnded){
		this.emit('end');
	}
}

//PIPE
Command.prototype.pipeOutput = function(command2){
	//used for piping
	this.on('output', function(data){
		command2.input(data);
	});
	this.on('end', function(){
		command2.endInput();
	});
	this.resumeOutput();
	return command2;
}


//OutputSequencer
var OutputSequencer = function(){
	OutputSequencer.super_.apply(this, arguments);
}

util.inherits(OutputSequencer, Command);

OutputSequencer.prototype.execute = function(){
	//Do nothing; it will be ended by the caller
}

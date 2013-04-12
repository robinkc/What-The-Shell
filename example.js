var wts = require('wts');
var Command = wts.Command;
var OutputSequence = wts.OutputSequencer;

//-------------------------------------
//COMMANDS
var Echo = function(message){
  Echo.super_.call(this, {message: message});
}

util.inherits(Echo, Command);

Echo.prototype.execute = function(){
	//console.log('executing');
	this.output(this.getArgument('message'));
	this.end();
}

//GREP
var Grep = function(what){
	Grep.super_.call(this, {what: what});
}

util.inherits(Grep, Command);

Grep.prototype.execute = function(){
	//do nothing. Wait for input
}

Grep.prototype.input = function(data){
	var m = this.getArgument('what');	
	if(data.search(m) != -1){
		//console.log('grep matched');
		this.output(data);
	}
}

Grep.prototype.endInput = function(data){
	//console.log('grep ending');
	this.end();
}

//DELAY
var DelayedEcho = function(time, what){
	DelayedEcho.super_.call(this, {howMuch: time, message: what});
}

util.inherits(DelayedEcho, Command);

DelayedEcho.prototype.execute = function(){
	var self = this;
	setTimeout(function(){
		self.output(self.getArgument('message'));
		self.end();
	}, self.getArgument('howMuch'));
}
//-------------------------------------
//TESTING

var g = new Grep('00');
var g2 = new Grep('00');
var g3 = new Grep('000');

var d = new DelayedEcho(500, '500 Delay');
var d2 = new DelayedEcho(200, '200 Delay');
var d3 = new DelayedEcho(1000, '1000 Delay');
var d4 = new DelayedEcho(100, '100 Delay');

d.pipeOutput(g); //d|g

var c = new OutputSequencer();
c.output(g).output(d2).end();//g; d2;

var c2 = new OutputSequencer();//c; d3
c2.output(c)
  .output(d3)
  .end()
  .pipeOutput(g2).pipeOutput(g3);

var c3 = new OutputSequencer();
c3.output(g3).output(d4).end();// |g2|g3

c3.on('output', function(data){
	//console.log('recived output');
	process.stdout.write(data);
});
c3.resumeOutput();

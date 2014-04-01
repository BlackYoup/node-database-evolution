var fs = require('fs'),
	Promise = require('pacta'),
	MySQL = require('./mysql.js');

module.exports = function Evolution(conf){
	this.providerObject = null;
	this.allScripts = [];
	this.conf = conf;
	this.provider = conf.provider;

	this.setProviderObj = function(){
		switch(this.provider.toLowerCase()){
			case 'mysql':
				this.providerObject = new MySQL(this.conf);
			break;
			default:
				console.error('Error : provider ' + this.provider + ' is not supported yet or does not exists');
			break;
		}
		return this;
	};

	this.listFiles = function(){
		var promise = new Promise();
		var self = this;

		fs.readdir('./scripts/', function(err, files){
			if(err) promise.reject('Error reading files : ' + err);
			else {
				self.allScripts = files;
				promise.resolve();
			}
		});

		return promise;
	};

	this.evolve = function(){
		var self = this;

		this.listFiles().chain(function(){
			self.providerObject.init(self.allScripts);
		});
	};

	this.init = function(){
		this.setProviderObj().evolve();
	};

	return this;
};
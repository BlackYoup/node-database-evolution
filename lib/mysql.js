var fs = require('fs'),
	_ = require('underscore'),
	Promise = require('pacta'),
	mysql = require('mysql');

module.exports = function(conf){
	this.files = null;
	this.mysql = null;
	this.host = conf.host;
	this.port = conf.port;
	this.database = conf.database;
	this.user = conf.user;
	this.password = conf.password;

	this.parseFiles = function(){
		var self = this;
		var promise = new Promise();
		_.each(this.files, function(file){
			fs.readFile('./scripts/' + file, function(err, data){
				if(err) promise.reject('Unable to read file ' + file);
				else self.execute(data.toString().trim()).chain(function(){
					promise.resolve();
				}).chainError(function(err){
					promise.reject(err);
				});
			});
		});
		return promise;
	};

	this.connect = function(){
		var promise = new Promise();
		this.mysql = mysql.createConnection({
			host     : this.host,
			user     : this.user,
			password : this.password,
			database : this.database,
			port : this.port
		});
		
		this.mysql.connect(function(err){
			if(err) promise.reject(err);
			else promise.resolve();
		});
		return promise;
	};

	this.execute = function(SQL){
		var promise = new Promise();
		this.mysql.query(SQL, function(err, rows, fields){
			if(err) promise.reject(err);
			else {
				console.log(rows);
				console.log(fields);
				promise.resolve();
			}
		});
		return promise;
	};

	this.init = function(files){
		var self = this;
		this.files = files;
		this.connect().chain(function(){
			self.parseFiles().chainError(function(err){
				console.log(err);
			});
			console.log('cc');
		}).chainError(function(err){
			console.log(err);
		});
	};
};
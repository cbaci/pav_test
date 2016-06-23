var jsonSchemaTable = require('json-schema-table');
var pg = require('pg-cr-layer');
var projectsSchema = require('../projects.json');
var complexSchema = require('../complex.json');
 
// initialize and connect to a database 
 
var projectTable = jsonSchemaTable('projects', projectsSchema, {db: pg});
var complexTable = jsonSchemaTable('complex', complexSchema, {db: pg});
 
// First create then sync to build the references 
projectTable.create().then(function() {
	return complexTable.create();
}).then(function() {
	return projectTable.sync();
}).then(function() {
	return complexTable.sync();
}).catch(function(error) {
	console.log(error);
});
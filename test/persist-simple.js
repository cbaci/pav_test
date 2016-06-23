var persist = require("persist");
var type = persist.type;
 
var conString = "postgres://vagrant:vagrant@localhost/vagrant";


//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
before(function (done) {

	done();
});	

describe('creating a table using persist Tests', function () {

it('create person table', function (done) {
	// define some model objects 
	Phone = persist.define("Phone", {
	  "number": type.STRING
	});
	 
	Person = persist.define("Person", {
	  "firstname": type.STRING,
	  "lastname": type.STRING
	});
	 
	persist.connect({
	  driver: 'pg',
	  filename: 'vagrant',
	  trace: true
	}, function(err, connection) {
		if(err) {
        	console.error('error connecting', err);
      	}
      	else     console.log("Successfully connected to database");			
	  Person.using(connection).save(function(err, people) {
	    // people contains all the people 
	  });
	});
	done();
	});

	it('create person table using defineAuto', function (done) {

	console.log("Starting DefineAuto test");			

		Person = persist.define("Person", {
		  "firstname": type.STRING,
		  "lastname": type.STRING
		});

	persist.connect({
	  driver: 'pg',
	  filename: 'vagrant',
	  trace: true
	}, function(err, connection) {
		console.log("inside connect");	
		if (err) {
        	console.error('error connecting', err);
      	}
      	else     
      		console.log("Successfully connected to database");			

		persist.defineAuto("Person",{driver:pg, db:self.connection.db},function(err,model){
		console.log("inside connect");	
		
		person1 = new Person("first", "last");
		person1.save();
		if(err) {
        	console.error('error defineAuto', err);
      	}
      	else     
      		console.log("Successfully defineAuto");			
      	
		});
	});
	done();
	});
});
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
//	Phone = persist.define("Phone", {
//	  "number": type.STRING
//	});
//	 
//	Person = persist.define("Person", {
//	  "firstname": type.STRING,
//	  "lastname": type.STRING
//	});
	
//	[
//	  {
//	    "id": 1007299144,
//	    "created_at": "2016-01-27T11:00:15.486-06:00",
//	    "updated_at": "2016-03-26T19:30:59.746-05:00",
//	    "name": "Victor Cooper",
//	    "email_address": "victor@honchodesign.com",
//	    "personable_type": "User",
//	    "title": null,
//	    "admin": true,
//	    "owner": true,
//	    "avatar_url": "https://3.basecamp-assets.com/195539477/people/BAhpBEgqCjw=--8266bb0507508f3d46050d57b65924d5e2a005f3/avatar-64-x4",
//	    "company": {
//	      "id": 1033447818,
//	      "name": "Honcho Design"
//	    }
//	  },
//	  ...
//	]
	
	var sqlstr = "CREATE TABLE PEOPLE (ID TEXT, NAME TEXT);";
	 
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
		  console.log(err);		
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
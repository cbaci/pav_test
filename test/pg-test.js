var pg = require("pg");
var pgq = require("pg-query");

//var type = persist.type;
 
var conString = "postgres://pav:pavpwd@localhost/pavdb";

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
before(function (done) {
		var client = new pg.Client(conString);
		client.connect(function(err) {
			  if(err) {
			    console.error('could not connect to postgres in before', err);
			  } else console.error('connected to postgres in before');

			  client.query('SELECT NOW() AS "theTime"', function(err, result) {
			    if(err) {
			      console.error('error running query', err);
			    } else console.error('success running query in before');
			    console.log(result.rows[0].theTime);
			    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST) 
			  });
		});
    //client.end();
	done();
});	

describe('creating a table and insert using pg ', function () {

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
	
//	var sqlstr = "CREATE TABLE PEOPLE (ID TEXT, NAME TEXT);";
//	 
//	done();
//	});

	it('create person table using pg', function (done) {
	var client = new pg.Client(conString);
		client.connect(function(err) {
			  if(err) {
			        console.error('could not connect to postgres in create', err);
			  }
			  else 	console.error('connected to postgres in create');

		});

	 console.log("Start of create query");
	 var createquery = client.query("CREATE TABLE IF NOT EXISTS person(firstname varchar(64), lastname varchar(64));", function(err, result) {
	    if(err) {
	      console.error('error running create query', err);
	    } else console.error('success running create query in person table test');
	    console.log(result.rows[0].theTime);
	    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST) 
	  })
	 .on("commandComplete", function (result) {
			    console.log("End of create query");
		    //client.end(); - this endds the connection 
		});

    //client.end();
	done();
	});

	it('insert into person table using pg', function (done) {

		var client = new pg.Client(conString);
		client.connect();

		 var insertquery1 = client.query("INSERT INTO person(firstname, lastname) values($1, $2)", ['Ronald', 'McDonald']);
	 console.log("Start of insert 1 query");
			insertquery1.on("end", function (result) {
			    console.log("End of insert query 1");
			    client.end();
			});

		 var insertquery2 = client.query("INSERT INTO person(firstname, lastname) values($1, $2)", ['Mayor', 'McCheese']);
	 console.log("Start of insert 2 query");
			insertquery2.on("end", function (result) {
			    console.log("End of insert query 2");
			    client.end();
			});

		var query = client.query("SELECT firstname, lastname FROM person ORDER BY lastname, firstname");
		query.on("row", function (row, result) {
		    result.addRow(row);
		});
		query.on("end", function (result) {
		    console.log("End of select query");
			console.log(JSON.stringify(result.rows, null, "    "));
		});
	client.end();
	done();
	});
});
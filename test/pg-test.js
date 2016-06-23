var pg = require("pg");
var pgq = require("pg-query");

//var type = persist.type;
 
var conString = "postgres://pav:pavpwd@localhost/pavdb";


//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
before(function (done) {

	done();
});	

describe('creating a table using persist Tests', function () {

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
		client.connect();

		 client.query("CREATE TABLE IF NOT EXISTS emps(firstname varchar(64), lastname varchar(64))");
		 client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Ronald', 'McDonald']);
		 client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Mayor', 'McCheese']);

		var query = client.query("SELECT firstname, lastname FROM emps ORDER BY lastname, firstname");
		query.on("row", function (row, result) {
		    result.addRow(row);
		});
		query.on("end", function (result) {
		    console.log(JSON.stringify(result.rows, null, "    "));
		    client.end();
		});
	done();
	});
});
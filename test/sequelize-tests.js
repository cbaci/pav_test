var Sequelize = require('sequelize');
//var sequelize = new Sequelize('database', 'username', 'password');
// Or you can simply use a connection uri

var sequelize = new Sequelize('postgres://vagrant:vagrant@localhost:5432/vagrant');

describe('sequelize Tests', function () {

  /*
   *  The following tests are testing standard persist ORM functions
   */
    it('connect to database', function (done) {

    console.log('Connection testing....');

		sequelize
		  .authenticate()
		  .then(function(err) {
		    console.log('Connection has been established successfully.');
		  })
		  .catch(function (err) {
		    console.log('Unable to connect to the database:', err);
		  });
		done();
	});

    it('create table', function (done) {

    console.log('Creation testing....');

	var person = sequelize.define('person', {
		    firstName: {
		    	type: Sequelize.STRING,
		    	field: 'first_name' // Will result in an attribute that is firstName when user facing but first_name in the database
			},
			lastName: {
				type: Sequelize.STRING
			}
			}, {
				  freezeTableName: true // Model tableName will be the same as the model name
			});

    console.log('Creation testing....  ' + person.getTableName() );

			person.sync({force: true}).then(function () {
			  // Table created
			  return User.create({
			    firstName: 'John',
			    lastName: 'Hancock'
			  });
			});
	done();
	});

});
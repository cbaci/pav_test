'use strict';
/* eslint-env mocha */
//require('dotenv').load();

const persist = require("persist"),
      pg = require("pg");

let  type = persist.type;

const baseUrl = 'http://' + process.env.HOST + ':' + process.env.PORT;


var conString = "postgres://vagrant:vagrant@localhost/vagrant";

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
before(function (done) {
    pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      else console.log("Successfully connected to database via pg");

      client.query('SELECT $1::int AS number', ['1'], function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result.rows[0].number);
        //output: 1
      });
    });

    persist.connect({
      driver: 'pg',
      db: pg,
      trace: true
    }, function(err, connection) { 
    if(err) {
        return console.error('error fetching connection with persist', err);
      }
      console.log("Successfully connected to database via persist");
    });
    done();
});

//test suite
describe('persist Tests', function () {

  /*
   *  The following tests are testing standard persist ORM functions
   */
    it('set default database conn props', function (done) {
    persist.setDefaultConnectOptions({
        driver: 'pg',
        db: pg,
        trace: true});
    done();
    });

    it('should create Resource table', function (done) {

    var Resource = persist.define("Resource", {
      'id': type.STRING,
      'owner': type.STRING,
      'path': type.STRING,
      'description': type.STRING,
      'interface': type.STRING,
      'actions': type.STRING,
      'createdDate': { type: type.DATETIME },
      'lastUpdated': { type: type.DATETIME }
      });
//    done();
//    });
//});
//    it('should store new Resource', function (done) {
        var Resource1 = {
            'id': '00000000-0000-0000-0000-000000000000',
            'owner': {'id': '00000000-0000-0000-0000-000000000002'},
            'path': '/courses',
            'description': 'Harvard\'s courses',
            'interface': 'course-catalog',
            'actions': [
            {
              'name': 'read',
              'description': 'read courses'
            },
            {
              'name': 'create',
              'description': 'create courses'
            },
            {
              'name': 'update',
              'description': 'update courses'
            },
            {
              'name': 'delete',
              'description': 'delete courses'
            }
          ]
        };
//        done();
//    });

   persist.connect({
      driver: 'pg',
      db: pg,
      trace: true
    }, function(err, connection) { 
      if(err) 
          console.error('error connecting to pg', err);

      var new_res = new Resource(Resource1);

      new_res.save(connection, function(err, connection) {

      if(err) {
          return console.error('error saving resource', err);
        }
        else     console.log("Successfully connected to database and saved def-resources");
      });
    });
    done();
 });
});

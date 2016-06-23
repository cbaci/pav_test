/* eslint-env mocha */
require('dotenv').load();
require('database.json').load();

const expect = require('expect.js'),
      server = require('../server.js'),
      fakePersistenceService = require('../../node_modules/api-service-runtime/lib/fake-services/fake-persistence-service'),
      request = require('supertest'),
      jwt = require('jsonwebtoken'),
      Bluebird = require('bluebird'),
      persist = require("persist")

const baseUrl = 'http://' + process.env.HOST + ':' + process.env.PORT;

Bluebird.promisifyAll(request);



before(function (done) {
    server.startApiService();
    persist.connect({
      driver: 'sqlite3',
      filename: 'test.db',
      trace: true
    }, function(err, connection) { });
    done();
});

//Create the authorization token
let claims = {
    sub: 'rmackay',
    tenant: {
        id: '53b2f1d0641a0a0f000c2f16',
        alias: 'harvard'
    }
};

let bearerToken = 'Bearer ' + jwt.sign(claims, process.env.JWT_SHARED_SECRET);

const post = function (resourceName, data ) {
   return request(baseUrl)
      .post('/harvard/api/' + resourceName)
      .set('Content-Type', 'application/vnd.hedtech.' + resourceName + '.v1+json')
      .set('Accept', 'application/vnd.hedtech.' + resourceName + '.v1+json')
      .set('Authorization', bearerToken)
      .send(JSON.stringify(data))
      .expect(201)
      .expect('X-Hedtech-Media-Type', 'application/vnd.hedtech.' + resourceName + '.v1+json');
      //.end();//end()
};


//test suite
describe('persist Tests', function () {

  /*
   *  The following tests are testing standard ASR routes.  This is just a sanity check. Not all methods are tested.
   */

    it('should create table and store new Resource', function (done) {

    let def_resource = persist.define("Resource", {
      'id': type.STRING,
      'owner': type.STRING,
      'path': type.STRING,
      'description': type.STRING,
      'interface': type.STRING,
      'actions': type.STRING,
      'createdDate': { type: type.DATETIME, defaultValue: function() { return self.testDate1 }, dbColumnName: 'new_date' },
      'lastUpdated': { type: type.DATETIME }
    })

        let resource = {
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

    post('resources', resource).then(function (res) {
      expect(res.body).to.be.ok();
      done();
    });


    });

  it('should post a new Role', function (done) {

    let def_role = persist.define("Role", {
      'id': type.STRING,
      'owner': type.STRING,
      'name': type.STRING,
      'description': type.STRING,
      'interface': type.STRING,
      'grantees': type.STRING,
      'createdDate': { type: type.DATETIME, defaultValue: function() { return self.testDate1 }, dbColumnName: 'new_date' },
      'lastUpdated': { type: type.DATETIME }
    })

    let role = {
      'id': '00000000-0000-0000-0000-000000000000',
      'owner': {'id': '00000000-0000-0000-0000-000000000002'},
      'name': 'registrar',
      'description': 'Harvard\'s registrar',
      'grantees': [
        {'id': '00000000-0000-0000-0000-000000000003'},
        {'id': '00000000-0000-0000-0000-000000000004'}
      ]
    };

    post('roles', role).then(function (res) {
      expect(res.body).to.be.ok();
      done();
    });

  });

  it('should post a new Tenant', function (done) {

  let def_tenant = persist.define("Tenant", {
      'id': type.STRING,
      'alias': type.STRING,
      'name': type.STRING,
      'accountId': type.STRING,
      'issuer': type.STRING,
      'trustees': type.STRING,
      'createdDate': { type: type.DATETIME, defaultValue: function() { return self.testDate1 }, dbColumnName: 'new_date' },
      'lastUpdated': { type: type.DATETIME }
    })

    let tenant = {
      'id': '00000000-0000-0000-0000-000000000000',
      'alias': 'some alias',
      'name': 'Some University',
      'accountId': 'abc123def456ghi789',
      'issuer': {'id': '00000000-0000-0000-0000-000000000002'},
      'trustees': [
        {'id': '00000000-0000-0000-0000-000000000003'},
        {'id': '00000000-0000-0000-0000-000000000004'}
      ]
    };

    post('tenants', tenant).then(function (res) {
      expect(res.body).to.be.ok();
      done();
    });
  });

  it('should post a new Policy', function (done) {

  let def_policy = persist.define("Policy", {
      'id': type.STRING,
      'name': type.STRING,
      'deny': type.BINARY,
      'roles': type.STRING,
      'resources': type.STRING,
      'createdDate': { type: type.DATETIME, defaultValue: function() { return self.testDate1 }, dbColumnName: 'new_date' },
      'lastUpdated': { type: type.DATETIME }
    })
      
    let policy = {
      'id': '00000000-0000-0000-0000-000000000000',
      'name': 'My first Policy',
      'deny': false,
      'roles': [
        {'id': '00000000-0000-0000-0000-000000000001'},
        {'id': '00000000-0000-0000-0000-000000000002'},
        {'id': '00000000-0000-0000-0000-000000000003'}
      ],
      'resources': [
        {
          'resource': {'id': '00000000-0000-0000-0000-000000000004'},
          'actions': [
            'create',
            'read'
          ],
          'filters': [
            {
             'property': 'ssn',
             'visibility': 'hidden'
            },
            {
             'property': 'names[].last',
             'visibility': 'masked'
            }
          ]

        },
        {
          'resource': {'id': '00000000-0000-0000-0000-000000000005'},
          'actions': '*'
        }
      ],
      'conditions': {
        'timeOfDay': {
          'greaterThan': '00:00:01',
          'lessThan': '23:59:59'
        },
        'sourceip': '173.65.18.252/32'
      }
    };

    post('policies', policy).then(function (res) {
      expect(res.body).to.be.ok();
      done();
    });

  });

});


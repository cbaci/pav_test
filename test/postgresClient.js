'use strict';
/*the following directive disabls double vs single quote tests for this file*/
/*eslint quotes: [0]*/
/*eslint no-shadow: ["error", { "allow": ["err", "request", "result"] }]*/
/*eslint no-use-before-define: ["error", { "functions": false }]*/
/*eslint-env es6*/

const
  pool = require('./database.js').pool,
  log = require('./logger.js'),
  uuid = require('node-uuid'),
  _ = require('lodash');

let PostgresClient = function () {

    //Function to build information for the created by and modified by in database for tracking
        function buildMetadata (row) {
                let metadata = {};
                metadata.createdBy = row.created_by;
                metadata.createdOn = row.created_on.toISOString();
                metadata.modifiedBy = row.modified_by;
                metadata.modifiedOn = row.modified_on.toISOString();
                metadata.version = row.metadata_version;

                return metadata;
        }

    //Created for Running all Queries used a global database query system
    // Options:
    //  queryObj - Array holding objects for query execution format is displayed be low:
    //       [
    //          {
    //              "label" : Log Entry that will displayed
    //              "query" : Query statement that will be executed
    //              "values" : Values to be inserted into the query string
    //          }
    //       ]
        function runQuery (queryObj, callback){
            let self = this;
        pool.acquire(function (err, client){
            if (err){
                pool.release(client);
                callback(err);
            } else {
                for (var i = 0; queryObj[i]; i++){
                    log.info('Running Query: ' + queryObj[i].label + ' - Query: ' + queryObj[i].query + ' - Values: ' + queryObj[i].values);
                    client.query(queryObj[i].query, queryObj[i].values, function (err, result){
                        if (err){
                            log.info('SQL Error: ' + err);
                            pool.release(client);
                            callback(err);
                        } else {
                            pool.release(client);
                            callback(null, prepareResults(result));
                        }
                    });
               }
            }
        });
        }

        //Create the tenants table and keys on the database
        function createTable (callback) {
                runQuery([
                    {
                        label: 'Creating Table: tenants',
                        query: "CREATE TABLE tenants (id varchar(40) PRIMARY KEY, created_by varchar(40) NOT NULL, created_on timestamp NOT NULL, modified_by varchar(40) NOT NULL, modified_on timestamp NOT NULL, metadata_version varchar(40) NOT NULL, data jsonb NOT NULL)",
                        values: []
                    }, {
                        label: 'Create index for tenant_alias',
                        query: "create unique index tenant_alias on tenants((data->>'alias'))",
                        values: []
                    }, {
                        label: 'Create Index on tenant_accountid',
                        query: "create unique index tenant_accountid on tenants((data->>'accountId'))",
                        values: []
                    }], callback);
        }

        //Results that are to be perpared for other functions to use
    function prepareResults (postgresResult) {
        log.info('PG RESULT ' + JSON.stringify(postgresResult));
        let results = {};
        let data = [];
        _.each(postgresResult.rows, function (row) {
               let record = row.data;
               record.id = row.id;
               record.metadata = buildMetadata(row);
               data.push(record);
        });

        results.data = data;
        results.count = postgresResult.rowCount;

        log.debug('Results prepared: ' + JSON.stringify(results));

        return results;
    }

    //Create table for internal users to be stored in
        function createTableInternal (callback) {
                runQuery([
                    {
                        label: 'Creating Table: internal_users',
                        query: "CREATE TABLE internal_users (id varchar(40) PRIMARY KEY, created_by varchar(40) NOT NULL, created_on timestamp NOT NULL, modified_by varchar(40) NOT NULL, modified_on timestamp NOT NULL default CURRENT_TIMESTAMP, metadata_version varchar(40) NOT NULL, data jsonb NOT NULL)",
                        values: []
                    }, {
                        label: 'Create index for tenant_users_tenants',
                        query: "create unique index internal_users_tenants on internal_users((data->>'internalUser'))",
                        values: []
                    }], callback);
        }

    //Add an Internal User to the system for usage
        function addInternalUser (params, callback){
                let self = this;
                delete params.tenant.tenant;
                let id = uuid.v4();
                let now = new Date();
                params.tenant.id = id;
                runQuery([{
                    label: 'Adding Users to Internal Table',
            query: "INSERT INTO internal_users (id, created_by, created_on, modified_by, modified_on, metadata_version, data) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_by, created_on, modified_by, modified_on, metadata_version, data",
            values: [id, params.context.user, now, params.context.user, now, params.version, params.tenant]
                }], function (err, result){
             if (err === 'error: relation "internal_users" does not exist'){
                createTableInternal(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        self.addInternalUser(params, callback);
                    }
                });
            } else {
                if (result.rowCount > 0){
                    delete result.data.tenant;
                    if (result.data.internalUser && (!result.data.globalShare)){
                        result.data.globalShare = {
                            'publish': true,
                            'consume': true
                        };
                    }
                    delete result.data.internalUser;
                }
                callback(null, result);
             }
        });
        }

    //Pull all Tenants from the database
        this.findAll = function (params, callback) {
            log.info(params);
                runQuery([{
                        label: 'Select all from tenants',
                        query: "SELECT id, created_by, created_on, modified_by, modified_on, metadata_version, data FROM tenants",
                        values: []
                    }], callback);
        };

    //Select the internal user that is in the internal_users table
        this.findInternal = function (params, callback){
                let self = this;
                runQuery([{
                    label: 'Select Internal User tenant data',
            query: "SELECT tenants.id, tenants.created_by, tenants.created_on, tenants.modified_by, tenants.modified_on, tenants.metadata_version, tenants.data FROM tenants left join internal_users on tenants.data->>'id' = internal_users.data->>'tenantId' WHERE internal_users.data->>'internalUser' = $1",
            values: [params]
                }], function (err, result){
             if (err === 'error: relation "internal_users" does not exist'){
                createTableInternal(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        self.findInternal(params, callback);
                    }
                });
             } else if (err === 'error: relation "tenants" does not exist'){
               createTable(function (err) {
                   if (err) {
                    callback(err);
                } else {
                       self.findInternal(params, callback);
                   }
               });
            } else {
                console.error("RESULT!!" + JSON.stringify(result));
                if (result.rowCount > 0){
                    delete result.data.tenant;
                    if (result.data.internalUser && (!result.data.globalShare)){
                        //To be added to UI as pass through to allow custom flags
                        result.data.globalShare = {
                            'publish': true,
                            'consume': true
                        };
                    }
                    delete result.data.internalUser;
                }
                callback(null, result);
             }
        });
        };

    //Add an internal User to the database to be linked as an internal team
        this.insertInternalUser = function (params, callback){
                let self = this;
                params.tenant.id = uuid.v4();
                let now = new Date();

                let tenant = {};
                tenant.accountId = 'Internal' + params.tenant.tenant;
                self.findByAccountId(tenant, function (err, result){
                        if (err) {
                            callback(err);
                        } else if (result.count === 0) {
                                         let tenantparams = params;
                                        tenantparams.tenant.alias = 'Internal' + params.tenant.tenant.toLowerCase().replace('s/\ /g', '').substring(0, 5).replace(/ /g, '');
                                        tenantparams.tenant.name = params.tenant.tenant;
                                        tenantparams.tenant.id = uuid.v4();
                                        tenantparams.tenant.defaultDataStore = params.tenant.defaultDataStore;
                                        tenantparams.tenant.accountId = tenant.accountId;
                                        tenantparams.tenant.globalShare = {
                                                'publish': true,
                                                'consume': true
                                        };
                                         self.insert(tenantparams, function (err, result){
                                                 if (err) {
                                                    callback(err);
                                                  } else {
                                                         params.tenant.tenantId = result.data[0].id;
                                                         addInternalUser(params, callback);
                                                 }
                                         });
                                 } else {
                                         params.tenant.tenantId = result.data[0].id;
                                        addInternalUser(params, callback);
                                 }
                });
        };

    //Pull one tenant information from tenants table
        this.findById = function (params, callback) {
                runQuery([
                    {
                        label: 'Select from tenants: ' + params.id,
                        query: "SELECT id, created_by, created_on, modified_by, modified_on, metadata_version, data FROM tenants WHERE id = $1",
                        values: [ params.id ]
                    }], function (err, results){
                        if (err) {
                            log.info('ERROR: ' + err);
                            } else {
                                results.data = results.data[0];
                            callback(null, results);
                        }
                    });
        };

    // Find a tenant based off user email
        this.findByAccountId = function (params, callback) {
                let self = this;
                runQuery([{
                    label: 'Select Tenant information from tenant table',
            query: "SELECT id, created_by, created_on, modified_by, modified_on, metadata_version, data FROM tenants WHERE data->>'accountId' = $1",
            values: [ params.accountId ]
                }], function (err, result){
             if (err === 'error: relation "tenants" does not exist') {
                createTable(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        self.findByAccountId(params, callback);
                    }
                });
             } else {
                callback(null, result);
             }
        });
        };

    //Insert information into the tenants table for creating a tenant
        this.insert = function (params, callback) {
            let self = this;
            let id = uuid.v4();
            let now = new Date();

            let tenant = params.tenant;
            tenant.id = id;
                runQuery([
                    {
                        label: "Adding to tenants " + tenant.name,
                        query: "INSERT INTO tenants(id, created_by, created_on, modified_by, modified_on, metadata_version, data) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_by, created_on, modified_by, modified_on, metadata_version, data",
                        values: [id, params.context.user, now, params.context.user, now, params.version, tenant]
                    }], function (err, result){
                if (err === 'error: relation "tenants" does not exist') {
                    createTable(function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            self.insert(params, callback);
                        }
                    });
                } else {
                    callback(null, result);
                }
            });
        };

    //Update information about a tenant in the tenants table
        this.update = function (params, callback) {
                runQuery([
                    {
                        label: "Update Tenants: " + params.tenant,
                        query: "UPDATE tenants SET data = $1, modified_by = $2, modified_on = $3 , metadata_version = $4 WHERE id = $5 RETURNING id, created_by, created_on, modified_by, modified_on, metadata_version, data",
                        values: [params.tenant, params.context.user, new Date(), params.version, params.id]
                    }], function (err, results){
                        if (err) {
                            log.info('ERROR: ' + err);
                            } else {
                                results.data = results.data[0];
                            callback(null, results);
                        }
                    });
        };

    //Drop a tenant from the system
        this.del = function (params, callback) {
                runQuery([
                    {
                        label: 'Delete from tenants: ' + params.id,
                        query: "delete from tenants where id = $1",
                        values: [ params.id ]
                    }], function (err, results){
                        if (err) {
                            log.info('ERROR: ' + err);
                            } else {
                                results.data = results.data[0];
                            callback(null, results);
                        }
                    });
        };

    //Drop an internal user from the system
        this.delInternalUser = function (params, callback) {
                runQuery([
                    {
                        label: 'Delete Internal User: ' + params.id,
                        query: "delete from internal_users where data->>'internalUser' = $1",
                        values: [ params.id ]
                    }], callback);
        };
};

module.exports = PostgresClient;

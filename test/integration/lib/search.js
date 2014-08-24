var config = require('../testconfig.json'),
    assert = require('chai').assert,
    rets = require('../../../index.js'),
    utils = require('../../../lib/utils.js'),
    xmlParser = require('xml2js').parseString;

var TEST_TIMEOUT = 10000;

describe('test client.searchRets functionality', function() {
    it('Client invokes rets search query', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){

            var tMinus5Days = new Date();
            tMinus5Days.setDate(tMinus5Days.getDate()-1);

            var dateStr = tMinus5Days.toISOString();

            var queryOptions = {
                searchType:config.testResourceType,
                class:config.testClassType,
                query:"MatrixModifiedDT=" + dateStr.substring(0, dateStr.length-1) + "+"
            };

            client.searchRets(queryOptions);

            client.once('search.success', function(data) {
                assert.isNotNull(data, "Data is present");
                xmlParser(data, function(err, result) {
                    utils.replyCodeCheck(result, function(error, data){
                        assert.ifError(error);
                    });
                });

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });
            });
        });

        client.once("search.failure", function(error){
            assert.ifError(error, "Search RETS call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });

    });
});


describe('test client.search functionality', function() {
    it('Client invokes rets targeted search and parsing query', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){
            //ensure that search results match fields from table metadata
            client.getTable(config.testResourceType, config.testClassType);
            var fields;

            client.once('metadata.table.success', function(table) {
                assert.isNotNull(table, "Table data is present");

                var tMinus5Days = new Date();
                tMinus5Days.setDate(tMinus5Days.getDate()-1);

                var dateStr = tMinus5Days.toISOString();
                fields = table.Fields;

                client.query(
                    config.testResourceType,
                    config.testClassType,
                    "MatrixModifiedDT=" + dateStr.substring(0, dateStr.length-1) + "+");
            });

            client.once('metadata.table.failure', function(error){
                assert.ifError(error);
            });

            client.once('query.success', function(data) {
                assert.isNotNull(data, "Data is present");
                for(var dataItem = 0; dataItem < data.length; dataItem++) {
                    for(var fieldItem = 0; fieldItem < fields.length; fieldItem++) {
                        assert.isNotNull(data[dataItem][fields[fieldItem].SystemName], "The field " + fields[fieldItem].SystemName + " is not found within record.");
                    }
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });
            });
        });

        client.once("query.failure", function(error){
            assert.ifError(error, "Query call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});


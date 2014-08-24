var config = require('../testconfig.json'),
    assert = require('chai').assert,
    rets = require('../../../index.js'),
    utils = require('../../../lib/utils.js'),
    xmlParser = require('xml2js').parseString;

var TEST_TIMEOUT = 10000;

describe('test client.getObject functionality', function() {
    it('Client invokes getObject to retrieve resource object', function(done) {
        var mochaTest = this;

        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){
            client.getObject(config.testResourceType, config.testObjectPhotoType, config.testObjectId);

            client.once('object.success', function(resp) {
                assert.isNotNull(resp.contentType, "HTTP header content-type is present");
                assert.isNotNull(resp.data, "Data is present");

                var contentType = resp.contentType;
                var mime = contentType.match(/image\/(\w+)/i)[0];

                assert(mime, "Mime is present");

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });
            });
        });

        client.once("object.failure", function(error){
            assert.ifError(error, "Object call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getPhotos functionality', function() {
    it('Client invokes getPhotos to retrieve resource photo list', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){
            client.getPhotos(config.testResourceType, config.testObjectPhotoType, config.testObjectId);

            client.once('photos.success', function(dataList) {

                assert.isNotNull(dataList, "dataList is present");
                assert.isArray(dataList, "dataList is an array");

                for(var i = 0; i < dataList.length; i++) {
                    assert(dataList[i].buffer);
                    assert(dataList[i].mime);
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });
            });
        });

        client.once("photos.failure", function(error){
            assert.ifError(error, "Photos call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });

    });
});
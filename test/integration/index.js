var config = require('./testconfig.json'),
    assert = require('chai').assert,
    rets = require('../../index.js');

var TEST_TIMEOUT = 10000;

describe('test login and logout functionality', function() {
    it('Client logs in and then logs out', function(done) {
        this.timeout(TEST_TIMEOUT);

        var client = rets.getClient(config.url, config.username, config.password);

        assert(client, "Client is present");

        client.once('connection.success', function(){
            assert(client.retsVersion, "RETS version is present");
            assert(client.retsServer, "RETS server is present");
            assert(client.memberName, "memberName is present");
            assert(client.user, "user is present");
            assert(client.broker, "broker is present");
            assert(client.metadataVersion, "metadataVersion is present");
            assert(client.metadataTimestamp, "metadataTimestamp is present");
            assert(client.minMetadataTimestamp, "minMetadataTimestamp is present");

            client.logout();

            client.once("logout.success", function(){
                done();
            });
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test login failure event', function() {
    it('Client deliberately fails login and tests login.failure event', function(done) {
        this.timeout(TEST_TIMEOUT);
        var client = rets.getClient(config.url, config.username, "this should fail");

        assert(client, "Client is present");

        client.once('connection.failure', function(error){
            assert(error, "Error should be present");
            assert(error.replyCode === 401, "replyCode should be 401");
            done();
        });
    });
});

describe('test login success and logout success event', function() {
    it('Client logs in and then logs out on login.success and logout.success events', function(done) {
        this.timeout(TEST_TIMEOUT);
        var client = rets.getClient(config.url, config.username, config.password);

        assert(client, "Client is present");

        client.once('connection.success', function(){

            client.logout();

            client.once('logout.success', function(){
                done();
            });
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('logout failure event', function() {
    it('Client invokes logout a second time.', function(done) {
        this.timeout(TEST_TIMEOUT);
        var client = rets.getClient(config.url, config.username, config.password);

        assert(client, "Client is present");

        client.once('connection.success', function(){
            client.logout();

            client.once('logout.success', function(){
                client.logout();

                client.once('logout.failure', function(error){
                    assert(error, "An error should be present.");
                    assert(error.replyCode === 401, "replyCode should be 401");
                    done();
                });
            });
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});


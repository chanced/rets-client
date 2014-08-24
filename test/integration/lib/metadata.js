var config = require('../testconfig.json'),
    assert = require('chai').assert,
    rets = require('../../../index.js'),
    utils = require('../../../lib/utils.js'),
    xmlParser = require('xml2js').parseString;

var TEST_TIMEOUT = 10000;

describe('test client.getMetadata functionality', function() {
    it('Client invokes getMetadata to retrieve resources metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);
        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once("connection.success", function(){

            client.getMetadata("METADATA-RESOURCE", "0", "COMPACT", function(error, data) {
                assert.ifError(error);
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

        client.once("metadata.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });

    });
});
describe('test client.getSystem functionality', function() {
    it('Client invokes getSystem to retrieve system metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);
        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once("connection.success", function(){

            client.getSystem(function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");

                assert(data.metadataVersion, "metadataVersion is present");
                assert(data.metadataDate, "metadataDate is present");
                assert(data.systemId, "systemId is present");
                assert(data.systemDescription, "systemDescription is present");

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });
            });
        });

        client.once("metadata.system.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.system.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});


describe('test client.getResources meta functionality', function() {
    it('Client retrieves resources metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);

        client.once("connection.success", function(){

            client.getResources(function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.Version, "Version field is present");
                assert(data.Date, "Date field is present");
                assert(data.Resources, "Resources field is present");
                assert.typeOf(data.Resources, 'array', "data.Resources is an array");
                for(var dataItem = 0; dataItem < data.Resources.length; dataItem++) {
                    assert.isNotNull(data.Resources[dataItem]);
                    assert(data.Resources[dataItem].ResourceID, "data.Resources["+dataItem+"].ResourceID field is present");
                    assert(data.Resources[dataItem].StandardName, "data.Resources["+dataItem+"].StandardName field is present");
                    assert(data.Resources[dataItem].VisibleName, "data.Resources["+dataItem+"].VisibleName field is present");
                    assert(data.Resources[dataItem].ObjectVersion, "data.Resources["+dataItem+"].ObjectVersion field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.resources.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.resources.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getAllForeignKeys meta functionality', function() {
    it('Client retrieves a list of all foreign keys metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        assert(client, "Client is present");
        mochaTest.timeout(TEST_TIMEOUT)
        client.once("connection.success", function(){

            client.getAllForeignKeys(function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.ForeignKeys, "data.ForeignKeys is present");
                assert.typeOf(data.ForeignKeys, 'array', "data.ForeignKeys is an array");
                for(var fkItem = 0; fkItem < data.ForeignKeys.length; fkItem++) {
                    assert.isNotNull(data.ForeignKeys[fkItem]);
                    assert(data.ForeignKeys[fkItem].ForeignKeyID, "data.ForeignKeys["+fkItem+"] ForeignKeyID field is present");
                    assert(data.ForeignKeys[fkItem].ParentResourceID, "data.ForeignKeys["+fkItem+"] ParentResourceID field is present");
                    assert(data.ForeignKeys[fkItem].ParentClassID, "data.ForeignKeys["+fkItem+"] ParentClassID field is present");
                    assert(data.ForeignKeys[fkItem].ParentSystemName, "data.ForeignKeys["+fkItem+"] ParentSystemName field is present");
                    assert(data.ForeignKeys[fkItem].ChildResourceID, "data.ForeignKeys["+fkItem+"] ChildResourceID field is present");
                    assert(data.ForeignKeys[fkItem].ChildClassID, "data.ForeignKeys["+fkItem+"] ChildClassID field is present");
                    assert(data.ForeignKeys[fkItem].ChildSystemName, "data.ForeignKeys["+fkItem+"] ChildSystemName field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.all.foreignkeys.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.all.foreignkeys.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getForeignKey meta functionality', function() {
    it('Client retrieves an individual foreign key metadata entry', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);
        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once("connection.success", function(){

            client.getForeignKeys(config.testResourceType, function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");

                assert(data.ForeignKeys, "data.ForeignKeys is present");
                assert.typeOf(data.ForeignKeys, 'array', "data.ForeignKeys is an array");

                for(var fkItem = 0; fkItem < data.ForeignKeys; fkItem++) {
                    assert.isNotNull(data.ForeignKeys[fkItem]);
                    assert(data.ForeignKeys[fkItem].ForeignKeyID, "data.ForeignKeys["+fkItem+"] ForeignKeyID field is present");
                    assert(data.ForeignKeys[fkItem].ParentResourceID, "data.ForeignKeys["+fkItem+"] ParentResourceID field is present");
                    assert(data.ForeignKeys[fkItem].ParentClassID, "data.ForeignKeys["+fkItem+"] ParentClassID field is present");
                    assert(data.ForeignKeys[fkItem].ParentSystemName, "data.ForeignKeys["+fkItem+"] ParentSystemName field is present");
                    assert(data.ForeignKeys[fkItem].ChildResourceID, "data.ForeignKeys["+fkItem+"] ChildResourceID field is present");
                    assert(data.ForeignKeys[fkItem].ChildClassID, "data.ForeignKeys["+fkItem+"] ChildClassID field is present");
                    assert(data.ForeignKeys[fkItem].ChildSystemName, "data.ForeignKeys["+fkItem+"] ChildSystemName field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.foreignkeys.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.foreignkeys.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});


describe('test client.getAllClass meta functionality', function() {
    it('Client retrieves a list of all class metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);
        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once("connection.success", function() {

            client.getAllClass(function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.Classes, "data.Classes is present");
                assert.typeOf(data.Classes, 'array', "data.Classes is an array");
                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");
                for(var classItem = 0; classItem < data.Classes.length; classItem++) {

                    assert.isNotNull(data.Classes[classItem]);
                    assert(data.Classes[classItem].ClassName, "data.Classes["+classItem+"] ClassName field is present");
                    assert(data.Classes[classItem].StandardName, "data.Classes["+classItem+"] StandardName field is present");
                    assert(data.Classes[classItem].VisibleName, "data.Classes["+classItem+"] VisibleName field is present");
                    assert(data.Classes[classItem].TableVersion, "data.Classes["+classItem+"] TableVersion field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.all.class.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.all.class.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });

    });
});

describe('test client.getClass meta functionality', function() {
    it('Client retrieves an individual class metadata entry', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);
        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once("connection.success", function() {

            client.getClass(config.testResourceType, function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");

                assert(data.Classes, "data.Classes is present");
                assert.typeOf(data.Classes, 'array', "data.Classes is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");

                for(var classItem = 0; classItem < data.Classes.length; classItem++) {
                    assert.isNotNull(data.Classes[classItem]);
                    assert(data.Classes[classItem].ClassName, "data.Classes["+classItem+"] ClassName field is present");
                    assert(data.Classes[classItem].StandardName, "data.Classes["+classItem+"] StandardName field is present");
                    assert(data.Classes[classItem].VisibleName, "data.Classes["+classItem+"] VisibleName field is present");
                    assert(data.Classes[classItem].TableVersion, "data.Classes["+classItem+"] TableVersion field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.class.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.class.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });

    });
});

describe('test client.getAllTable meta functionality', function() {
    it('Client retrieves a list of all table metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function() {

            client.getAllTable(function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.Fields, "data.Fields is present");
                assert.typeOf(data.Fields, 'array', "data.Fields is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");
                assert(data.Class, "data.Class field is present");

                for(var fieldItem = 0; fieldItem < data.Fields.length; fieldItem++) {

                    assert.isNotNull(data.Fields[fieldItem]);
                    assert(data.Fields[fieldItem].MetadataEntryID, "data.Fields["+fieldItem+"] MetadataEntryID field is present");
                    assert(data.Fields[fieldItem].SystemName, "data.Fields["+fieldItem+"] SystemName field is present");
                    assert(data.Fields[fieldItem].ShortName, "data.Fields["+fieldItem+"] ShortName field is present");
                    assert(data.Fields[fieldItem].LongName, "data.Fields["+fieldItem+"] LongName field is present");
                    assert(data.Fields[fieldItem].DataType, "data.Fields["+fieldItem+"] DataType field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.all.table.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.all.table.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getTable meta functionality', function() {
    it('Client retrieves an individual table metadata entry', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){

            client.getTable(config.testResourceType, config.testClassType, function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.Fields, "data.Fields is present");
                assert.typeOf(data.Fields, 'array', "data.Fields is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");
                assert(data.Class, "data.Class field is present");

                for(var tableItem = 0; tableItem < data.Fields.length; tableItem++) {
                    assert.isNotNull(data.Fields[tableItem]);
                    assert(data.Fields[tableItem].MetadataEntryID, "data.Fields["+tableItem+"] MetadataEntryID field is present");
                    assert(data.Fields[tableItem].SystemName, "data.Fields["+tableItem+"] SystemName field is present");
                    assert(data.Fields[tableItem].ShortName, "data.Fields["+tableItem+"] ShortName field is present");
                    assert(data.Fields[tableItem].LongName, "data.Fields["+tableItem+"] LongName field is present");
                    assert(data.Fields[tableItem].DataType, "data.Fields["+tableItem+"] DataType field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.table.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.table.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getAllLookups meta functionality', function() {
    it('Client retrieves a list of all lookups metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){

            client.getAllLookups(function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");

                assert(data.Lookups, "data.Lookups is present");
                assert.typeOf(data.Lookups, 'array', "data.Lookups is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");


                for(var lookupItem = 0; lookupItem < data.Lookups.length; lookupItem++) {

                    assert.isNotNull(data.Lookups[lookupItem]);
                    assert(data.Lookups[lookupItem].MetaDataEntryID, "data.Lookups["+lookupItem+"] MetadataEntryID field is present");
                    assert(data.Lookups[lookupItem].LookupName, "data.Lookups["+lookupItem+"] LookupName field is present");
                    assert(data.Lookups[lookupItem].VisibleName, "data.Lookups["+lookupItem+"] VisibleName field is present");
                    assert(data.Lookups[lookupItem].Version, "data.Lookups["+lookupItem+"] Version field is present");
                    assert(data.Lookups[lookupItem].Date, "data.Lookups["+lookupItem+"] Date field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.all.lookups.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.all.lookups.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getLookups meta functionality', function() {
    it('Client retrieves an individual lookups metadata entry', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){

            client.getLookups(config.testResourceType, function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.Lookups, "data.Lookups is present");
                assert.typeOf(data.Lookups, 'array', "data.Lookups is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");
                for(var lookupItem = 0; lookupItem < data.Lookups.length; lookupItem++) {

                    assert.isNotNull(data.Lookups[lookupItem]);
                    assert(data.Lookups[lookupItem].MetaDataEntryID, "data.Lookups["+lookupItem+"] MetadataEntryID field is present");
                    assert(data.Lookups[lookupItem].LookupName, "data.Lookups["+lookupItem+"] LookupName field is present");
                    assert(data.Lookups[lookupItem].VisibleName, "data.Lookups["+lookupItem+"] VisibleName field is present");
                    assert(data.Lookups[lookupItem].Version, "data.Lookups["+lookupItem+"] Version field is present");
                    assert(data.Lookups[lookupItem].Date, "data.Lookups["+lookupItem+"] Date field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.lookups.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.lookups.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getAllLookupTypes meta functionality', function() {
    it('Client retrieves a list of all lookupTypes metadata', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){

            client.getAllLookupTypes(function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.LookupTypes, "data.LookupTypes is present");
                assert.typeOf(data.LookupTypes, 'array', "data.LookupTypes is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");
                assert(data.Lookup, "data.Lookup field is present");

                for(var lookupTypeItem = 0; lookupTypeItem < data.LookupTypes.length; lookupTypeItem++) {

                    assert.isNotNull(data.LookupTypes[lookupTypeItem]);

                    assert(data.LookupTypes[lookupTypeItem].MetadataEntryID, "data.LookupTypes["+lookupTypeItem+"] MetadataEntryID field is present");
                    assert(data.LookupTypes[lookupTypeItem].LongValue, "data.LookupTypes["+lookupTypeItem+"] LongValue field is present");
                    assert(data.LookupTypes[lookupTypeItem].ShortValue, "data.LookupTypes["+lookupTypeItem+"] ShortValue field is present");
                    assert(data.LookupTypes[lookupTypeItem].Value, "data.LookupTypes["+lookupTypeItem+"] Value field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.all.lookupTypes.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.all.lookupTypes.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getLookupTypes meta functionality', function() {
    it('Client retrieves an individual lookupTypes metadata entry', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){

            client.getLookupTypes(config.testResourceType, config.testLookupType, function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.LookupTypes, "data.LookupTypes is present");
                assert.typeOf(data.LookupTypes, 'array', "data.LookupTypes is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");
                assert(data.Lookup, "data.Lookup field is present");

                for(var lookupItem = 0; lookupItem < data.LookupTypes.length; lookupItem++) {

                    assert.isNotNull(data.LookupTypes[lookupItem]);
                    assert(data.LookupTypes[lookupItem].MetadataEntryID, "data["+lookupItem+"] MetadataEntryID field is present");
                    assert(data.LookupTypes[lookupItem].LongValue, "data["+lookupItem+"] LongValue field is present");
                    assert(data.LookupTypes[lookupItem].ShortValue, "data["+lookupItem+"] ShortValue field is present");
                    assert(data.LookupTypes[lookupItem].Value, "data["+lookupItem+"] Value field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.lookupTypes.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.lookupTypes.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

describe('test client.getObjectMeta meta functionality', function() {
    it('Client retrieves a resource object metadata entry', function(done) {
        var mochaTest = this;
        var client = rets.getClient(config.url, config.username, config.password);

        mochaTest.timeout(TEST_TIMEOUT);
        assert(client, "Client is present");

        client.once('connection.success', function(){

            client.getObjectMeta(config.testResourceType, function(error, data) {
                assert.ifError(error);
                assert.isNotNull(data, "Data is present");
                assert(data.Objects, "data.Objects is present");
                assert.typeOf(data.Objects, 'array', "data.Objects is an array");

                assert(data.Version, "data.Version field is present");
                assert(data.Date, "data.Date field is present");
                assert(data.Resource, "data.Resource field is present");

                for(var objectItem = 0; objectItem < data.Objects.length; objectItem++) {

                    assert.isNotNull(data.Objects[objectItem]);
                    assert(data.Objects[objectItem].ObjectType, "data.Objects["+objectItem+"] ObjectType field is present");
                    assert(data.Objects[objectItem].MIMEType, "data.Objects["+objectItem+"] MIMEType field is present");
                    assert(data.Objects[objectItem].MetaDataEntryID, "data.Objects["+objectItem+"] MetaDataEntryID field is present");
                    assert(data.Objects[objectItem].VisibleName, "data.Objects["+objectItem+"] VisibleName field is present");
                }

                client.logout(function(error){
                    assert.ifError(error);
                    done();
                });

            });
        });

        client.once("metadata.object.success", function(data) {
            assert(data, "data is present");
        });

        client.once("metadata.object.failure", function(error){
            assert.ifError(error, "Metadata call should not have failed");
        });

        client.once("connection.failure", function(error){
            assert.ifError(error, "getClient failure");
        });
    });
});

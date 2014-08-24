var logger = require('winston'),
    EventEmitter = require('events').EventEmitter,
    assert = require("assert"),
    util = require('util'),
    auth = require('./lib/auth.js'),
    metadata = require('./lib/metadata.js'),
    search = require('./lib/search.js'),
    object = require('./lib/object.js');

var KEY_MEMBER_NAME = "MemberName";
var KEY_USER = "User";
var KEY_BROKER = "Broker";
var KEY_LOGIN = "Login";
var KEY_LOGOUT = "Logout";
var KEY_SEARCH = "Search";
var KEY_ACTION = "Action";
var KEY_GET_OBJECT = "GetObject";
var KEY_GET_METADATA = "GetMetadata";
var KEY_METADATA_VERSION = "MetadataVersion";
var KEY_METADATA_TIMESTAMP = "MetadataTimestamp";
var KEY_MIN_METADATA_TIMESTAMP = "MinMetadataTimestamp";
var KEY_RETS_VERSION = "retsVersion";
var KEY_RETS_SERVER = "retsServer";

module.exports = new EventEmitter();

/**
 * Connects to a RETS Service and creates a RETS client instance.
 *
 * @param loginUrl RETS login URL (i.e http://<MLS_DOMAIN>/rets/login.ashx)
 * @param username username credential
 * @param password password credential
 *
 * @event connection.success Connection succeeded.
 * @event connection.failure(error) Failed to connect.
 *
 * @return RETS Client
 */
module.exports.getClient = function(loginUrl, username, password) {

    var client = new Client();

    auth.login(loginUrl, username, password, function(error, systemData) {
        if (error) {

            client.emit('connection.failure', error);

            return;
        }

        client.configure(systemData);

        client.emit('connection.success');
    });

    return client;
};

/**
 * RETS Client Object
 *
 * @constructor Creates a new RETS Client object.
 */
var Client = function Client() {};

/** Rets Client inherits from EventEmitter **/
util.inherits(Client, EventEmitter);

/**
 * Configures Rets Client
 * @param systemData RETS system URL data object (Login, GetMetadata, GetObject, etc.)
 */
Client.prototype.configure = function(systemData) {

    var self = this;

    self.systemData = systemData;

    self.retsVersion = self.systemData[KEY_RETS_VERSION];
    self.retsServer = self.systemData[KEY_RETS_SERVER];
    self.memberName = self.systemData[KEY_MEMBER_NAME];
    self.user = self.systemData[KEY_USER];
    self.broker = self.systemData[KEY_BROKER];
    self.metadataVersion = self.systemData[KEY_METADATA_VERSION];
    self.metadataTimestamp = self.systemData[KEY_METADATA_TIMESTAMP];
    self.minMetadataTimestamp = self.systemData[KEY_MIN_METADATA_TIMESTAMP];

    //metadata module
    self.metadataModule = metadata(self.systemData[KEY_GET_METADATA]);
    //search module
    self.searchModule = search(self.systemData[KEY_SEARCH]);
    //object module
    self.objectModule = object(self.systemData[KEY_GET_OBJECT]);
};

/**
 * Private method that handles client interface logic.
 *
 * @param client The RETS client instance
 * @param error Error object (optional)
 * @param data The RETS data (optional)
 * @param eventSuccess Success event name (optional)
 * @param eventFailure Failure event name (optional)
 * @param callback Callback function (optional)
 */
var processRetsResponse = function(client, error, data, eventSuccess, eventFailure, callback) {

    assert(client, "Client is present");

    if (error) {
        if (callback)
            callback(error);

        if (eventFailure)
            client.emit(eventFailure, error);

        return;
    }

    if (callback)
        callback(error, data);

    if (eventSuccess)
        client.emit(eventSuccess, data);
};


/**
 * Logout RETS user.
 *
 * @param url Logout URL
 * @param callback(error)
 *
 * @event logout.success Disconnect was successful
 * @event logout.failure(error) Disconnect failure
 *
 */
Client.prototype.logout = function(callback) {
    var self = this;

    auth.logout(self.systemData[KEY_LOGOUT], function(error){
        processRetsResponse(self, error, null, "logout.success", "logout.failure", callback);
    });
};

/*
 * Retrieves RETS Metadata.
 *
 * @param type Metadata type (i.e METADATA-RESOURCE, METADATA-CLASS)
 * @param id Metadata id
 * @param format Data format (i.e. COMPACT, COMPACT-DECODED)
 * @param callback(error, data) (optional)
 *
 * @event metadata.success(data) Metadata call is successful
 * @event metadata.failure(error) Metadata call failed.
 */
Client.prototype.getMetadata = function(type, id, format, callback) {

    var self = this;

    self.metadataModule.getMetadata(type, id, format, function(error, data) {
        processRetsResponse(self, error, data, "metadata.success", "metadata.failure", callback);
    });
};

/**
 * Helper that retrieves RETS system metadata
 *
 * @param callback(error, data) (optional)
 *
 * @event metadata.system.success(data) Metadata call is successful
 * @event metadata.system.failure(error) Metadata call failed
 */
Client.prototype.getSystem = function(callback) {
    var self = this;

    self.metadataModule.getSystem(function(error, data) {
        processRetsResponse(self, error, data, "metadata.system.success", "metadata.system.failure", callback);
    });
};

/**
 * Helper that retrieves RETS resource metadata.
 *
 * @param callback(error, data) (optional)
 *
 * @event metadata.resources.success(data) Metadata call is successful
 * @event metadata.resources.failure(error) Metadata call failed
 */
Client.prototype.getResources = function(callback) {
    var self = this;

    self.metadataModule.getResources(function(error, data){
        processRetsResponse(self, error, data, "metadata.resources.success", "metadata.resources.failure", callback);
    });
};

/**
 * Helper that retrieves a listing of ALL RETS foreign key metadata.
 *
 * @param callback(error, data) (optional)
 *
 * @event metadata.all.foreignkeys.success(data) Metadata call is successful
 * @event metadata.all.foreignkeys.failure(error) Metadata call failed
 */
Client.prototype.getAllForeignKeys = function(callback) {
    var self = this;

    self.metadataModule.getAllForeignKeys(function(error, data) {
        processRetsResponse(self, error, data, "metadata.all.foreignkeys.success", "metadata.all.foreignkeys.failure", callback);
    });
};

/**
 * Helper that retrieves RETS foreign key metadata.
 *
 * @param resourceType Class resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 *
 * @event metadata.foreignkeys.success(data) Metadata call is successful
 * @event metadata.foreignkeys.failure(error) Metadata call failed
 */
Client.prototype.getForeignKeys = function(resourceType, callback) {
    var self = this;

    self.metadataModule.getForeignKeys(resourceType, function(error, data) {
        processRetsResponse(self, error, data, "metadata.foreignkeys.success", "metadata.foreignkeys.failure", callback);
    });
};

/**
 * Helper that retrieves a listing of ALL RETS class metadata.
 *
 * @param callback(error, data) (optional)
 *
 * @event metadata.all.class.success(data) Metadata call is successful
 * @event metadata.all.class.failure(error) Metadata call failed
 */
Client.prototype.getAllClass = function(callback) {
    var self = this;

    self.metadataModule.getAllClass(function(error, data) {
        processRetsResponse(self, error, data, "metadata.all.class.success", "metadata.all.class.failure", callback);
    });
};

/**
 * Helper that retrieves RETS class metadata.
 *
 * @param resourceType Class resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 *
 * @event metadata.class.success(data) Metadata call is successful
 * @event metadata.class.failure(error) Metadata call failed
 */
Client.prototype.getClass = function(resourceType, callback) {
    var self = this;

    self.metadataModule.getClass(resourceType, function(error, data) {
        processRetsResponse(self, error, data, "metadata.class.success", "metadata.class.failure", callback);
    });
};

/**
 * Helper that retrieves a listing of ALL RETS table metadata.
 *
 * @param callback(error, data) (optional)
 *
 * @event metadata.all.table.success(data) Metadata call is successful
 * @event metadata.all.table.failure(error) Metadata call failed
 */
Client.prototype.getAllTable = function(callback) {
    var self = this;

    self.metadataModule.getAllTable(function(error, data) {
        processRetsResponse(self, error, data, "metadata.all.table.success", "metadata.all.table.failure", callback);
    });
};

/**
 * Helper that retrieves RETS table metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param classType Table class type (RESI, LAND, etc.)
 * @param callback(error, data) (optional)
 *
 * @event metadata.table.success(data) Metadata call is successful
 * @event metadata.table.failure(error) Metadata call failed
 */
Client.prototype.getTable = function(resourceType, classType, callback) {
    var self = this;

    self.metadataModule.getTable(resourceType, classType, function(error, data) {
        processRetsResponse(self, error, data, "metadata.table.success", "metadata.table.failure", callback);
    });
};

/**
 * Helper that retrieves a listing of ALL RETS resource lookups metadata.
 *
 * @param callback(error, data) (optional)
 *
 * @event metadata.all.lookups.success(data) Metadata call is successful
 * @event metadata.all.lookups.failure(error) Metadata call failed
 */
Client.prototype.getAllLookups = function(callback) {
    var self = this;

    self.metadataModule.getAllLookups(function(error, data) {
        processRetsResponse(self, error, data, "metadata.all.lookups.success", "metadata.all.lookups.failure", callback);
    });
};

/**
 * Helper that retrieves a RETS resource lookups metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 *
 * @event metadata.lookups.success(data) Metadata call is successful
 * @event metadata.lookups.failure(error) Metadata call failed
 *
 */
Client.prototype.getLookups = function(resourceType, callback) {
    var self = this;

    self.metadataModule.getLookups(resourceType, function(error, data) {
        processRetsResponse(self, error, data, "metadata.lookups.success", "metadata.lookups.failure", callback);
    });
};

/**
 * Helper that retrieves a listing of ALL RETS resource lookup types metadata.
 *
 * @param callback(error, data) (optional)
 *
 * @event metadata.all.lookupTypes.success(data) Metadata call is successful
 * @event metadata.all.lookupTypes.failure(error) Metadata call failed
 */
Client.prototype.getAllLookupTypes = function(callback) {
    var self = this;

    self.metadataModule.getAllLookupTypes(function(error, data) {
        processRetsResponse(self, error, data, "metadata.all.lookupTypes.success", "metadata.all.lookupTypes.failure", callback);
    });
};

/**
 * Helper that retrieves a RETS resource lookup type metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param lookupType (ArchitecturalStyle, etc.)
 * @param callback(error, data) (optional)
 *
 * @event metadata.lookupTypes.success(data) Metadata call is successful
 * @event metadata.lookupTypes.failure(error) Metadata call failed
 */
Client.prototype.getLookupTypes = function(resourceType, lookupType, callback) {
    var self = this;

    self.metadataModule.getLookupTypes(resourceType, lookupType, function(error, data) {
        processRetsResponse(self, error, data, "metadata.lookupTypes.success", "metadata.lookupTypes.failure", callback);
    });
};

/**
 * Helper that retrieves a RETS resource object metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 *
 * @event metadata.object.success(data) Metadata call is successful
 * @event metadata.object.failure(error) Metadata call failed
 */
Client.prototype.getObjectMeta = function(resourceType, callback) {
    var self = this;

    self.metadataModule.getObject(resourceType, function(error, data) {
        processRetsResponse(self, error, data, "metadata.object.success", "metadata.object.failure", callback);
    });
};

Client.prototype.searchRets = function(_queryOptions, callback) {
    var self = this;

    self.searchModule.searchRets(_queryOptions, function(error, data) {
        processRetsResponse(self, error, data, "search.success", "search.failure", callback);
    });
};

/**
 *
 * Helper that performs a targeted RETS search query and parses results.
 *
 * @param resourceType Rets resource type (ex: Property)
 * @param classType  Rets class type (ex: RESI)
 * @param queryString Rets query string. See RETS specification - (ex: MatrixModifiedDT=2014-01-01T00:00:00.000+)
 * @param callback(error, data) (optional)
 * @param _limit (optional) Limits the number of records returned.
 *
 * @event search.success(data) Search call is successful
 * @event search.failure(error) Search call failed
 */
Client.prototype.query = function(resourceType, classType, queryString, callback, _limit) {
    var self = this;

    self.searchModule.query(resourceType, classType, queryString, function(error, data){
        processRetsResponse(self, error, data, "query.success", "query.failure", callback);
    },
    _limit);
};

/**
 * Retrieves RETS object data.
 *
 * @param resourceType Rets resource type (ex: Property)
 * @param objectType Rets object type (ex: LargePhoto)
 * @param objectId Object identifier
 * @param callback(error, contentType, data) (optional)
 *
 * @event object.success({
 *
 *          contentType,
 *          data
*                       }) Object call is successful
 * @event object.failure(error) Object call failed
 */
Client.prototype.getObject = function(resourceType, objectType, objectId, callback) {
    var self = this;

    self.objectModule.getObject(resourceType, objectType, objectId, function(error, contentType, data) {

        if (error) {
            if (callback)
                callback(error);

            self.emit("object.failure", error);
        }

        if (callback)
            callback(error, contentType, data);

        self.emit("object.success", {contentType:contentType, data:data});
    });
};

/**
 * Helper that retrieves a list of photo objects.
 *
 * @param resourceType Rets resource type (ex: Property)
 * @param photoType Photo object type, based on getObjects meta call (ex: LargePhoto, Photo)
 * @param matrixId Photo matrix identifier.
 * @param callback(error, dataList) (optional)
 *
 *      Each item in data list is an object with the following data elements:
 *
 *       {
 *          buffer:<data buffer>,
 *          mime:<data buffer mime type>,
 *          description:<data description>,
 *          contentDescription:<data content description>,
 *          contentId:<content identifier>,
 *          objectId:<object identifier>
 *        }
 *
 * @event photos.success(dataList) Photos call is successful
 * @event photos.failure(error) Photos call failed
 *
 */
Client.prototype.getPhotos = function(resourceType, photoType, matrixId, callback) {
    var self = this;

    self.objectModule.getPhotos(resourceType, photoType, matrixId, function(error, data) {
        processRetsResponse(self, error, data, "photos.success", "photos.failure", callback);
    });
};





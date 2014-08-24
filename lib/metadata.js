var logger = require('winston'),
    utils = require('./utils.js'),
    xmlParser = require('xml2js').parseString,
    request = require('request');

var metadataURL;


/*
 * Retrieves RETS Metadata.
 *
 * @param type Metadata type (i.e METADATA-RESOURCE, METADATA-CLASS)
 * @param id Metadata id
 * @param format Data format (i.e. COMPACT, COMPACT-DECODED)
 * @param callback(error, data) (optional)
*/
var getMetadata = function(type, id, format, callback) {
    logger.debug("RETS method getMetadata");

    if (!type || !id || !format) {
        if (callback)
            callback(new Error("All params are required: type, id, format"));

        return;
    }

    if (!metadataURL) {
        if (callback)
            callback(new Error("System data not set; invoke login first."));

        return;
    }

    var options = {
        uri:metadataURL,
        jar:true,
        qs:{
            Type:type,
            Id:id,
            Format:format
        }
    };

    request(options, function(error, response, data) {

        var isErr = false;

        if (error) {
            isErr = true;
        }

        if (response.statusCode != 200)
        {
            isErr = true;
            error = new Error("RETS method getMetadata returned unexpected status code: " + response.statusCode);
        }

        if (isErr) {
            if (callback)
                callback(error);

            return;
        }

        if (callback)
            callback(error, data);
    });
};
/**
 * Parses a compact RETS metadata XML response.
 *
 * @param metadataXml Metadata XML response.
 * @param dataType Metadata type (i.e. Resources, Classes)
 * @returns Array of metadata items.
 */
var parseCompactMetadata = function(metadataXml, dataType) {

    var metaObj = {};
    var i, j;
    for(var metaItem = 0; metaItem < metadataXml.length; metaItem++) {
        //parse columns
        var columnsDtLst = metadataXml[metaItem].COLUMNS;
        var columns = [];
        if (columnsDtLst && columnsDtLst.length > 0) {
            var tmpCols = columnsDtLst[0].split("\t");
            for(i = 1; i < tmpCols.length-1; i++) {
                columns.push(tmpCols[i]);
            }
        }

        //parse data list
        var dataLst = metadataXml[metaItem].DATA;
        var rows = [];
        for(i = 0; i < dataLst.length; i++) {
            var tmpData = dataLst[i].split("\t");
            var rowData = [];
            for(j = 1; j < tmpData.length-1; j++) {
                rowData.push(tmpData[j]);
            }
            rows.push(rowData);
        }

        //map cols & rows into object
        var metaDataLst = [];

        for(i = 0; i < rows.length; i++) {
            var res = {};
            for(j = 0; j < columns.length; j++) {
                res[columns[j]] = rows[i][j];
            }

            metaDataLst.push(res);
        }

        var metaAttrs = metadataXml[metaItem].$;

        for(var key in metaAttrs) {
            metaObj[key] = metaAttrs[key];
        }

        if (!dataType) dataType = "Data";

        metaObj[dataType] = metaDataLst;
    }

    return metaObj;
};

/**
 * Helper that retrieves RETS system metadata
 * @param callback
 */
var getSystem = function(callback) {
    getMetadata("METADATA-SYSTEM", "0", "COMPACT", function(error, data) {
        if (error) {
            callback(error);
            return;
        }

        var systemXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;

            systemXml = result.RETS["METADATA-SYSTEM"];

            if(!utils.xmlParseCheck(systemXml, callback)) return;

            var systemDt = {
                metadataVersion: systemXml[0].$.Version,
                metadataDate: systemXml[0].$.Date,
                systemId: systemXml[0].SYSTEM[0].$.SystemID,
                systemDescription: systemXml[0].SYSTEM[0].$.SystemDescription
            };

            if(callback)
                callback(error, systemDt);

        });
    });
};

/**
 * Helper that retrieves RETS resource metadata.
 *
 * @param callback(error, data) (optional)
 */
var getResources = function(callback) {

    getMetadata("METADATA-RESOURCE", "0", "COMPACT", function(error, data) {

        if (error) {
            callback(error);
            return;
        }
        var resourceXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;

            resourceXml = result.RETS["METADATA-RESOURCE"];

            if(!utils.xmlParseCheck(resourceXml, callback)) return;

            if(callback)
                callback(error, parseCompactMetadata(resourceXml, "Resources"));

        });
    });
};

/**
 * Helper that retrieves a listing of ALL RETS foreign key metadata.
 *
 * @param callback(error, data) (optional)
 */
var getAllForeignKeys = function(callback) {
    logger.debug("RETS method getAllForeignKeys");

    getForeignKeys("0", function(error, data) {
        if (callback) {
            callback(error, data);
        }
    });
};

/**
 * Helper that retrieves RETS foreign key metadata.
 *
 * @param resourceType Class resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 */
var getForeignKeys = function(resourceType, callback) {
    logger.debug("RETS method getForeignKeys");

    if (!resourceType) {
        if (callback)
            callback(new Error("Missing resource type"));

        return;
    }

    getMetadata("METADATA-FOREIGNKEYS", resourceType, "COMPACT", function(error, data) {

        if (error) {
            callback(error);
            return;
        }

        var foreignKeysXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;
            foreignKeysXml = result.RETS["METADATA-FOREIGN_KEYS"][0].ForeignKey;

            if(!utils.xmlParseCheck(foreignKeysXml, callback)) return;

            if(callback)
                callback(error, parseCompactMetadata(foreignKeysXml, "ForeignKeys"));

        });
    });
};

/**
 * Helper that retrieves a listing of ALL RETS class metadata.
 *
 * @param callback(error, data) (optional)
 */
var getAllClass = function(callback) {
    logger.debug("RETS method getAllClass");

    getClass("0", function(error, data) {
        if (callback) {
            callback(error, data);
        }
    });
};

/**
 * Helper that retrieves RETS class metadata.
 *
 * @param resourceType Class resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 */
var getClass = function(resourceType, callback) {
    logger.debug("RETS method getClass");

    if (!resourceType) {
        if (callback)
            callback(new Error("Missing resource type"));

        return;
    }

    getMetadata("METADATA-CLASS", resourceType, "COMPACT", function(error, data) {

        if (error) {
            callback(error);
            return;
        }

        var classesXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;

            classesXml = result.RETS["METADATA-CLASS"];

            if(!utils.xmlParseCheck(classesXml, callback)) return;

            if(callback)
                callback(error, parseCompactMetadata(classesXml, "Classes"));

        });
    });
};

/**
 * Helper that retrieves a listing of ALL RETS table metadata.
 *
 * @param callback(error, data) (optional)
 */
var getAllTable = function(callback) {
    logger.debug("RETS method getAllTable");

    getTable("0", "", function(error, data) {
        if (callback) {
            callback(error, data);
        }
    });
};

/**
 * Helper that retrieves RETS table metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param classType Table class type (RESI, LAND, etc.)
 * @param callback(error, data) (optional)
 */
var getTable = function(resourceType, classType, callback) {
    logger.debug("RETS method getTable");

    if (!resourceType) {
        if (callback)
            callback(new Error("Missing resource type"));

        return;
    }

    var params;

    if (classType) {
        params = resourceType+":"+classType;
    }
    else params = resourceType;

    getMetadata("METADATA-TABLE", params, "COMPACT", function(error, data) {

        if (error) {
            callback(error);
            return;
        }

        var tableXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;

            tableXml = result.RETS["METADATA-TABLE"];

            if(!utils.xmlParseCheck(tableXml, callback)) return;

            if(callback)
                callback(error, parseCompactMetadata(tableXml, "Fields"));

        });
    });
};

/**
 * Helper that retrieves a listing of ALL RETS resource lookups metadata.
 *
 * @param callback(error, data) (optional)
 */
var getAllLookups = function(callback) {
    logger.debug("RETS method getAllLookups");

    getLookups("0", function(error, data) {
        if (callback) {
            callback(error, data);
        }
    });
};

/**
 * Helper that retrieves a RETS resource lookups metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 */
var getLookups = function(resourceType, callback) {
    logger.debug("RETS method getLookups");

    if (!resourceType) {
        if (callback)
            callback(new Error("Missing resource type"));

        return;
    }

    getMetadata("METADATA-LOOKUP", resourceType, "COMPACT", function(error, data) {

        if (error) {
            callback(error);
            return;
        }

        var lookupXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;

            lookupXml = result.RETS["METADATA-LOOKUP"];

            if(!utils.xmlParseCheck(lookupXml, callback)) return;

            if(callback)
                callback(error, parseCompactMetadata(lookupXml, "Lookups"));

        });
    });
};


/**
 * Helper that retrieves a listing of ALL RETS resource lookup types metadata.
 *
 * @param callback(error, data) (optional)
 */
var getAllLookupTypes = function(callback) {
    logger.debug("RETS method getAllLookupTypes");

    getLookupTypes("0", "", function(error, data) {
        if (callback) {
            callback(error, data);
        }
    });
};

/**
 * Helper that retrieves a RETS resource lookup type metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param lookupType (ArchitecturalStyle, etc.)
 * @param callback(error, data) (optional)
 */
var getLookupTypes = function(resourceType, lookupType, callback) {
    logger.debug("RETS method getLookupTypes");

    if (!resourceType) {
        if (callback)
            callback(new Error("Missing resource type"));

        return;
    }

    var params;

    if (lookupType) {
        params = resourceType+":"+lookupType;
    }
    else params = resourceType;

    getMetadata("METADATA-LOOKUP_TYPE", params, "COMPACT", function(error, data) {

        if (error) {
            callback(error);
            return;
        }

        var lookupTypeXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;

            lookupTypeXml = result.RETS["METADATA-LOOKUP_TYPE"];

            if(!utils.xmlParseCheck(lookupTypeXml, callback)) return;

            if(callback)
                callback(error, parseCompactMetadata(lookupTypeXml, "LookupTypes"));

        });
    });
};

/**
 * Helper that retrieves a RETS resource object metadata.
 *
 * @param resourceType Table resource type (i.e. Property, OpenHouse)
 * @param callback(error, data) (optional)
 */
var getObject = function(resourceType, callback) {
    logger.debug("RETS method getObject");

    if (!resourceType) {
        if (callback)
            callback(new Error("Missing resource type"));

        return;
    }

    getMetadata("METADATA-OBJECT", resourceType, "COMPACT", function(error, data) {

        if (error) {
            callback(error);
            return;
        }

        var objectXml;
        xmlParser(data, function(err, result) {

            if (!utils.replyCodeCheck(result, callback)) return;

            objectXml = result.RETS["METADATA-OBJECT"];

            if(!utils.xmlParseCheck(objectXml, callback)) return;

            if(callback)
                callback(error, parseCompactMetadata(objectXml, "Objects"));

        });
    });
};

module.exports = function(_metadataURL) {

    metadataURL = _metadataURL;

    return {
        getMetadata: getMetadata,
        getSystem: getSystem,
        getResources: getResources,
        getAllForeignKeys: getAllForeignKeys,
        getForeignKeys: getForeignKeys,
        getAllClass: getAllClass,
        getClass: getClass,
        getAllTable: getAllTable,
        getTable: getTable,
        getAllLookups: getAllLookups,
        getLookups: getLookups,
        getAllLookupTypes: getAllLookupTypes,
        getLookupTypes: getLookupTypes,
        getObject: getObject
    };
};


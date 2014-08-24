var logger = require('winston'),
    xmlParser = require('xml2js').parseString,
    request = require('request');

/**
 * Executes RETS login routine.
 * @param loginUrl RETS login URL (i.e http://<MLS_DOMAIN>/rets/login.ashx)
 * @param username username credential
 * @param password password credential
 * @param callback(error, client)
 */
var login = function(loginUrl, username, password, callback) {

    logger.debug("Rets method login");

    var options = {
        uri:loginUrl,
        jar:true,
        auth: {
            'user': username,
            'pass': password,
            'sendImmediately': false
        }
    };
    request(options, function(error, response, body) {
        var isErr = false;

        if (error) {
            isErr = true;
        }

        if (response.statusCode != 200)
        {
            isErr = true;
            var errMsg = "RETS method login returned unexpected HTTP status code: " + response.statusCode;
            error = new Error(errMsg);
            error.replyCode = response.statusCode;
            error.replyText = errMsg;
        }

        if (isErr) {
            if (callback)
                callback(error);

            return;
        }
        var retsXml;
        xmlParser(body, function(err, result) {

            if (!result || !result.RETS) {
                if (callback)
                    callback(new Error("Unexpected results. Please check the URL: " + loginUrl));
                return;
            }

            retsXml = result.RETS["RETS-RESPONSE"];
            var keyVals = retsXml[0].split("\r\n");

            var systemData = {};

            for(var i = 0; i < keyVals.length; i++)
            {
                var keyValSplit = keyVals[i].split("=");
                if (keyValSplit.length > 1) {
                    systemData[keyValSplit[0]] = keyValSplit[1];
                }
            }

            systemData.retsVersion = response.headers["rets-version"];
            systemData.retsServer = response.headers.server;

            if (callback)
                callback(error, systemData);
        });
    });
};

/**
 * Logouts RETS user
 * @param url Logout URL
 * @param callback(error)
 *
 * @event logout.success Logout was successful
 * @event logout.failure(error) Logout failure
 *
 */
var logout = function(url, callback) {

    logger.debug("RETS method logout");

    var options = {
        uri:url,
        jar:true
    };

    request(options, function(error, response, body) {

        var isErr = false;

        if (error) {
            isErr = true;
        }

        if (response.statusCode != 200)
        {
            isErr = true;

            var errMsg = "RETS method logout returned unexpected status code: " + response.statusCode;
            error = new Error(errMsg);
            error.replyCode = response.statusCode;
            error.replyText = errMsg;
        }

        if (isErr) {
            if (callback)
                callback(error);

            return;
        }

        logger.debug("Logout success");

        if (callback)
            callback(error, true);
    });
};

module.exports.login = login;
module.exports.logout = logout;

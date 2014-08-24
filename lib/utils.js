var replyCodeCheck = function(result, callback) {
    var replyCode = result.RETS.$.ReplyCode;
    var replyText = result.RETS.$.ReplyText;
    if (replyCode !== "0") {
        if (callback) {

            var error = new Error("RETS Server returned an error - ReplyCode: " + replyCode + " ReplyText: " + replyText);
            error.replyCode = replyCode;
            error.replyText = replyText;

            callback(error);
        }
        return false;
    }

    return true;
};

var xmlParseCheck = function(xml, callback) {
    if (!xml) {
        if (callback)
            callback(new Error("Failed to parse RETS XML: " + xml));
        return false;
    }

    return true;
};

var hex2a = function(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
};

module.exports.replyCodeCheck = replyCodeCheck;
module.exports.xmlParseCheck = xmlParseCheck;
module.exports.hex2a = hex2a;
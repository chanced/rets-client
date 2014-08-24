var logger = require('winston'),
    path = require('path'),
    MultipartParser = require('formidable/lib/multipart_parser').MultipartParser,
    Stream = require('stream').Stream,
    streamBuffers = require("stream-buffers");

var streamBufferList = [];

//Multipart parser derived from formidable library. See https://github.com/felixge/node-formidable

var parseMultipart = function(buffer, _multipartBoundary, callback) {
    var parser = getParser(_multipartBoundary);

    if (parser instanceof Error) {
        if (callback) callback(parser);
        return;
    }

    parser.write(buffer);

    var dataBufferList = [];
    for(var i = 0; i < streamBufferList.length; i++) {
        var streamBuffer = streamBufferList[i];
        dataBufferList.push({
            buffer:streamBuffer.streamBuffer.getContents(),
            mime:streamBuffer.mime,
            description:streamBuffer.description,
            contentDescription:streamBuffer.contentDescription,
            contentId:streamBuffer.contentId,
            objectId:streamBuffer.objectId
        });
    }

    if (callback)
        callback(null, dataBufferList);
};

var getParser = function(_multipartBoundary) {
    var parser = new MultipartParser(),
        headerField = '',
        headerValue = '',
        part = {},
        encoding = "utf8",
        ended = false,
        maxFields = 1000,
        maxFieldsSize = 2 * 1024 * 1024,
        fieldsSize;

    parser.onPartBegin = function() {
        part = new Stream();
        part.readable = true;
        part.headers = {};
        part.name = null;
        part.filename = null;
        part.mime = null;

        part.transferEncoding = 'binary';
        part.transferBuffer = '';

        headerField = '';
        headerValue = '';
    };

    parser.onHeaderField = function(b, start, end) {
        headerField += b.toString(encoding, start, end);
    };

    parser.onHeaderValue = function(b, start, end) {
        headerValue += b.toString(encoding, start, end);
    };

    parser.onHeaderEnd = function() {
        headerField = headerField.toLowerCase();
        part.headers[headerField] = headerValue;
        var m = headerValue.match(/\bname="([^"]+)"/i);
        if (headerField == 'content-disposition') {
            if (m) {
                part.name = m[1];
            }

            part.filename = self._fileName(headerValue);
        } else if (headerField == 'content-type') {
            part.mime = headerValue;
        } else if (headerField == 'content-transfer-encoding') {
            part.transferEncoding = headerValue.toLowerCase();
        }

        headerField = '';
        headerValue = '';
    };

    parser.onHeadersEnd = function() {
        switch(part.transferEncoding){
            case 'binary':
            case '7bit':
            case '8bit':
                parser.onPartData = function(b, start, end) {
                    part.emit('data', b.slice(start, end));
                };

                parser.onPartEnd = function() {
                    part.emit('end');
                };
                break;

            case 'base64':
                parser.onPartData = function(b, start, end) {
                    part.transferBuffer += b.slice(start, end).toString('ascii');

                    /*
                     four bytes (chars) in base64 converts to three bytes in binary
                     encoding. So we should always work with a number of bytes that
                     can be divided by 4, it will result in a number of buytes that
                     can be divided vy 3.
                     */
                    var offset = parseInt(part.transferBuffer.length / 4, 10) * 4;
                    part.emit('data', new Buffer(part.transferBuffer.substring(0, offset), 'base64'));
                    part.transferBuffer = part.transferBuffer.substring(offset);
                };

                parser.onPartEnd = function() {
                    part.emit('data', new Buffer(part.transferBuffer, 'base64'));
                    part.emit('end');
                };
                break;

            default:
                return new Error('unknown transfer-encoding');
        }
        handlePart(part);
    };


    parser.onEnd = function() {
        ended = true;
    };



    var handlePart = function(part) {

        if (part.filename === undefined) {
            var value = '', decoder = new StringDecoder(encoding);

            part.on('data', function(buffer) {
                fieldsSize += buffer.length;
                if (fieldsSize > maxFieldsSize) {
                    logger.error('maxFieldsSize exceeded, received '+fieldsSize+' bytes of field data');
                    return;
                }
                value += decoder.write(buffer);
            });

            return;
        }

        var writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
            initialSize: (100 * 1024),      // start as 100 kilobytes.
            incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
        });

        part.on('data', function(buffer) {
            if (buffer.length === 0) {
                return;
            }

            writableStreamBuffer.write(buffer);
        });

        part.on('end', function(){
            streamBufferList.push({
                streamBuffer: writableStreamBuffer,
                mime:part.mime,
                contentDescription:part.headers['content-description'],
                contentId:part.headers['content-id'],
                objectId:part.headers['object-id']
            });
        });
    };

    parser.initWithBoundary(_multipartBoundary);

    return parser;
};

module.exports.parseMultipart = parseMultipart;

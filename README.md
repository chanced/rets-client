rets-client
===========

Node.js RETS client (Real Estate Transaction Standard)

Library was developed against a server running RETS v1.7.2.

[RETS Specification](http://www.reso.org/specifications)

#### Example RETS Session


##### Create a Client Instance (Login)

```javascript
    //create rets-client
    var client = require('rets-client').getClient(retsLoginUrl, retsUser, retsPassword);

    //connection success event
    client.once('connection.success', function() {
        console.log("RETS Server connection success!");
        console.log("RETS version: " + client.retsVersion);
        console.log("Member name: " + client.memberName);
    });

    //connection failure event
    client.once('connection.failure', function(error) {
        console.log("connection to RETS server failed ~ %s", error);
    });
```    

##### Get Resources Metadata

```javascript
    //get resources metadata
    var client = require('rets-client').getClient(retsLoginUrl, retsUser, retsPassword);

    client.once('connection.success', function() {
        client.getResources();

        client.once('metadata.resources.success', function(data) {
            console.log(data.Version);
            console.log(data.Date);
            for(var dataItem = 0; dataItem < data.Resources.length; dataItem++) {
                console.log(data.Resources[dataItem].ResourceID);
                console.log(data.Resources[dataItem].StandardName);
                console.log(data.Resources[dataItem].VisibleName);
                console.log(data.Resources[dataItem].ObjectVersion);
            }
        });
    });

```

##### Get Class Metadata

```javascript
    //get class metadata
    var client = require('rets-client').getClient(retsLoginUrl, retsUser, retsPassword);

    client.once('connection.success', function() {
        client.getClass("Property");

        client.once('metadata.class.success', function(data) {
            console.log(data.Version);
            console.log(data.Date);
            console.log(data.Resource);
            for(var classItem = 0; classItem < data.Classes.length; classItem++) {
                console.log(data.Classes[classItem].ClassName);
                console.log(data.Classes[classItem].StandardName);
                console.log(data.Classes[classItem].VisibleName);
                console.log(data.Classes[classItem].TableVersion);
            }
        });
    });
```
##### Get Field Metadata

```javascript
    //get field data
    var client = require('rets-client').getClient(retsLoginUrl, retsUser, retsPassword);

    client.once('connection.success', function() {
        client.getTable("Property", "RESI");

        client.once('metadata.table.success', function(data) {
            console.log(data.Version);
            console.log(data.Date);
            console.log(data.Resource);
            console.log(data.Class);

            for(var tableItem = 0; tableItem < data.Fields.length; tableItem++) {
                console.log(data.Fields[tableItem].MetadataEntryID);
                console.log(data.Fields[tableItem].SystemName);
                console.log(data.Fields[tableItem].ShortName);
                console.log(data.Fields[tableItem].LongName);
                console.log(data.Fields[tableItem].DataType);
            }

        });
    });
```

##### Perform a Query

```javascript
    //perform a query using DQML
    var client = require('rets-client').getClient(retsLoginUrl, retsUser, retsPassword);

    client.once('connection.success', function() {

        //get open house fields
        client.getTable("OpenHouse", "OPENHOUSE");
        var fields;

        client.once('metadata.table.success', function(table) {

            fields = table.Fields;

            //pass resource, class, and DQML query
            client.query("OpenHouse", "OPENHOUSE", 
            "(OpenHouseType=PUBLIC),(ActiveYN=1)", function(error, data) {

                if (error) {
                    console.log(error);
                    return;
                }

                //iterate through search results
                for(var dataItem = 0; dataItem < data.length; dataItem++) {
                    console.log("-------- Open House --------")

                    for(var fieldItem = 0; fieldItem < fields.length; fieldItem++) {
                        var systemStr = fields[fieldItem].SystemName;
                        console.log(systemStr + " : " + data[dataItem][systemStr]);
                    }

                    console.log("\n");
                }
            });
        });
    });
```
##### Retrieve Large Photos of a Property

```javascript
    //get photos
    var client = require('rets-client').getClient(retsLoginUrl, retsUser, retsPassword);

    client.once('connection.success', function() {

        client.getPhotos("Property", "LargePhoto", "123456789", function(error, dataList) {
            if (error) {
                console.log(error);
                return;
            }

            for(var i = 0; i < dataList.length; i++) {
                console.log("Photo " + (i+1) + " MIME type: " + dataList[i].mime);
                
                require('fs').writeFile(
                    "imgs/photo"+(i+1)+"."+dataList[i].mime.match(/image\/(\w+)/i)[1], 
                    dataList[i].buffer
                );
            }
        });
    });
```


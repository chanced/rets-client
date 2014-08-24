rets-client
===========

Node.js RETS client (Real Estate Transaction Standard)

Library was developed against a server running RETS v1.7.2.

[RETS Specification](http://www.reso.org/specifications)

#### Example RETS Session


###### Create a Client Instance (Login)

```javascript
    //create rets-client
    var client = rets.getClient(retsLoginUrl, retsUser, retsPassword);

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

###### Get Resources Meta-data

```javascript
    //get resources meta-data
    var client = rets.getClient(retsLoginUrl, retsUser, retsPassword);

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

###### Get Class Meta-data

```javascript
    //get class meta-data
    var client = rets.getClient(retsLoginUrl, retsUser, retsPassword);

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

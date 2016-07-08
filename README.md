rethinkdb-datatables
--------------------

A Node.js <a href="https://www.rethinkdb.com/">RethinkDB</a> query builder to be consumed by <a hrf="https://datatables.net/">datatables</a>.

### Install

```
npm install rethinkdb-datatables
```

### Quick start

```js
var r = require('rethinkdb');
var queryBuilder = require('rethinkdb-datatables');
//Note: if you need to filter, don't use r.row here
//because this query will be nested when counting total records
var tableSelectionQuery = r.db('test').table('example');
var options = {
  searchable: ['id', 'field1', 'field2'],
  pluckable: ['id', 'field1', 'field3'],
  primaryKey: 'someOtherKey',
  regexCaseSensitive: false
};

//No need for redundant try-catch anymore
queryBuilder.buildDataTablesQuery(paramsFromDataTables, r, tableSelectionQuery, options, function(err, res) {
  if (err) return cb(err);
  r.connect({host: 'localhost'; port: 28015}, function(err, conn) {
    res.run(conn, function(err, res) {
      conn.close();
      //Send response back depending on your framework
    });
  });
});
```


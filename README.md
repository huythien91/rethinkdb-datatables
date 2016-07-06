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
var tableSelectionQuery = r.db('test').table('example');
var options = {
  searchable: ['id', 'field1', 'field2'],
  pluckable: ['id', 'field1', 'field3'],
  primaryKey: 'someOtherKey'
};

//No need for redundant try-catch anymore
queryBuilder.buildDatatablesQuery(paramsFromDataTables, r, tableSelectionQuery, options, function(err, res) {
  if (err) return cb(err);
  res.run(conn, function(err, res) {
    conn.close();
    //Send response back depending on your framework
  });
});
```


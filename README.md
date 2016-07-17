rethinkdb-datatables
--------------------

A Node.js <a href='https://www.rethinkdb.com/'>RethinkDB</a> query builder to be consumed by <a hrf='https://datatables.net/'>datatables</a>.

# Install

```
npm install rethinkdb-datatables
```

# Quick start
## server-side
```js
var r = require('rethinkdb');
var queryBuilder = require('rethinkdb-datatables');
//Note: if you need to filter, don't use r.row here
//because this query will be nested when counting total records
var tableSelectionQuery = r.db('test').table('example');
var options = {
  searchable: ['id', 'stringField', 'arrayField'],
  pluckable: ['id', 'stringField', 'arrayField', 'timestamp'],
  //primaryKey will then be used as the <td> row id in your html table by datatables
  primaryKey: 'someOtherKey', 
  regexCaseSensitive: true
};

var defaultOptions = {
  searchable: '<This will be built based on your initDatatables columns option>',
  pluckable: '<This will be built based on your initDatatables columns option>',
  primaryKey: 'id',
  regexCaseSensitive: false
};

//No need for redundant try-catch anymore
queryBuilder.buildDataTablesQuery(paramsFromDataTables, r, tableSelectionQuery, options, function(err, preparedQuery) {
  if (err) return cb(err);
  r.connect({host: 'localhost'; port: 28015}, function(err, conn) {
    //You may have to pass arrayLimit within run if you have > 100k documents
    preparedQuery.run(conn, function(err, result) {
      conn.close();
      //Send response back depending on your framework i.e:
      res.send(200, res);
    });
  });
});
```
## client-side
### index.html
```html
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='utf-8'>
  </head>
  <body>
    <div>
      <table id='target-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>String</th>
            <th>Array</th>
            <th>Time</th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <th>ID</th>
            <th>String</th>
            <th>Array</th>
            <th>Time</th>
          </tr>
        </tfoot>
        <tbody>
        </tbody>
      </table>
    </div>
    <!-- jQuery -->
    <script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js'></script>
    <!-- Datatables -->
    <script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.12/js/jquery.dataTables.min.js'></script>
    <!-- Moment.js -->
    <script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.js'></script>
  </body>
</html>
```
### index.js
```js
$(document).ready(function() {
  initDatatables();
});

function initDatatables() {
  var oTable = $('#target-table').DataTable({
    serverSide: true,
    ajax: {
      url: '<YOUR_API_URL>',
      type: 'POST',
      dataType: 'json'
    },
    columns: [
      {data: 'id', orderable: true, searchable: true, name: 'id'},
      {data: 'stringField', orderable: true, searchable: true, name: 'stringField'},
      {data: 'arrayField', orderable: false, searchable: true, name: 'arrayField'},
      {data: 'timestamp', orderable: true, searchable: false, name: 'timestamp'}
    ],
    columnDef: [
      {
        targets: [2],//arrayField
        render: function (data, type, row) {
          var arrayString = '';
          data.forEach(function(each) {
            arrayString += each + ', ';
          });
          return arrayString;
        }
      }, {
        targets: [3],//timestamp
        render: function (data, type, row) {
          return moment(data).format('YYYY-MM-DD HH:mm');
        },
        width: '12%'
      }
    ],
    order: [
        [0, 'desc']
    ],
    deferRender: true,
    search: {
      regex: true
    }
  });
}
```


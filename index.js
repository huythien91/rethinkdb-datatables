var RETHINKDB_DATATABLE = function() {
  var helper = require('./helper');
  
  /**
   * Special controller for datatable
   * @function buildDataTablesQuery
   * @param {object} params parsed parameters from datatables (check https://datatables.net/manual/server-side for more info)
   * @param {object} rethinkdb your rethinkdb driver
   * @param {object} tableSelectionQuery the table selection query (ie: r.db('example').table('test'))
   * @param {object} options optional variables to ensure the functionality & security of our data
   * @param {string[]} options.searchable array containing names of searchable fields in the table
   * @param {string[]} options.pluckable array containing names of pluckable fields (i.e. 'password' should not be pluckable)
   * @param {string} options.primaryKey the primary key name of the table (defaults to 'id')
   * @param {function} cb the callback function
   * @returns {
   *  draw: <properly parsed draw param>,
   *  recordsTotal: <total number of records in the database>,
   *  recordsFiltered: <total records, after filtering>,
   *  data: <the data to be displayed in the table>,
   *  error: <optional: if an error occurs>
   * }
   */
  this.buildDataTablesQuery = function (params, rethinkdb, tableSelectionQuery, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    var searchable = ('searchable' in options) ? options['searchable'] : null;
    var pluckable = ('pluckable' in options) ? options['pluckable'] : null;
    var primaryKey = ('primaryKey' in options) ? options['primaryKey'] : 'id';
    var query = tableSelectionQuery;

    validateDataTableParams(params, function(err, validated) {
      if (err) return cb(err);

      if (!searchable) {
        //Build searchable based on parameters from datatables request
        seachable = [];
        validated['columns'].forEach(function (column) {
          if (column['searchable'])
            searchable.push(column['data']);
        });
      }

      //We want to return an empty string in case an object does not have required field
      var defaultRow = {};

      //Build pluckable and defaultRow based on parameters from datatables request
      if (!pluckable) {
        pluckable = [];
        validated['columns'].forEach(function (column) {
          pluckable.push(column['data']);
        });
      } else {
        var furtherPlucking = [];
        validated['columns'].forEach(function (column) {
          if (pluckable.indexOf(column['data']) > -1) {
            furtherPlucking.push(column['data']);
            defaultRow[column['data']] = '';
          }
        });
        pluckable = furtherPlucking;
      }

      if (validated['search'] && validated['search']['value']!=="") {
        if (validated['search']['regex'] && (validated['search']['regex'] === 'true' || validated['search']['regex'] == true)) {
          query = query.filter(function(record) {
            return rethinkdb.expr(searchable).map(function(key) {
              return record(key).coerceTo('string').match(validated['search']['value']).ne(null)
            }).contains(true)
          });
        } else {
          query = query.filter(function(record) {
            return rethinkdb.expr(searchable).map(function(key) {
              return record(key).coerceTo('string').eq(validated['search']['value'])
            }).contains(true)
          });
        }
      }

      var orderColumn = validated['columns'][parseInt(params['order'][0]['column'])]['name'];
      var order = (validated['order'][0]['dir'] === 'desc') ? rethinkdb.desc(orderColumn) : orderColumn;

      query = query.coerceTo('array').do(function(records) {
        return {
          draw: validated['draw'],
          recordsTotal: tableSelectionQuery.count(),
          recordsFiltered: records.count(),
          data: records.slice(validated['start'], validated['start'] + validated['length']).merge(function(row) {
            return {
              DT_RowId : row(primaryKey)
            }
          }).map(function(row) {
            return rethinkdb.expr(defaultRow).merge(row);
          })
          .orderBy(order).pluck(rethinkdb.args(pluckable))
        }
      });

      return cb(null, query);
    });
  };

  /**
   * Validate dataTable parameters
   * Currently not supporting search on each column
   * @function validateDataTableParams
   * @param {integer} draw draw counter for datatables to keep track
   * @param {integer} start first record index
   * @param {integer} length number of records in the current draw (-1 for everything)
   * @param {object} search object with value(string) & regex(boolean) properties 
   * indicating search on searchable columns
   * @param {object[]} order array of {column: <col_index>, dir: <asc or desc string>}
   * indicating which ordering should be applied
   * @param {object[]} columns array of objects 
   * {
   *  data: <Column's data source string>,
   *  name: <Column's name string>,
   *  searchable: <boolean to indicate if this column is searchable>,
   *  orderable: <boolean indicate if this column is orderable>,
   *  search {
   *    value: <value to apply to this specific colum>,
   *    regex: <indicate if the search term for this column should be treated as regular expression>
   *  }
   * }
   * @returns {object} validated params
   */
  function validateDataTableParams (params, cb) {
    try {
      var validated = {
        draw: helper.validInt(params ,'draw'),
        start: helper.validInt(params, 'start'),
        length: helper.validInt(params, 'length'),
        search: null,
        order: [],
        columns: []
      };

      if(params['search']) {
        validated['search'] = {};
        validated['search']['regex'] = helper.validBoolean(params['search'], 'regex');
        if (validated['search']['regex']) {
          validated['search']['value'] = helper.regexEscape(params['search']['value']);
        } else {
          validated['search']['value'] = params['search']['value'];
        }
      }

      if (!Array.isArray(params['order']) || params['order'].length === 0) {
        return cb(new Error('Parameter order must be valid array'));
      }

      params['order'].forEach(function(order) {
        var validDir = ['asc', 'desc'];
        order['column'] = helper.validInt(order, 'column');
        order['dir'] = helper.noEmpty(order, 'dir');
        if (validDir.indexOf(order['dir']) < 0) {
          return cb(new Error('Parameter order direction must be asc or desc'));
        }
        validated['order'].push(order);
      });

      if (!Array.isArray(params['columns']) || params['columns'].length === 0) {
        return cb(new Error('Parameter column must be valid array'));
      }

      params['columns'].forEach(function(column) {
        column['data'] = helper.noEmpty(column, 'data');
        column['name'] = helper.noEmpty(column, 'name');
        (column['searchable']) ? column['searchable'] = helper.validBoolean(column, 'searchable') : null;
        (column['orderable']) ? column['orderable'] = helper.validBoolean(column, 'orderable') : null;
          validated['columns'].push(column);
      });

      return cb(null, validated);
    } catch (error) {
      return cb(error);
    }
  }
}

var rethinkdb_datable = new RETHINKDB_DATATABLE();
module.exports = rethinkdb_datable;
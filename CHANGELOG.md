##0.0.10 (2016-07-07)
Bug fix:
 - Fixed `regexCaseSensitive` bug

##0.0.9 (2016-07-07)
Improvement:
 - Added option `regexCaseSensitive` (boolean). Defaults to `false` if not specified

##0.0.8 (2016-07-06)
Bug fixes: 
 - Fixed bug when returned data doesn't have DT_RowId when pluckable option is not provided

##0.0.7 (2016-07-06)
Bug fixes: 
 - Fixed bug when returned data doesn't have DT_RowId
 - Fixed search bug

##0.0.6 (2016-07-06)
Bug fix:
 - Fixed ordering issue by applying order before pagination

##0.0.5 (2016-07-06)
Bug fix:
 - Updated docs

##0.0.4 (2016-07-06)
Minor Change:
 - Updated docs

##0.0.3 (2016-07-06)
Bug fix:
 - Added try-catch in `validateDatatableParams` so we won't need to enclose `buildDataTablesQuery` with a redundant try-catch
 - `options` parameter is now truely optional

##0.0.2 (2016-07-04)
Breaking Change:
 - Renamed main function to `buildDataTablesQuery`;
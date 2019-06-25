# How to Handle Date and Time Types

SQL Server has six date and time datatypes: date, time, smalldatetime, datetime, datetime2 and datetimeoffset. Some of these datatypes may contain more information than others (for example, datetimeoffset is the only type that has time zone awareness), higher ranges, or larger precisions. In a Go application using the mssql driver, the data types used to hold these data must be chosen carefully so no data is lost.

## Inserting Date and Time Data

The following is a list of datatypes that can be used to insert data into a SQL Server date and/or time type column:
- string
- time.Time
- mssql.DateTime1
- mssql.DateTimeOffset
- "cloud.google.com/go/civil".Date
- "cloud.google.com/go/civil".Time
- "cloud.google.com/go/civil".DateTime

`time.Time` and `mssql.DateTimeOffset` contain the most information (time zone and over 7 digits precision). Designed to match the SQL Server `datetime` type, `mssql.DateTime1` does not have time zone information, only has up to 3 digits precision and they are rouded to increments of .000, .003 or .007 seconds when the data is passed to SQL Server. If you use `mssql.DateTime1` to hold time zone information or very precised time data (more than 3 decimal digits), you will see data lost when inserting into columns with types that can hold more information. For example:

```
// all these types have up to 7 digits precision points
// datetimeoffset can hold information about time zone
_, err  := db.Exec("CREATE TABLE datetimeTable (timeCol TIME, datetime2Col DATETIME2, datetimeoffsetCol DATETIMEOFFSET)")
stmt, err := db.Prepare("INSERT INTO datetimeTable VALUES (@p1, @p2, @p3))
tin, err := time.Parse(time.RFC3339, "2006-01-02T22:04:05.7870015-07:00")   // data containing 7 decimal digits and has time zone awareness
param := mssql.DateTime1(tin)   // data is stored in mssql.DateTime1 type
_, err = stmt.Exec(param, param, param)
// result in database:
// timeCol: 22:04:05.7866667
// datetime2Col: 2006-01-02 22:04:05.7866667
// datetimeoffsetCol: 2006-01-02 22:04:05.7866667 +00:00
// precisions are lost in all columns. Also, time zone information is lost in datetimeoffsetCol
```

 `"cloud.google.com/go/civil".DateTime` does not have time zone information. `"cloud.google.com/go/civil".Date` only has the date information, and `"cloud.google.com/go/civil".Time` only has the time information. `string` can also be used to insert data into date and time types columns, but you have to make sure the format is accepted by SQL Server.

## Retrieving Date and Time Data

The following is a list of datatypes that can be used to retrieved data from a SQL Server date and/or time type column:
- string
- sql.RawBytes
- time.Time
- mssql.DateTime1
- mssql.DateTiimeOffset

When using these data types to retrieve information from a date and/or time type column, you may end up with some extra unexpected information. For example, if you use Go type `time.Time` to retrieve information from a SQL Server `date` column:

```
var c2 time.Time
rows, err := db.Query("SELECT dateCol FROM datetimeTable")  // dateCol has data `2006-01-02`
for rows.Next() {
    err = rows.Scan(&c1)
    fmr.Printf("c2: %+v")
    // c2: 2006-01-02 00:00:00 +0000 UTC
    // you get extra time and time zone information defaulty set to 0
}
```

## Output parameters with Date and Time Data

The following is a list of datatypes that can be used as buffer to hold a output parameter of SQL Server date and/or time type
- string
- time.Time
- mssql.DateTime1
- mssql.DateTimeOffset

The only type that can be used to retrieve an output of `smalldatetime` is `string`, otherwise you will get a `mssql: Error converting data type datetimeoffset/datetime1 to smalldatetime` error. Furthermore, `string` and `mssql.DateTime1` are the only types that can be used to retrieve output of `datetime` type, otherwise you will get a `mssql: Error converting data type datetimeoffset to datetime` error.

Similar to retrieving data from a result set, when retrieving data as a output parameter, you may end up with some extra unexpected information when the Go type you use contains more information than the data you retrieved from SQL Server.

## Example
[DateTime handling example](../datetimeoffset_example_test.go)
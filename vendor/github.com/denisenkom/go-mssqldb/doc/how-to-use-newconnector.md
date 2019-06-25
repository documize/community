# How to use the Connector object

A Connector holds information in a DSN and is ready to make a new connection at any time. Connector implements the database/sql/driver Connector interface so it can be passed to the database/sql `OpenDB` function. One property on the Connector is the `SessionInitSQL` field, which may be used to set any options that cannot be passed through a DSN string.

To use the Connector type, first you need to import the sql and go-mssqldb packages

```
import (
  "database/sql"
  "github.com/denisenkom/go-mssqldb"
)
```

Now you can create a Connector object by calling `NewConnector`, which creates a new connector from a DSN.

```
dsn := "sqlserver://username:password@hostname/instance?database=databasename"
connector, err := mssql.NewConnector(dsn)
```

You can set `connector.SessionInitSQL` for any options that cannot be passed through in the dsn string.

`connector.SessionInitSQL = "SET ANSI_NULLS ON"`

Open a database by passing connector to `sql.OpenDB`.

`db := sql.OpenDB(connector)`

The returned DB maintains its own pool of idle connections. Now you can use the `sql.DB` object for querying and executing queries.

## Example
[NewConnector example](../newconnector_example_test.go)

# How to use Table-Valued Parameters

Table-valued parameters are declared by using user-defined table types. You can use table-valued parameters to send multiple rows of data to a Transact-SQL statement or a routine, such as a stored procedure or function, without creating a temporary table or many parameters.

To make use of the TVP functionality, first you need to create a table type, and a procedure or function to receive data from the table-valued parameter.

```
createTVP = "CREATE TYPE LocationTableType AS TABLE (LocationName VARCHAR(50), CostRate INT)"
_, err = db.Exec(createTable)

createProc = `
CREATE PROCEDURE dbo.usp_InsertProductionLocation
@TVP LocationTableType READONLY
AS
SET NOCOUNT ON
INSERT INTO Location
(
	Name,
	CostRate,
	Availability,
	ModifiedDate)
SELECT *, 0,GETDATE()
FROM @TVP`
_, err = db.Exec(createProc)
```

In your go application, create a struct that corresponds to the table type you have created. Create a slice of these structs which contain the data you want to pass to the stored procedure.

```
type LocationTableTvp struct {
	LocationName string
	CostRate     int64
}

locationTableTypeData := []LocationTableTvp{
	{
		LocationName: "Alberta",
		CostRate:     0,
	},
	{
		LocationName: "British Columbia",
		CostRate:     1,
	},
}
```

Create a `mssql.TVP` object, and pass the slice of structs into the `Value` member. Set `TypeName` to the table type name.

```
tvpType := mssql.TVP{
	TypeName: "LocationTableType",
	Value:    locationTableTypeData,
}
```

Finally, execute the stored procedure and pass the `mssql.TVPType` object you have created as a parameter.

`_, err = db.Exec("exec dbo.usp_InsertProductionLocation @TVP;", sql.Named("TVP", tvpType))`

## Using Tags to Omit Fields in a Struct

Sometimes users may find it useful to include fields in the struct that do not have corresponding columns in the table type. The driver supports this feature by using tags. To omit a field from a struct, use the `json` or `tvp` tag key and the `"-"` tag value.

For example, the user wants to define a struct with two more fields: `LocationCountry` and `Currency`. However, the `LocationTableType` table type do not have these corresponding columns. The user can omit the two new fields from being read by using the `json` or `tvp` tag.

```
type LocationTableTvpDetailed struct {
	LocationName	string
	LocationCountry string	`tvp:"-"`
	CostRate		int64
	Currency		string	`json:"-"`
}
```

The `tvp` tag is the highest priority. Therefore if there is a field with tag `json:"-" tvp:"any"`, the field is not omitted. The following struct demonstrates different scenarios of using the `json` and `tvp` tags.

```
type T struct {
	F1 string `json:"f1" tvp:"f1"`	// not omitted
	F2 string `json:"-" tvp:"f2"`	// tvp tag takes precedence; not omitted
	F3 string `json:"f3" tvp:"-"`	// tvp tag takes precedence; omitted
	F4 string `json:"-" tvp:"-"`	// omitted
	F5 string `json:"f5"`			// not omitted
	F6 string `json:"-"`			// omitted
	F7 string `tvp:"f7"`			// not omitted
	F8 string `tvp:"-"`				// omitted
}
```

## Example
[TVPType example](../tvp_example_test.go)

// +build go1.10

package mssql_test

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/civil"
	"github.com/denisenkom/go-mssqldb"
)

// This example shows how to insert and retrieve date and time types data
func ExampleDateTimeOffset() {
	flag.Parse()

	if *debug {
		fmt.Printf(" password:%s\n", *password)
		fmt.Printf(" port:%d\n", *port)
		fmt.Printf(" server:%s\n", *server)
		fmt.Printf(" user:%s\n", *user)
	}

	connString := makeConnURL().String()
	if *debug {
		fmt.Printf(" connString:%s\n", connString)
	}

	db, err := sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal("Open connection failed:", err.Error())
	}
	defer db.Close()

	insertDateTime(db)
	retrieveDateTime(db)
	retrieveDateTimeOutParam(db)
}

func insertDateTime(db *sql.DB) {
	_, err := db.Exec("CREATE TABLE datetimeTable (timeCol TIME, dateCol DATE, smalldatetimeCol SMALLDATETIME, datetimeCol DATETIME, datetime2Col DATETIME2, datetimeoffsetCol DATETIMEOFFSET)")
	if err != nil {
		log.Fatal(err)
	}
	stmt, err := db.Prepare("INSERT INTO datetimeTable VALUES(@p1, @p2, @p3, @p4, @p5, @p6)")
	if err != nil {
		log.Fatal(err)
	}
	tin, err := time.Parse(time.RFC3339, "2006-01-02T22:04:05.787-07:00")
	if err != nil {
		log.Fatal(err)
	}
	var timeCol civil.Time = civil.TimeOf(tin)
	var dateCol civil.Date = civil.DateOf(tin)
	var smalldatetimeCol string = "2006-01-02 22:04:00"
	var datetimeCol mssql.DateTime1 = mssql.DateTime1(tin)
	var datetime2Col civil.DateTime = civil.DateTimeOf(tin)
	var datetimeoffsetCol mssql.DateTimeOffset = mssql.DateTimeOffset(tin)
	_, err = stmt.Exec(timeCol, dateCol, smalldatetimeCol, datetimeCol, datetime2Col, datetimeoffsetCol)
	if err != nil {
		log.Fatal(err)
	}
}

func retrieveDateTime(db *sql.DB) {
	rows, err := db.Query("SELECT timeCol, dateCol, smalldatetimeCol, datetimeCol, datetime2Col, datetimeoffsetCol FROM datetimeTable")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	var c1, c2, c3, c4, c5, c6 time.Time
	for rows.Next() {
		err = rows.Scan(&c1, &c2, &c3, &c4, &c5, &c6)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("c1: %+v; c2: %+v; c3: %+v; c4: %+v; c5: %+v; c6: %+v;\n", c1, c2, c3, c4, c5, c6)
	}
}

func retrieveDateTimeOutParam(db *sql.DB) {
	CreateProcSql := `
	CREATE PROCEDURE OutDatetimeProc
		@timeOutParam TIME OUTPUT,
		@dateOutParam DATE OUTPUT,
		@smalldatetimeOutParam SMALLDATETIME OUTPUT,
		@datetimeOutParam DATETIME OUTPUT,
		@datetime2OutParam DATETIME2 OUTPUT,
		@datetimeoffsetOutParam DATETIMEOFFSET OUTPUT
	AS
		SET NOCOUNT ON
		SET @timeOutParam = '22:04:05.7870015'
		SET @dateOutParam = '2006-01-02'
		SET @smalldatetimeOutParam = '2006-01-02 22:04:00'
		SET @datetimeOutParam = '2006-01-02 22:04:05.787'
		SET @datetime2OutParam = '2006-01-02 22:04:05.7870015'
		SET @datetimeoffsetOutParam = '2006-01-02 22:04:05.7870015 -07:00'`
	_, err := db.Exec(CreateProcSql)
	if err != nil {
		log.Fatal(err)
	}
	var (
		timeOutParam, datetime2OutParam, datetimeoffsetOutParam mssql.DateTimeOffset
		dateOutParam, datetimeOutParam                          mssql.DateTime1
		smalldatetimeOutParam                                   string
	)
	_, err = db.Exec("OutDatetimeProc",
		sql.Named("timeOutParam", sql.Out{Dest: &timeOutParam}),
		sql.Named("dateOutParam", sql.Out{Dest: &dateOutParam}),
		sql.Named("smalldatetimeOutParam", sql.Out{Dest: &smalldatetimeOutParam}),
		sql.Named("datetimeOutParam", sql.Out{Dest: &datetimeOutParam}),
		sql.Named("datetime2OutParam", sql.Out{Dest: &datetime2OutParam}),
		sql.Named("datetimeoffsetOutParam", sql.Out{Dest: &datetimeoffsetOutParam}))
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("timeOutParam: %+v; dateOutParam: %+v; smalldatetimeOutParam: %s; datetimeOutParam: %+v; datetime2OutParam: %+v; datetimeoffsetOutParam: %+v;\n", time.Time(timeOutParam), time.Time(dateOutParam), smalldatetimeOutParam, time.Time(datetimeOutParam), time.Time(datetime2OutParam), time.Time(datetimeoffsetOutParam))
}

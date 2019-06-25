// +build go1.10

package mssql_test

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/url"
	"strconv"

	mssql "github.com/denisenkom/go-mssqldb"
)

var (
	debug         = flag.Bool("debug", false, "enable debugging")
	password      = flag.String("password", "", "the database password")
	port     *int = flag.Int("port", 1433, "the database port")
	server        = flag.String("server", "", "the database server")
	user          = flag.String("user", "", "the database user")
)

const (
	createTableSql      = "CREATE TABLE TestAnsiNull (bitcol bit, charcol char(1));"
	dropTableSql        = "IF OBJECT_ID('TestAnsiNull', 'U') IS NOT NULL DROP TABLE TestAnsiNull;"
	insertQuery1        = "INSERT INTO TestAnsiNull VALUES (0, NULL);"
	insertQuery2        = "INSERT INTO TestAnsiNull VALUES (1, 'a');"
	selectNullFilter    = "SELECT bitcol FROM TestAnsiNull WHERE charcol = NULL;"
	selectNotNullFilter = "SELECT bitcol FROM TestAnsiNull WHERE charcol <> NULL;"
)

func makeConnURL() *url.URL {
	return &url.URL{
		Scheme: "sqlserver",
		Host:   *server + ":" + strconv.Itoa(*port),
		User:   url.UserPassword(*user, *password),
	}
}

// This example shows the usage of Connector type
func ExampleConnector() {
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

	// Create a new connector object by calling NewConnector
	connector, err := mssql.NewConnector(connString)
	if err != nil {
		log.Println(err)
		return
	}

	// Use SessionInitSql to set any options that cannot be set with the dsn string
	// With ANSI_NULLS set to ON, compare NULL data with = NULL or <> NULL will return 0 rows
	connector.SessionInitSQL = "SET ANSI_NULLS ON"

	// Pass connector to sql.OpenDB to get a sql.DB object
	db := sql.OpenDB(connector)
	defer db.Close()

	// Create and populate table
	_, err = db.Exec(createTableSql)
	if err != nil {
		log.Println(err)
		return
	}
	defer db.Exec(dropTableSql)
	_, err = db.Exec(insertQuery1)
	if err != nil {
		log.Println(err)
		return
	}
	_, err = db.Exec(insertQuery2)
	if err != nil {
		log.Println(err)
		return
	}

	var bitval bool
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// (*Row) Scan should return ErrNoRows since ANSI_NULLS is set to ON
	err = db.QueryRowContext(ctx, selectNullFilter).Scan(&bitval)
	if err != nil {
		if err.Error() != "sql: no rows in result set" {
			log.Println(err)
			return
		}
	} else {
		log.Println("Expects an ErrNoRows error. No error is returned")
		return
	}

	// (*Row) Scan should return ErrNoRows since ANSI_NULLS is set to ON
	err = db.QueryRowContext(ctx, selectNotNullFilter).Scan(&bitval)
	if err != nil {
		if err.Error() != "sql: no rows in result set" {
			log.Println(err)
			return
		}
	} else {
		log.Println("Expects an ErrNoRows error. No error is returned")
		return
	}

	// Set ANSI_NULLS to OFF
	connector.SessionInitSQL = "SET ANSI_NULLS OFF"

	// (*Row) Scan should copy data to bitval
	err = db.QueryRowContext(ctx, selectNullFilter).Scan(&bitval)
	if err != nil {
		log.Println(err)
		return
	}
	if bitval != false {
		log.Println("Incorrect value retrieved.")
		return
	}

	// (*Row) Scan should copy data to bitval
	err = db.QueryRowContext(ctx, selectNotNullFilter).Scan(&bitval)
	if err != nil {
		log.Println(err)
		return
	}
	if bitval != true {
		log.Println("Incorrect value retrieved.")
		return
	}
}

package main

import (
	"database/sql"
	"flag"
	"fmt"
	"github.com/denisenkom/go-mssqldb"
	"log"
)

var (
	debug    = flag.Bool("debug", false, "enable debugging")
	password = flag.String("password", "", "the database password")
	port     = flag.Int("port", 1433, "the database port")
	server   = flag.String("server", "", "the database server")
	user     = flag.String("user", "", "the database user")
)

type TvpExample struct {
	MessageWithoutAnyTag      string
	MessageWithJSONTag        string `json:"message"`
	MessageWithTVPTag         string `tvp:"message"`
	MessageJSONSkipWithTVPTag string `json:"-" tvp:"message"`

	OmitFieldJSONTag string `json:"-"`
	OmitFieldTVPTag  string `json:"any" tvp:"-"`
	OmitFieldTVPTag2 string `tvp:"-"`
}

const (
	crateSchema = `create schema TestTVPSchema;`

	dropSchema = `drop schema TestTVPSchema;`

	createTVP = `
		CREATE TYPE TestTVPSchema.exampleTVP AS TABLE
		(
			message1	NVARCHAR(100),
			message2	NVARCHAR(100),
			message3	NVARCHAR(100),
			message4	NVARCHAR(100)
		)`

	dropTVP = `DROP TYPE TestTVPSchema.exampleTVP;`

	procedureWithTVP = `	
	CREATE PROCEDURE ExecTVP
		@param1 TestTVPSchema.exampleTVP READONLY
	AS   
	BEGIN
		SET NOCOUNT ON; 
		SELECT * FROM @param1;
	END;
	`

	dropProcedure = `drop PROCEDURE ExecTVP`

	execTvp = `exec ExecTVP @param1;`
)

func main() {
	flag.Parse()

	if *debug {
		fmt.Printf(" password:%s\n", *password)
		fmt.Printf(" port:%d\n", *port)
		fmt.Printf(" server:%s\n", *server)
		fmt.Printf(" user:%s\n", *user)
	}

	connString := fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d", *server, *user, *password, *port)
	if *debug {
		fmt.Printf(" connString:%s\n", connString)
	}
	conn, err := sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal("Open connection failed:", err.Error())
	}
	defer conn.Close()

	_, err = conn.Exec(crateSchema)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Exec(dropSchema)

	_, err = conn.Exec(createTVP)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Exec(dropTVP)

	_, err = conn.Exec(procedureWithTVP)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Exec(dropProcedure)

	exampleData := []TvpExample{
		{
			MessageWithoutAnyTag:      "Hello1",
			MessageWithJSONTag:        "Hello2",
			MessageWithTVPTag:         "Hello3",
			MessageJSONSkipWithTVPTag: "Hello4",
			OmitFieldJSONTag:          "Hello5",
			OmitFieldTVPTag:           "Hello6",
			OmitFieldTVPTag2:          "Hello7",
		},
		{
			MessageWithoutAnyTag:      "World1",
			MessageWithJSONTag:        "World2",
			MessageWithTVPTag:         "World3",
			MessageJSONSkipWithTVPTag: "World4",
			OmitFieldJSONTag:          "World5",
			OmitFieldTVPTag:           "World6",
			OmitFieldTVPTag2:          "World7",
		},
	}

	tvpType := mssql.TVP{
		TypeName: "TestTVPSchema.exampleTVP",
		Value:    exampleData,
	}

	rows, err := conn.Query(execTvp,
		sql.Named("param1", tvpType),
	)
	if err != nil {
		log.Println(err)
		return
	}

	tvpResult := make([]TvpExample, 0)
	for rows.Next() {
		tvpExample := TvpExample{}
		err = rows.Scan(&tvpExample.MessageWithoutAnyTag,
			&tvpExample.MessageWithJSONTag,
			&tvpExample.MessageWithTVPTag,
			&tvpExample.MessageJSONSkipWithTVPTag,
		)
		if err != nil {
			log.Println(err)
			return
		}
		tvpResult = append(tvpResult, tvpExample)
	}
	fmt.Println(tvpResult)
}

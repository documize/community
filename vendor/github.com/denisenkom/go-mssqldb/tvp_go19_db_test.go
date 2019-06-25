// +build go1.9

package mssql

import (
	"context"
	"database/sql"
	"log"
	"reflect"
	"testing"
	"time"
)

const (
	crateSchema = `create schema TestTVPSchema;`

	dropSchema = `drop schema TestTVPSchema;`

	createTVP = `
		CREATE TYPE TestTVPSchema.exempleTVP AS TABLE
		(
			message	NVARCHAR(100)
		)`

	dropTVP = `DROP TYPE TestTVPSchema.exempleTVP;`

	procedureWithTVP = `	
	CREATE PROCEDURE ExecTVP
		@param1 TestTVPSchema.exempleTVP READONLY
	AS   
	BEGIN
		SET NOCOUNT ON; 
		SELECT * FROM @param1;
	END;
	`

	dropProcedure = `drop PROCEDURE ExecTVP`

	execTvp = `exec ExecTVP @param1;`
)

type TvptableRow struct {
	PBinary       []byte            `db:"p_binary"`
	PVarchar      string            `db:"p_varchar"`
	PVarcharNull  *string           `db:"p_varcharNull"`
	PNvarchar     string            `db:"p_nvarchar"`
	PNvarcharNull *string           `db:"p_nvarcharNull"`
	PID           UniqueIdentifier  `db:"p_id"`
	PIDNull       *UniqueIdentifier `db:"p_idNull"`
	PVarbinary    []byte            `db:"p_varbinary"`
	PTinyint      int8              `db:"p_tinyint"`
	PTinyintNull  *int8             `db:"p_tinyintNull"`
	PSmallint     int16             `db:"p_smallint"`
	PSmallintNull *int16            `db:"p_smallintNull"`
	PInt          int32             `db:"p_int"`
	PIntNull      *int32            `db:"p_intNull"`
	PBigint       int64             `db:"p_bigint"`
	PBigintNull   *int64            `db:"p_bigintNull"`
	PBit          bool              `db:"p_bit"`
	PBitNull      *bool             `db:"p_bitNull"`
	PFloat32      float32           `db:"p_float32"`
	PFloatNull32  *float32          `db:"p_floatNull32"`
	PFloat64      float64           `db:"p_float64"`
	PFloatNull64  *float64          `db:"p_floatNull64"`
	DTime         time.Time         `db:"p_timeNull"`
	DTimeNull     *time.Time        `db:"p_time"`
	Pint          int               `db:"pInt"`
	PintNull      *int              `db:"pIntNull"`
}

type TvptableRowWithSkipTag struct {
	PBinary           []byte            `db:"p_binary"`
	SkipPBinary       []byte            `json:"-"`
	PVarchar          string            `db:"p_varchar"`
	SkipPVarchar      string            `tvp:"-"`
	PVarcharNull      *string           `db:"p_varcharNull"`
	SkipPVarcharNull  *string           `json:"-" tvp:"-"`
	PNvarchar         string            `db:"p_nvarchar"`
	SkipPNvarchar     string            `json:"-"`
	PNvarcharNull     *string           `db:"p_nvarcharNull"`
	SkipPNvarcharNull *string           `json:"-"`
	PID               UniqueIdentifier  `db:"p_id"`
	SkipPID           UniqueIdentifier  `json:"-"`
	PIDNull           *UniqueIdentifier `db:"p_idNull"`
	SkipPIDNull       *UniqueIdentifier `tvp:"-"`
	PVarbinary        []byte            `db:"p_varbinary"`
	SkipPVarbinary    []byte            `json:"-" tvp:"-"`
	PTinyint          int8              `db:"p_tinyint"`
	SkipPTinyint      int8              `tvp:"-"`
	PTinyintNull      *int8             `db:"p_tinyintNull"`
	SkipPTinyintNull  *int8             `tvp:"-" json:"any"`
	PSmallint         int16             `db:"p_smallint"`
	SkipPSmallint     int16             `json:"-"`
	PSmallintNull     *int16            `db:"p_smallintNull"`
	SkipPSmallintNull *int16            `tvp:"-"`
	PInt              int32             `db:"p_int"`
	SkipPInt          int32             `json:"-"`
	PIntNull          *int32            `db:"p_intNull"`
	SkipPIntNull      *int32            `tvp:"-"`
	PBigint           int64             `db:"p_bigint"`
	SkipPBigint       int64             `tvp:"-"`
	PBigintNull       *int64            `db:"p_bigintNull"`
	SkipPBigintNull   *int64            `json:"any" tvp:"-"`
	PBit              bool              `db:"p_bit"`
	SkipPBit          bool              `json:"-"`
	PBitNull          *bool             `db:"p_bitNull"`
	SkipPBitNull      *bool             `json:"-"`
	PFloat32          float32           `db:"p_float32"`
	SkipPFloat32      float32           `tvp:"-"`
	PFloatNull32      *float32          `db:"p_floatNull32"`
	SkipPFloatNull32  *float32          `tvp:"-"`
	PFloat64          float64           `db:"p_float64"`
	SkipPFloat64      float64           `tvp:"-"`
	PFloatNull64      *float64          `db:"p_floatNull64"`
	SkipPFloatNull64  *float64          `tvp:"-"`
	DTime             time.Time         `db:"p_timeNull"`
	SkipDTime         time.Time         `tvp:"-"`
	DTimeNull         *time.Time        `db:"p_time"`
	SkipDTimeNull     *time.Time        `tvp:"-"`
	Pint              int               `db:"p_int_null"`
	SkipPint          int               `tvp:"-"`
	PintNull          *int              `db:"p_int_"`
	SkipPintNull      *int              `tvp:"-"`
}

func TestTVP(t *testing.T) {
	checkConnStr(t)
	SetLogger(testLogger{t})

	db, err := sql.Open("sqlserver", makeConnStr(t).String())
	if err != nil {
		t.Fatalf("failed to open driver sqlserver")
	}
	defer db.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sqltextcreatetable := `
		CREATE TYPE tvptable AS TABLE
		(
			p_binary 			BINARY(3),
			p_varchar 			VARCHAR(500),
			p_varcharNull 		VARCHAR(500),
			p_nvarchar 			NVARCHAR(100),
			p_nvarcharNull 		NVARCHAR(100),
			p_id 				UNIQUEIDENTIFIER,
			p_idNull 			UNIQUEIDENTIFIER,
			p_varbinary 		VARBINARY(MAX),
			p_tinyint 			TINYINT,
			p_tinyintNull 		TINYINT,
			p_smallint          SMALLINT,
			p_smallintNull      SMALLINT,
			p_int               INT,
			p_intNull           INT,
			p_bigint            BIGINT,
			p_bigintNull        BIGINT,
			p_bit               BIT,
			p_bitNull           BIT,
			p_float32           FLOAT,
			p_floatNull32       FLOAT,
			p_float64           FLOAT,
			p_floatNull64       FLOAT,
			p_time 				datetime2,
			p_timeNull			datetime2,
			pInt              	INT,
			pIntNull          	INT
		); `

	sqltextdroptable := `DROP TYPE tvptable;`

	sqltextcreatesp := `
	CREATE PROCEDURE spwithtvp
		@param1 tvptable READONLY,
		@param2 tvptable READONLY,
		@param3 NVARCHAR(10)
	AS   
	BEGIN
		SET NOCOUNT ON; 
		SELECT * FROM @param1;
		SELECT * FROM @param2;
		SELECT @param3;
	END;`

	sqltextdropsp := `DROP PROCEDURE spwithtvp;`

	db.ExecContext(ctx, sqltextdropsp)
	db.ExecContext(ctx, sqltextdroptable)

	_, err = db.ExecContext(ctx, sqltextcreatetable)
	if err != nil {
		t.Fatal(err)
	}
	defer db.ExecContext(ctx, sqltextdroptable)

	_, err = db.ExecContext(ctx, sqltextcreatesp)
	if err != nil {
		t.Fatal(err)
	}
	defer db.ExecContext(ctx, sqltextdropsp)
	varcharNull := "aaa"
	nvarchar := "bbb"
	bytesMock := []byte("ddd")
	i8 := int8(1)
	i16 := int16(2)
	i32 := int32(3)
	i64 := int64(4)
	i := int(5)
	bFalse := false
	floatValue64 := 0.123
	floatValue32 := float32(-10.123)
	timeNow := time.Now().UTC()
	param1 := []TvptableRow{
		{
			PBinary:    []byte("ccc"),
			PVarchar:   varcharNull,
			PNvarchar:  nvarchar,
			PID:        UniqueIdentifier{0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF, 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF},
			PVarbinary: bytesMock,
			PTinyint:   i8,
			PSmallint:  i16,
			PInt:       i32,
			PBigint:    i64,
			PBit:       bFalse,
			PFloat32:   floatValue32,
			PFloat64:   floatValue64,
			DTime:      timeNow,
			Pint:       355,
		},
		{
			PBinary:    []byte("www"),
			PVarchar:   "eee",
			PNvarchar:  "lll",
			PID:        UniqueIdentifier{0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF, 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF},
			PVarbinary: []byte("zzz"),
			PTinyint:   5,
			PSmallint:  16000,
			PInt:       20000000,
			PBigint:    2000000020000000,
			PBit:       true,
			PFloat32:   -123.45,
			PFloat64:   -123.45,
			DTime:      time.Date(2001, 11, 16, 23, 59, 39, 0, time.UTC),
			Pint:       455,
		},
		{
			PBinary:       nil,
			PVarcharNull:  &varcharNull,
			PNvarcharNull: &nvarchar,
			PIDNull:       &UniqueIdentifier{0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF, 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF},
			PTinyintNull:  &i8,
			PSmallintNull: &i16,
			PIntNull:      &i32,
			PBigintNull:   &i64,
			PBitNull:      &bFalse,
			PFloatNull32:  &floatValue32,
			PFloatNull64:  &floatValue64,
			DTime:         timeNow,
			DTimeNull:     &timeNow,
			PintNull:      &i,
		},
		{
			PBinary:       []byte("www"),
			PVarchar:      "eee",
			PNvarchar:     "lll",
			PIDNull:       &UniqueIdentifier{},
			PVarbinary:    []byte("zzz"),
			PTinyint:      5,
			PSmallint:     16000,
			PInt:          20000000,
			PBigint:       2000000020000000,
			PBit:          true,
			PFloat64:      123.45,
			DTime:         time.Date(2001, 11, 16, 23, 59, 39, 0, time.UTC),
			PVarcharNull:  &varcharNull,
			PNvarcharNull: &nvarchar,
			PTinyintNull:  &i8,
			PSmallintNull: &i16,
			PIntNull:      &i32,
			PBigintNull:   &i64,
			PBitNull:      &bFalse,
			PFloatNull32:  &floatValue32,
			PFloatNull64:  &floatValue64,
			DTimeNull:     &timeNow,
			PintNull:      &i,
		},
	}

	tvpType := TVP{
		TypeName: "tvptable",
		Value:    param1,
	}
	tvpTypeEmpty := TVP{
		TypeName: "tvptable",
		Value:    []TvptableRow{},
	}

	rows, err := db.QueryContext(ctx,
		"exec spwithtvp @param1, @param2, @param3",
		sql.Named("param1", tvpType),
		sql.Named("param2", tvpTypeEmpty),
		sql.Named("param3", "test"),
	)

	if err != nil {
		t.Fatal(err)
	}

	var result1 []TvptableRow
	for rows.Next() {
		var val TvptableRow
		err := rows.Scan(
			&val.PBinary,
			&val.PVarchar,
			&val.PVarcharNull,
			&val.PNvarchar,
			&val.PNvarcharNull,
			&val.PID,
			&val.PIDNull,
			&val.PVarbinary,
			&val.PTinyint,
			&val.PTinyintNull,
			&val.PSmallint,
			&val.PSmallintNull,
			&val.PInt,
			&val.PIntNull,
			&val.PBigint,
			&val.PBigintNull,
			&val.PBit,
			&val.PBitNull,
			&val.PFloat32,
			&val.PFloatNull32,
			&val.PFloat64,
			&val.PFloatNull64,
			&val.DTime,
			&val.DTimeNull,
			&val.Pint,
			&val.PintNull,
		)
		if err != nil {
			t.Fatalf("scan failed with error: %s", err)
		}

		result1 = append(result1, val)
	}

	if !reflect.DeepEqual(param1, result1) {
		t.Logf("expected: %+v", param1)
		t.Logf("actual: %+v", result1)
		t.Errorf("first resultset did not match param1")
	}

	if !rows.NextResultSet() {
		t.Errorf("second resultset did not exist")
	}

	if rows.Next() {
		t.Errorf("second resultset was not empty")
	}

	if !rows.NextResultSet() {
		t.Errorf("third resultset did not exist")
	}

	if !rows.Next() {
		t.Errorf("third resultset was empty")
	}

	var result3 string
	if err := rows.Scan(&result3); err != nil {
		t.Errorf("error scanning third result set: %s", err)
	}
	if result3 != "test" {
		t.Errorf("third result set had wrong value expected: %s actual: %s", "test", result3)
	}
}

func TestTVP_WithTag(t *testing.T) {
	checkConnStr(t)
	SetLogger(testLogger{t})

	db, err := sql.Open("sqlserver", makeConnStr(t).String())
	if err != nil {
		t.Fatalf("failed to open driver sqlserver")
	}
	defer db.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sqltextcreatetable := `
		CREATE TYPE tvptable AS TABLE
		(
			p_binary 			BINARY(3),
			p_varchar 			VARCHAR(500),
			p_varcharNull 		VARCHAR(500),
			p_nvarchar 			NVARCHAR(100),
			p_nvarcharNull 		NVARCHAR(100),
			p_id 				UNIQUEIDENTIFIER,
			p_idNull 			UNIQUEIDENTIFIER,
			p_varbinary 		VARBINARY(MAX),
			p_tinyint 			TINYINT,
			p_tinyintNull 		TINYINT,
			p_smallint          SMALLINT,
			p_smallintNull      SMALLINT,
			p_int               INT,
			p_intNull           INT,
			p_bigint            BIGINT,
			p_bigintNull        BIGINT,
			p_bit               BIT,
			p_bitNull           BIT,
			p_float32           FLOAT,
			p_floatNull32       FLOAT,
			p_float64           FLOAT,
			p_floatNull64       FLOAT,
			p_time 				datetime2,
			p_timeNull			datetime2,
			pInt              	INT,
			pIntNull          	INT
		); `

	sqltextdroptable := `DROP TYPE tvptable;`

	sqltextcreatesp := `
	CREATE PROCEDURE spwithtvp
		@param1 tvptable READONLY,
		@param2 tvptable READONLY,
		@param3 NVARCHAR(10)
	AS   
	BEGIN
		SET NOCOUNT ON; 
		SELECT * FROM @param1;
		SELECT * FROM @param2;
		SELECT @param3;
	END;`

	sqltextdropsp := `DROP PROCEDURE spwithtvp;`

	db.ExecContext(ctx, sqltextdropsp)
	db.ExecContext(ctx, sqltextdroptable)

	_, err = db.ExecContext(ctx, sqltextcreatetable)
	if err != nil {
		t.Fatal(err)
	}
	defer db.ExecContext(ctx, sqltextdroptable)

	_, err = db.ExecContext(ctx, sqltextcreatesp)
	if err != nil {
		t.Fatal(err)
	}
	defer db.ExecContext(ctx, sqltextdropsp)

	varcharNull := "aaa"
	nvarchar := "bbb"
	bytesMock := []byte("ddd")
	i8 := int8(1)
	i16 := int16(2)
	i32 := int32(3)
	i64 := int64(4)
	i := int(355)
	bFalse := false
	floatValue64 := 0.123
	floatValue32 := float32(-10.123)
	timeNow := time.Now().UTC()
	param1 := []TvptableRowWithSkipTag{
		{
			PBinary:    []byte("ccc"),
			PVarchar:   varcharNull,
			PNvarchar:  nvarchar,
			PID:        UniqueIdentifier{0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF, 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF},
			PVarbinary: bytesMock,
			PTinyint:   i8,
			PSmallint:  i16,
			PInt:       i32,
			PBigint:    i64,
			PBit:       bFalse,
			PFloat32:   floatValue32,
			PFloat64:   floatValue64,
			DTime:      timeNow,
			Pint:       i,
			PintNull:   &i,
		},
		{
			PBinary:    []byte("www"),
			PVarchar:   "eee",
			PNvarchar:  "lll",
			PID:        UniqueIdentifier{0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF, 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF},
			PVarbinary: []byte("zzz"),
			PTinyint:   5,
			PSmallint:  16000,
			PInt:       20000000,
			PBigint:    2000000020000000,
			PBit:       true,
			PFloat32:   -123.45,
			PFloat64:   -123.45,
			DTime:      time.Date(2001, 11, 16, 23, 59, 39, 0, time.UTC),
			Pint:       3669,
			PintNull:   &i,
		},
		{
			PBinary:       nil,
			PVarcharNull:  &varcharNull,
			PNvarcharNull: &nvarchar,
			PIDNull:       &UniqueIdentifier{0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF, 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF},
			PTinyintNull:  &i8,
			PSmallintNull: &i16,
			PIntNull:      &i32,
			PBigintNull:   &i64,
			PBitNull:      &bFalse,
			PFloatNull32:  &floatValue32,
			PFloatNull64:  &floatValue64,
			DTime:         timeNow,
			DTimeNull:     &timeNow,
			Pint:          969,
		},
		{
			PBinary:       []byte("www"),
			PVarchar:      "eee",
			PNvarchar:     "lll",
			PIDNull:       &UniqueIdentifier{},
			PVarbinary:    []byte("zzz"),
			PTinyint:      5,
			PSmallint:     16000,
			PInt:          20000000,
			PBigint:       2000000020000000,
			PBit:          true,
			PFloat64:      123.45,
			DTime:         time.Date(2001, 11, 16, 23, 59, 39, 0, time.UTC),
			PVarcharNull:  &varcharNull,
			PNvarcharNull: &nvarchar,
			PTinyintNull:  &i8,
			PSmallintNull: &i16,
			PIntNull:      &i32,
			PBigintNull:   &i64,
			PBitNull:      &bFalse,
			PFloatNull32:  &floatValue32,
			PFloatNull64:  &floatValue64,
			DTimeNull:     &timeNow,
			PintNull:      &i,
		},
	}

	tvpType := TVP{
		TypeName: "tvptable",
		Value:    param1,
	}
	tvpTypeEmpty := TVP{
		TypeName: "tvptable",
		Value:    []TvptableRowWithSkipTag{},
	}

	rows, err := db.QueryContext(ctx,
		"exec spwithtvp @param1, @param2, @param3",
		sql.Named("param1", tvpType),
		sql.Named("param2", tvpTypeEmpty),
		sql.Named("param3", "test"),
	)

	if err != nil {
		t.Fatal(err)
	}

	var result1 []TvptableRowWithSkipTag
	for rows.Next() {
		var val TvptableRowWithSkipTag
		err := rows.Scan(
			&val.PBinary,
			&val.PVarchar,
			&val.PVarcharNull,
			&val.PNvarchar,
			&val.PNvarcharNull,
			&val.PID,
			&val.PIDNull,
			&val.PVarbinary,
			&val.PTinyint,
			&val.PTinyintNull,
			&val.PSmallint,
			&val.PSmallintNull,
			&val.PInt,
			&val.PIntNull,
			&val.PBigint,
			&val.PBigintNull,
			&val.PBit,
			&val.PBitNull,
			&val.PFloat32,
			&val.PFloatNull32,
			&val.PFloat64,
			&val.PFloatNull64,
			&val.DTime,
			&val.DTimeNull,
			&val.Pint,
			&val.PintNull,
		)
		if err != nil {
			t.Fatalf("scan failed with error: %s", err)
		}

		result1 = append(result1, val)
	}

	if !reflect.DeepEqual(param1, result1) {
		t.Logf("expected: %+v", param1)
		t.Logf("actual: %+v", result1)
		t.Errorf("first resultset did not match param1")
	}

	if !rows.NextResultSet() {
		t.Errorf("second resultset did not exist")
	}

	if rows.Next() {
		t.Errorf("second resultset was not empty")
	}

	if !rows.NextResultSet() {
		t.Errorf("third resultset did not exist")
	}

	if !rows.Next() {
		t.Errorf("third resultset was empty")
	}

	var result3 string
	if err := rows.Scan(&result3); err != nil {
		t.Errorf("error scanning third result set: %s", err)
	}
	if result3 != "test" {
		t.Errorf("third result set had wrong value expected: %s actual: %s", "test", result3)
	}
}

type TvpExample struct {
	Message string
}

func TestTVPSchema(t *testing.T) {
	checkConnStr(t)
	SetLogger(testLogger{t})

	conn, err := sql.Open("sqlserver", makeConnStr(t).String())
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

	exempleData := []TvpExample{
		{
			Message: "Hello",
		},
		{
			Message: "World",
		},
		{
			Message: "TVP",
		},
	}

	tvpType := TVP{
		TypeName: "exempleTVP",
		Value:    exempleData,
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
		tvpExemple := TvpExample{}
		err = rows.Scan(&tvpExemple.Message)
		if err != nil {
			log.Println(err)
			return
		}
		tvpResult = append(tvpResult, tvpExemple)
	}
	log.Println(tvpResult)
}

func TestTVPObject(t *testing.T) {
	checkConnStr(t)
	SetLogger(testLogger{t})

	conn, err := sql.Open("sqlserver", makeConnStr(t).String())
	if err != nil {
		log.Fatal("Open connection failed:", err.Error())
	}
	defer conn.Close()

	tests := []struct {
		name    string
		tvp     TVP
		wantErr bool
	}{
		{
			name:    "empty name",
			wantErr: true,
			tvp:     TVP{TypeName: ""},
		},
		{
			name:    "value is wrong type",
			wantErr: true,
			tvp:     TVP{TypeName: "type", Value: "wrong type"},
		},
		{
			name:    "tvp type is wrong",
			wantErr: true,
			tvp:     TVP{TypeName: "[type", Value: []TvpExample{{}}},
		},
		{
			name:    "tvp type is wrong",
			wantErr: true,
			tvp:     TVP{TypeName: "[type", Value: []TestFieldsUnsupportedTypes{{}}},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := conn.Exec("somequery", tt.tvp)
			if (err != nil) != tt.wantErr {
				t.Errorf("TVP.encode() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
		})
	}
}

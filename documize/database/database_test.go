package database

/*
import (
	"strings"
	"testing"

	"github.com/documize/community/documize/api/request"

	"github.com/documize/community/wordsmith/environment"
)

// Part of the test code below from https://searchcode.com/codesearch/view/88832051/
//
// Go MySQL Driver - A MySQL-Driver for Go's database/sql package
//
// Copyright 2013 The Go-MySQL-Driver Authors. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at http://mozilla.org/MPL/2.0/.

func TestLongData(t *testing.T) {
	environment.Parse()
	var maxAllowedPacketSize int
	rows, err := request.Db.Query("select @@max_allowed_packet")
	if err != nil {
		t.Fatal(err)
	}
	if rows.Next() {
		if err = rows.Scan(&maxAllowedPacketSize); err != nil {
			t.Fatal(err)
		}
	}
	t.Logf("maxAllowedPacketSize=%d", maxAllowedPacketSize)

	maxAllowedPacketSize--

	// don't get too ambitious
	if maxAllowedPacketSize > 1<<25 {
		maxAllowedPacketSize = 1 << 25
	}

	request.Db.MustExec("DROP TABLE IF EXISTS `test`;")

	request.Db.MustExec("CREATE TABLE test (value LONGBLOB)")

	in := strings.Repeat(`a`, maxAllowedPacketSize+1)
	var out string

	// Long text data
	const nonDataQueryLen = 28 // length query w/o value
	inS := in[:maxAllowedPacketSize-nonDataQueryLen]
	request.Db.MustExec("INSERT INTO test VALUES('" + inS + "')")
	rows, err = request.Db.Query("SELECT value FROM test")
	if err != nil {
		t.Fatal(err)
	}
	if rows.Next() {
		if err = rows.Scan(&out); err != nil {
			t.Fatal(err)
		}
		if inS != out {
			t.Fatalf("LONGBLOB: length in: %d, length out: %d", len(inS), len(out))
		}
		if rows.Next() {
			t.Error("LONGBLOB: unexpexted row")
		}
	} else {
		t.Fatalf("LONGBLOB: no data")
	}

	// Empty table
	request.Db.MustExec("TRUNCATE TABLE test")

	// Long binary data
	request.Db.MustExec("INSERT INTO test VALUES(?)", in)
	rows, err = request.Db.Query("SELECT value FROM test WHERE 1=?", 1)
	if err != nil {
		t.Fatal(err)
	}
	if rows.Next() {
		if err = rows.Scan(&out); err != nil {
			t.Fatal(err)
		}
		if in != out {
			t.Fatalf("LONGBLOB: length in: %d, length out: %d", len(in), len(out))
		}
		if rows.Next() {
			t.Error("LONGBLOB: unexpexted row")
		}
	} else {
		if err = rows.Err(); err != nil {
			t.Fatalf("LONGBLOB: no data (err: %s)", err.Error())
		} else {
			t.Fatal("LONGBLOB: no data (err: <nil>)")
		}
	}

}

*/

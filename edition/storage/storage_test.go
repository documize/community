// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

package storage

// go test -timeout 30s github.com/documize/community/edition/storage -v

import (
	"testing"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/store"
)

func TestSQLServerProviderDatabaseName(t *testing.T) {
	r := env.Runtime{}
	s := store.Store{}
	r.Flags.DBType = "sqlserver"
	r.Flags.DBConn = "sqlserver://username:password@host:port?database=Test1Documize"

	SetSQLServerProvider(&r, &s)

	if r.StoreProvider.DatabaseName() != "Test1Documize" {
		t.Errorf("expected %s got %s", "Test1Documize", r.StoreProvider.DatabaseName())
	}

	t.Log(r.StoreProvider.MakeConnectionString())
}

func TestSQLServerProviderDatabaseNameWithParams(t *testing.T) {
	r := env.Runtime{}
	s := store.Store{}
	r.Flags.DBType = "sqlserver"
	r.Flags.DBConn = "sqlserver://username:password@host:port?database=Test2Documize&some=param"

	SetSQLServerProvider(&r, &s)

	if r.StoreProvider.DatabaseName() != "Test2Documize" {
		t.Errorf("expected %s got %s", "Test2Documize", r.StoreProvider.DatabaseName())
	}

	t.Log(r.StoreProvider.MakeConnectionString())
}

func TestSQLServerVersion(t *testing.T) {
	r := env.Runtime{}
	s := store.Store{}
	r.Flags.DBType = "sqlserver"
	r.Flags.DBConn = "sqlserver://username:password@host:port?database=Test2Documize&some=param"

	SetSQLServerProvider(&r, &s)

	version := "15.0.1300.359"
	ok, msg := r.StoreProvider.VerfiyVersion(version)
	if !ok {
		t.Errorf("2019 check failed: %s", msg)
	}
	t.Log(version)

	version = "14.0.3048.4"
	ok, msg = r.StoreProvider.VerfiyVersion(version)
	if !ok {
		t.Errorf("2017 check failed: %s", msg)
	}
	t.Log(version)

	version = "13.0.1601.5"
	ok, msg = r.StoreProvider.VerfiyVersion(version)
	if !ok {
		t.Errorf("2016 check failed: %s", msg)
	}
	t.Log(version)

	version = "12.0.6214.1"
	ok, msg = r.StoreProvider.VerfiyVersion(version)
	if ok {
		t.Errorf("unsupported release check failed: %s", msg)
	}
	t.Log(version)
}

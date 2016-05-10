package database

import (
	"fmt"
	"sort"
	"strings"

	"github.com/documize/community/documize/web"
)

const migrationsDir = "bindata/scripts/migrate"

// MigrationsT holds a list of migration sql files to run.
type MigrationsT []string

// Migrations returns a list of the migrations to update the database as required for this version of the code.
func Migrations(last_migration string) (MigrationsT, error) {

	last_migration = strings.TrimPrefix(strings.TrimSuffix(last_migration, `"`), `"`)

	files, err := web.AssetDir(migrationsDir)
	if err != nil {
		return nil, err
	}
	sort.Strings(files)

	ret := make(MigrationsT, 0, len(files))

	hadLast := false

	for _, v := range files {
		if v == last_migration {
			hadLast = true
		} else {
			if hadLast {
				ret = append(ret, v)
			}
		}
	}

	return ret, nil
}

// Migrate the database as required.
func (m MigrationsT) Migrate() error {
	for _, v := range m {
		buf, err := web.Asset(migrationsDir + "/" + v)
		if err != nil {
			return err
		}
		fmt.Println("DEBUG database.Migrate() ", v, ":\n", string(buf)) // TODO actually run the SQL
	}
	return nil
}

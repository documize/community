#! /bin/bash

# ember s apiHost=https://demo1.dev:5001
# go run edition/community.go -port=5001 -forcesslport=5002 -cert selfcert/cert.pem -key selfcert/key.pem -salt=tsu3Acndky8cdTNx3

NOW=$(date)
echo "Build process started $NOW"

echo "Building Ember assets..."
cd gui
export NODE_OPTIONS=--openssl-legacy-provider
ember build ---environment=production --output-path dist-prod --suppress-sizes true
cd ..

echo "Copying Ember assets..."
rm -rf edition/static/public
mkdir -p edition/static/public
cp -r gui/dist-prod/assets edition/static/public
cp -r gui/dist-prod/codemirror edition/static/public/codemirror
cp -r gui/dist-prod/prism edition/static/public/prism
cp -r gui/dist-prod/sections edition/static/public/sections
cp -r gui/dist-prod/tinymce edition/static/public/tinymce
cp -r gui/dist-prod/pdfjs edition/static/public/pdfjs
cp -r gui/dist-prod/i18n edition/static/public/i18n
cp gui/dist-prod/*.* edition/static
cp gui/dist-prod/favicon.ico edition/static/public
cp gui/dist-prod/manifest.json edition/static/public

rm -rf edition/static/mail
mkdir -p edition/static/mail
cp domain/mail/*.html edition/static/mail
cp core/database/templates/*.html edition/static

rm -rf edition/static/i18n
mkdir -p edition/static/i18n
cp -r gui/dist-prod/i18n/*.json edition/static/i18n

rm -rf edition/static/scripts
mkdir -p edition/static/scripts
mkdir -p edition/static/scripts/mysql
mkdir -p edition/static/scripts/postgresql
mkdir -p edition/static/scripts/sqlserver
cp -r core/database/scripts/mysql/*.sql edition/static/scripts/mysql
cp -r core/database/scripts/postgresql/*.sql edition/static/scripts/postgresql
cp -r core/database/scripts/sqlserver/*.sql edition/static/scripts/sqlserver

rm -rf edition/static/onboard
mkdir -p edition/static/onboard
cp -r domain/onboard/*.json edition/static/onboard

echo "Compiling for macOS Intel..."
env GOOS=darwin GOARCH=amd64 go build -mod=vendor -trimpath -o bin/documize-community-darwin-amd64 ./edition/community.go
echo "Compiling for macOS ARM..."
env GOOS=darwin GOARCH=arm64 go build -mod=vendor -trimpath -o bin/documize-community-darwin-arm64 ./edition/community.go
echo "Compiling for Windows AMD..."
env GOOS=windows GOARCH=amd64 go build -mod=vendor -trimpath -o bin/documize-community-windows-amd64.exe ./edition/community.go
echo "Compiling for Linux AMD..."
env GOOS=linux GOARCH=amd64 go build -mod=vendor -trimpath -o bin/documize-community-linux-amd64 ./edition/community.go
echo "Compiling for Linux ARM..."
env GOOS=linux GOARCH=arm go build -mod=vendor -trimpath -o bin/documize-community-linux-arm ./edition/community.go
echo "Compiling for Linux ARM64..."
env GOOS=linux GOARCH=arm64 go build -mod=vendor -trimpath -o bin/documize-community-linux-arm64 ./edition/community.go
echo "Compiling for FreeBSD ARM64..."
env GOOS=freebsd GOARCH=arm64 go build -mod=vendor -trimpath -o bin/documize-community-freebsd-arm64 ./edition/community.go
echo "Compiling for FreeBSD AMD64..."
env GOOS=freebsd GOARCH=amd64 go build -mod=vendor -trimpath -o bin/documize-community-freebsd-amd64 ./edition/community.go

echo "Finished."

# CGO_ENABLED=0 GOOS=linux go build -a -ldflags="-s -w" -installsuffix cgo
# go build -ldflags '-d -s -w' -a -tags netgo -installsuffix netgo test.go
# ldd test

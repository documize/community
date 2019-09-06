#! /bin/bash

# ember s apiHost=https://demo1.dev:5001
# go run edition/community.go -port=5001 -forcesslport=5002 -cert selfcert/cert.pem -key selfcert/key.pem -salt=tsu3Acndky8cdTNx3

NOW=$(date)
echo "Build process started $NOW"

echo "Building Ember assets..."
cd gui
ember build ---environment=production --output-path dist-prod --suppress-sizes true
cd ..

echo "Copying Ember assets..."
rm -rf embed/bindata/public
mkdir -p embed/bindata/public
cp -r gui/dist-prod/assets embed/bindata/public
cp -r gui/dist-prod/codemirror embed/bindata/public/codemirror
cp -r gui/dist-prod/prism embed/bindata/public/prism
cp -r gui/dist-prod/sections embed/bindata/public/sections
cp -r gui/dist-prod/tinymce embed/bindata/public/tinymce
cp -r gui/dist-prod/pdfjs embed/bindata/public/pdfjs
cp gui/dist-prod/*.* embed/bindata
cp gui/dist-prod/favicon.ico embed/bindata/public
cp gui/dist-prod/manifest.json embed/bindata/public

rm -rf embed/bindata/mail
mkdir -p embed/bindata/mail
cp domain/mail/*.html embed/bindata/mail
cp core/database/templates/*.html embed/bindata

rm -rf embed/bindata/scripts
mkdir -p embed/bindata/scripts
mkdir -p embed/bindata/scripts/mysql
mkdir -p embed/bindata/scripts/postgresql
mkdir -p embed/bindata/scripts/sqlserver
cp -r core/database/scripts/mysql/*.sql embed/bindata/scripts/mysql
cp -r core/database/scripts/postgresql/*.sql embed/bindata/scripts/postgresql
cp -r core/database/scripts/sqlserver/*.sql embed/bindata/scripts/sqlserver

rm -rf embed/bindata/onboard
mkdir -p embed/bindata/onboard
cp -r domain/onboard/*.json embed/bindata/onboard

echo "Generating in-memory static assets..."
# go get -u github.com/jteeuwen/go-bindata/...
# go get -u github.com/elazarl/go-bindata-assetfs/...
cd embed
go generate

cd ..
echo "Compiling for Linux..."
env GOOS=linux GOARCH=amd64 go build -trimpath -o bin/documize-community-linux-amd64 ./edition/community.go
echo "Compiling for macOS..."
env GOOS=darwin GOARCH=amd64 go build -trimpath -o bin/documize-community-darwin-amd64 ./edition/community.go
echo "Compiling for Windows..."
env GOOS=windows GOARCH=amd64 go build -trimpath -o bin/documize-community-windows-amd64.exe ./edition/community.go
echo "Compiling for ARM..."
env GOOS=linux GOARCH=arm go build -trimpath -o bin/documize-community-linux-arm ./edition/community.go
echo "Compiling for ARM64..."
env GOOS=linux GOARCH=arm64 go build -trimpath -o bin/documize-community-linux-arm64 ./edition/community.go

echo "Finished."

# CGO_ENABLED=0 GOOS=linux go build -a -ldflags="-s -w" -installsuffix cgo
# go build -ldflags '-d -s -w' -a -tags netgo -installsuffix netgo test.go
# ldd test

# go build -a -o main -gcflags=all=-trimpath=/home/xibz -asmflags=all=-trimpath=/home/xibz main.go

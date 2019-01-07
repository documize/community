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
cp -r core/database/scripts/mysql/*.sql embed/bindata/scripts/mysql
cp -r core/database/scripts/postgresql/*.sql embed/bindata/scripts/postgresql

echo "Generating in-memory static assets..."
# go get -u github.com/jteeuwen/go-bindata/...
# go get -u github.com/elazarl/go-bindata-assetfs/...
cd embed
go generate

echo "Compiling app..."
cd ..
for arch in amd64 ; do
    for os in darwin linux windows ; do
        if [ "$os" == "windows" ] ; then
            echo "Compiling documize-community-$os-$arch.exe"
            env GOOS=$os GOARCH=$arch go build -gcflags="all=-trimpath=$GOPATH" -o bin/documize-community-$os-$arch.exe ./edition/community.go
        else
            echo "Compiling documize-community-$os-$arch"
            env GOOS=$os GOARCH=$arch go build -gcflags="all=-trimpath=$GOPATH" -o bin/documize-community-$os-$arch ./edition/community.go
        fi
    done
done

echo "Finished."


# CGO_ENABLED=0 GOOS=linux go build -a -ldflags="-s -w" -installsuffix cgo
# go build -ldflags '-d -s -w' -a -tags netgo -installsuffix netgo test.go
# ldd test

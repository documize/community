#! /bin/bash

NOW=$(date)
echo "Build process started $NOW"

# First parameter to this script is the Intercom.io key for audit logging.
# This is optional and we use Intercom to record user activity and provider in-app support via messaging.
intercomKey="$1"

echo "Building Ember assets..."
cd app
ember b -o dist-prod/ --environment=production intercom=$intercomKey

echo "Copying Ember assets..."
cd ..
rm -rf core/web/bindata/public
mkdir -p core/web/bindata/public
cp -r app/dist-prod/assets core/web/bindata/public
cp -r app/dist-prod/codemirror core/web/bindata/public/codemirror
cp -r app/dist-prod/tinymce core/web/bindata/public/tinymce
cp -r app/dist-prod/sections core/web/bindata/public/sections
cp app/dist-prod/*.* core/web/bindata
cp app/dist-prod/favicon.ico core/web/bindata/public
rm -rf core/web/bindata/mail
mkdir -p core/web/bindata/mail
cp core/api/mail/*.html core/web/bindata/mail
cp core/database/templates/*.html core/web/bindata
rm -rf core/web/bindata/scripts
mkdir -p core/web/bindata/scripts
cp -r core/database/scripts/autobuild/*.sql core/web/bindata/scripts

echo "Generating in-memory static assets..."
go get -u github.com/jteeuwen/go-bindata/...
go get -u github.com/elazarl/go-bindata-assetfs/...
cd core/web
go generate

echo "Compiling app..."
cd ../..
for arch in amd64 ; do
    for os in darwin linux windows ; do
        if [ "$os" == "windows" ] ; then
            echo "Compiling documize-community-$os-$arch.exe"
            env GOOS=$os GOARCH=$arch go build -o bin/documize-community-$os-$arch.exe ./cmd/documize-community
        else
            echo "Compiling documize-community-$os-$arch"
            env GOOS=$os GOARCH=$arch go build -o bin/documize-community-$os-$arch ./cmd/documize-community
        fi
    done
done

echo "Finished."

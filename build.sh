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
rm -rf documize/web/bindata/public
mkdir -p documize/web/bindata/public
cp -r app/dist-prod/assets documize/web/bindata/public
cp -r app/dist-prod/codemirror documize/web/bindata/public/codemirror
cp -r app/dist-prod/tinymce documize/web/bindata/public/tinymce
cp -r app/dist-prod/sections documize/web/bindata/public/sections
cp app/dist-prod/*.* documize/web/bindata
cp app/dist-prod/favicon.ico documize/web/bindata/public
rm -rf documize/web/bindata/mail
mkdir -p documize/web/bindata/mail
cp documize/api/mail/*.html documize/web/bindata/mail
cp documize/database/templates/*.html documize/web/bindata
rm -rf documize/web/bindata/scripts
mkdir -p documize/web/bindata/scripts
cp -r documize/database/scripts/autobuild/*.sql documize/web/bindata/scripts

echo "Generating in-memory static assets..."
go get github.com/jteeuwen/go-bindata/...
go get github.com/elazarl/go-bindata-assetfs/...
cd documize/web
go generate

echo "Compiling app..."
cd ../..
for arch in amd64 ; do
    for os in darwin linux windows ; do
        if [ "$os" == "windows" ] ; then
            echo "Compiling documize-$os-$arch.exe"
            env GOOS=$os GOARCH=$arch go build -o bin/documize-$os-$arch.exe ./documize
        else
            echo "Compiling documize-$os-$arch"
            env GOOS=$os GOARCH=$arch go build -o bin/documize-$os-$arch ./documize
        fi
    done
done

echo "Finished."

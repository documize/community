#! /bin/bash

NOW=$(date)
echo "Build process started $NOW"

echo "Building Ember assets..."
cd app
ember b -o dist-prod/ --environment=production

echo "Copying Ember assets..."
cd ..
rm -rf embed/bindata/public
mkdir -p embed/bindata/public
cp -r app/dist-prod/assets embed/bindata/public
cp -r app/dist-prod/codemirror embed/bindata/public/codemirror
cp -r app/dist-prod/tinymce embed/bindata/public/tinymce
cp -r app/dist-prod/sections embed/bindata/public/sections
cp app/dist-prod/*.* embed/bindata
cp app/dist-prod/favicon.ico embed/bindata/public
rm -rf embed/bindata/mail
mkdir -p embed/bindata/mail
cp core/api/mail/*.html embed/bindata/mail
cp core/database/templates/*.html embed/bindata
rm -rf embed/bindata/scripts
mkdir -p embed/bindata/scripts
cp -r core/database/scripts/autobuild/*.sql embed/bindata/scripts

echo "Generating in-memory static assets..."
go get -u github.com/jteeuwen/go-bindata/...
go get -u github.com/elazarl/go-bindata-assetfs/...
cd embed
go generate

echo "Compiling app..."
cd ..
for arch in amd64 ; do
    for os in darwin linux windows ; do
        if [ "$os" == "windows" ] ; then
            echo "Compiling documize-community-$os-$arch.exe"
            env GOOS=$os GOARCH=$arch go build -gcflags=-trimpath=$GOPATH -asmflags=-trimpath=$GOPATH -o bin/documize-community-$os-$arch.exe ./cmd/community
        else
            echo "Compiling documize-community-$os-$arch"
            env GOOS=$os GOARCH=$arch go build -gcflags=-trimpath=$GOPATH -asmflags=-trimpath=$GOPATH -o bin/documize-community-$os-$arch ./cmd/community
        fi
    done
done

echo "Finished."

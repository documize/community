#! /bin/bash

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
            env GOOS=$os GOARCH=$arch go build -gcflags=-trimpath=$GOPATH -asmflags=-trimpath=$GOPATH -o bin/documize-community-$os-$arch.exe ./edition/community.go
        else
            echo "Compiling documize-community-$os-$arch"
            env GOOS=$os GOARCH=$arch go build -gcflags=-trimpath=$GOPATH -asmflags=-trimpath=$GOPATH -o bin/documize-community-$os-$arch ./edition/community.go
        fi
    done
done

echo "Finished."

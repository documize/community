#! /bin/bash

NOW=$(date)
echo "Build process started $NOW"

for arch in amd64 ; do
    for os in darwin linux windows ; do
        if [ "$os" == "windows" ] ; then
            echo "Compiling wordconvert.exe"
            env GOOS=$os GOARCH=$arch go build -o bin/wordconvert.exe ./cmd/wordconvert
        else
            echo "Compiling wordconvert-$os"
            env GOOS=$os GOARCH=$arch go build -o bin/wordconvert-$os ./cmd/wordconvert
        fi
    done
done

echo "Finished."

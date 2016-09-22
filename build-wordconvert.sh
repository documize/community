#! /bin/bash

NOW=$(date)
echo "Build process started $NOW"

cd ..
for arch in amd64 ; do
    for os in darwin linux windows ; do
        if [ "$os" == "windows" ] ; then
            echo "Compiling wordconvert-$os.exe"
            env GOOS=$os GOARCH=$arch go build -o ./bin/wordconvert-$os.exe github.com/documize/community/cmd/wordconvert
        else
            echo "Compiling wordconvert-$os"
            env GOOS=$os GOARCH=$arch go build -o ./bin/wordconvert-$os github.com/documize/community/cmd/wordconvert
        fi
    done
done

echo "Finished."

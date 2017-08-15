@echo off
set verbose off
set NOW=%TIME% %DATE%
echo "Build process started %NOW%"

echo "Building Ember assets..."
cd gui
call ember b -o dist-prod/ --environment=production
::Call allows the rest of the file to run

echo "Copying Ember assets..."
cd ..
rd /s /q embed\bindata\public
mkdir embed\bindata\public
echo "Copying Ember assets folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\assets embed\bindata\public\assets 
echo "Copying Ember codemirror folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\codemirror embed\bindata\public\codemirror
echo "Copying Ember tinymce folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\tinymce embed\bindata\public\tinymce 
echo "Copying Ember sections folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\sections embed\bindata\public\sections

copy gui\dist-prod\*.* embed\bindata
copy gui\dist-prod\favicon.ico embed\bindata\public
copy gui\dist-prod\manifest.json embed\bindata\public

rd /s /q embed\bindata\mail
mkdir embed\bindata\mail
copy domain\mail\*.html embed\bindata\mail
copy core\database\templates\*.html embed\bindata

rd /s /q embed\bindata\scripts
mkdir embed\bindata\scripts

echo "Copying database scripts folder"
robocopy /e /NFL /NDL /NJH core\database\scripts\autobuild embed\bindata\scripts

echo "Generating in-memory static assets..."
go get -u github.com/jteeuwen/go-bindata/...
go get -u github.com/elazarl/go-bindata-assetfs/...
cd embed
go generate 
cd ..

echo "Compiling Windows"
set GOOS=windows
go build -gcflags=-trimpath=%GOPATH% -asmflags=-trimpath=%GOPATH% -o bin/documize-community-windows-amd64.exe edition/community.go

echo "Compiling Linux"
set GOOS=linux
go build -gcflags=-trimpath=%GOPATH% -asmflags=-trimpath=%GOPATH% -o bin/documize-community-linux-amd64 edition/community.go

echo "Compiling Darwin"
set GOOS=darwin
go build -gcflags=-trimpath=%GOPATH% -asmflags=-trimpath=%GOPATH% -o bin/documize-community-darwin-amd64 edition/community.go
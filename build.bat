@echo off
set verbose off
set NOW=%TIME% %DATE%
echo "Build process started %NOW%"

echo "Building Ember assets..."
cd gui
call ember b -o dist-prod/ --environment=production
::Call allows the rest of the file to run
cd ..

rd /s /q edition\static\public
mkdir edition\static\public
echo "Copying Ember assets folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\assets edition\static\public\assets
echo "Copying Ember codemirror folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\codemirror edition\static\public\codemirror
echo "Copying Ember prism folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\prism edition\static\public\prism
echo "Copying Ember tinymce folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\tinymce edition\static\public\tinymce
echo "Copying Ember pdfjs folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\pdfjs edition\static\public\pdfjs
echo "Copying Ember sections folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\sections edition\static\public\sections
echo "Copying i18n folder"
robocopy /e /NFL /NDL /NJH gui\dist-prod\i18n edition\static\public\i18n

echo "Copying static files"
copy gui\dist-prod\*.* edition\static

echo "Copying favicon.ico"
copy gui\dist-prod\favicon.ico edition\static\public

echo "Copying manifest.json"
copy gui\dist-prod\manifest.json edition\static\public

echo "Copying mail templates"
rd /s /q edition\static\mail
mkdir edition\static\mail
copy domain\mail\*.html edition\static\mail

echo "Copying database templates"
copy core\database\templates\*.html edition\static

rd /s /q edition\static\i18n
mkdir edition\static\i18n
robocopy /e /NFL /NDL /NJH gui\dist-prod\i18n edition\static\i18n *.json

rd /s /q edition\static\scripts
mkdir edition\static\scripts
mkdir edition\static\scripts\mysql
mkdir edition\static\scripts\postgresql
mkdir edition\static\scripts\sqlserver

echo "Copying database scripts folder"
robocopy /e /NFL /NDL /NJH core\database\scripts\mysql edition\static\scripts\mysql
robocopy /e /NFL /NDL /NJH core\database\scripts\postgresql edition\static\scripts\postgresql
robocopy /e /NFL /NDL /NJH core\database\scripts\sqlserver edition\static\scripts\sqlserver

rd /s /q edition\static\onboard
mkdir edition\static\onboard
robocopy /e /NFL /NDL /NJH domain\onboard  edition\static\onboard *.json

echo "Compiling Windows"
set GOOS=windows
go build -mod=vendor -trimpath -gcflags="all=-trimpath=$GOPATH" -o bin/documize-community-windows-amd64.exe edition/community.go

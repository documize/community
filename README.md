# To Document / Instructions

The build process around go get github.com/elazarl/go-bindata-assetfs

## GO

gobin / go env

## go-bindata-assetsfs

make sure you do install cmd from inside go-* folder where main.go lives

## SSL

selfcert generation and avoiding red lock

https://www.accuweaver.com/2014/09/19/make-chrome-accept-a-self-signed-certificate-on-osx/

chrome://restart

go run generate_cert.go -host demo1.dev

port number not required
but browser restart is!

## after clone

- cd app
- npm install
- bower install
- cd ..
- ./build.sh

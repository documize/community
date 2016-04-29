# To Document / Instructions

the build process around go get github.com/elazarl/go-bindata-assetfs

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

# XSS
https://www.google.com/about/appsecurity/learning/xss/#HowToTest

https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet_

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/unescape

# Running the Go tests

WARNING: DO NOT RUN THE AUTOMATED TESTS AGAINST A LIVE DATABASE.

Before running the Go tests, please note that they will alter the database that they are run on.
For detailed instructions see the SDK README.md and directory "exttest".

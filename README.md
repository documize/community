# Instructions

Install the prerequisites:
* Go from https://golang.org (be careful to set the $GOPATH environment variable correctly)
* NPM from https://www.npmjs.com
* Ember from http://emberjs.com/
* MySQL (v10.7+) from http://dev.mysql.com/downloads/mysql/ 

Make sure this repository sits at the following position relative to your $GOPATH: ```$GOPATH/src/github.com/documize/community```

After cloning the repository in the above location, go there and run: ```./build.sh```

Your ```./bin``` directory should now contain a set of binaries for a number of target systems.

Now create an empty database in MySql for Documize to use, making sure that the default collation setting is ```utf8_general_ci``` or some other utf8 variant.

Run Documize for the first time to set-up the database and your user information 
(for example on OSX, using port 5001, MySQL user root/password and database 'documize'):
```
./bin/documize-darwin-amd64 -port=5001 -db='root:password@tcp(localhost:3306)/documize'
```
An error message will appear in the log to say your installation is in set-up mode.
Now navigate to http://localhost:5001 and follow the instructions.

Hopefully you will now have a working Documize instance.

# Ember

To run the Ember code using ```ember s``` from the app directory, the Go binary needs to run an SSL server on port 5001. 

If you don't have a valid certification key pair for your machine, you can generate them by doing the following:
```
cd selfcert
go run generate_cert.go -host localhost
cd ..
```
...obviously you should never use a self generated certificate in a live environment.


To run Documize using those certs (using the set-up above):
```
./bin/documize-darwin-amd64 -db='root:password@tcp(localhost:3306)/documize' -port=5001 -cert selfcert/cert.pem -key selfcert/key.pem 
```
With this process running in the background, Ember should work.

If you navigate to https://localhost:5001 and you want to remove the Chrome warning messages about your invalid self-cert 
follow the instructions at: https://www.accuweaver.com/2014/09/19/make-chrome-accept-a-self-signed-certificate-on-osx/

TODO - document SMTP and Token 

# To Document

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


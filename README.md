# Documize Community Edition

To discover Documize please visit https://documize.com

Documize® is a registered trade mark of Documize Inc.

This repository is copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.

This software (Documize Community Edition) is licensed under GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html

You can operate outside the AGPL restrictions by purchasing Documize Enterprise Edition and obtaining a commercial license by contacting <sales@documize.com>. 

## Running Documize for the first time 

Although the Documize binaries run on Linux, Windows and macOS, the build process has only been tested on macOS.

Install the prerequisites:
* Go from https://golang.org (be careful to set the $GOPATH environment variable correctly, you may find https://www.goinggo.net/2016/05/installing-go-and-your-workspace.html helpful)
* NPM from https://www.npmjs.com 
* Ember from http://emberjs.com/ 
* Bower from https://bower.io/
* MySQL (v10.7+) from http://dev.mysql.com/downloads/mysql/ (don't forget to copy the one-time password and your system may require a restart)

Make sure this repository sits at the following position relative to your $GOPATH: $GOPATH/src/github.com/documize/community

After cloning the repository in the above location, go there and run: 
```
cd app
npm install
bower install 
cd ..
./build.sh 
```

The build script packages up the Ember JS/HTML/CSS code for production use, then generates Go code that creates a simple in-memory file system to contain it. That generated Go code is compiled with the rest to produce a single binary for each of the target systems. 

Your ./bin directory should now contain a set of binaries for a number of target systems. This binary can be executed on any system which also has access to a MySQL database with no further dependencies.

Use a MySQL tool to create an empty database for Documize to use, making sure that the default collation setting is utf8_general_ci or some other utf8 variant.

Run Documize for the first time to set-up the database and your user information (for example on OSX, using port 5001, MySQL user root/password and database ‘documize’):
```
./bin/documize-darwin-amd64 -port=5001 -db='root:password@tcp(localhost:3306)/documize'
```
An error message will appear in the log to say your installation is in set-up mode. Now navigate to http://localhost:5001 and follow the instructions.

Hopefully you will now have a working Documize instance.

Once you have set-up the database as described above, you could go to the ./documize directory and use the command "go run documize.go" in place of the binary name.

## Command line flags and environment variables 

The command line flags are defined below:
```
Usage of ./bin/documize-darwin-amd64:
    -cert string
        the cert.pem file used for https
    -db string
        "username:password@protocol(hostname:port)/databasename" for example "fred:bloggs@tcp(localhost:3306)/documize"
    -forcesslport string
        redirect given http port number to TLS
    -insecure string
        if 'true' allow https endpoints with invalid certificates (only for testing)
    -key string
        the key.pem file used for https
    -log string
        system being logged e.g. 'PRODUCTION' (default "Non-production")
    -offline string
        set to '1' for OFFLINE mode
    -plugin string
        the JSON file describing plugins, default 'DB' uses the database config table 'FILEPLUGINS' entry (default "DB")
    -port string
        http/https port number
    -showsettings
        if true, show settings in the log (WARNING: these settings may include passwords)
```
Flags related to SSL/TLS are discussed in detail later. 

For operational convenience, some of these flags can also be set through environment variables: DOCUMIZECERT => -cert ; DOCUMIZEDB => -db ; DOCUMIZEFORCESSLPORT => -forcesslport ; DOCUMIZEKEY => -key ; DOCUMIZEPORT => -port .

## Configuring the server to use HTTPS

To configure SSL you will need valid certificate and key .pem files. 

If you don’t have a valid certification key pair for your development machine, you can generate them by doing the following:
```
cd selfcert
go run generate_cert.go -host localhost
cd ..
```
…obviously you should never use a self-generated certificate in a live environment.

To run Documize using those certs (using the set-up above):
```
./bin/documize-darwin-amd64 -db='root:password@tcp(localhost:3306)/documize' -port=5001 -cert selfcert/cert.pem -key selfcert/key.pem 
```
If you navigate to https://localhost:5001 and you want to remove the Chrome warning messages about your invalid self-cert follow the instructions at: https://www.accuweaver.com/2014/09/19/make-chrome-accept-a-self-signed-certificate-on-osx/

If you do not specify a port, Documize will default to port ```443``` if there are key/cert files, port ```80``` otherwise.

If you want non-SSL http:// traffic to redirect to the SSL port, say from port 9999, use command line flag: ```-forcesslport=9999``` 

## Ember 

This section is only required if you want to develop the Ember code.

These two commands are best run in different terminal windows: 

(1) Run the Go binary needs to run an SSL server on port 5001, as described in the sections above.

(2) Run the Ember code using the command ```ember s``` from the app directory.

Ember should be visible by navigating to: http://localhost:4200
 

## Configuring SMTP 

In order to send e-mail from your Documize instance, you must configure it.

At present this configuration is not available from the web interface, it requires the use of a MySQL tool of your choice.

In your database, the table `config` has two fields `key` holding CHAR(255) and `config` holding JSON.

The SQL to find you current SMTP configuration is: ``` `SELECT `config` FROM `config` WHERE `key` = 'SMTP'; ```

In an empty database the result will be something like:

```{"host": "", "port": "", "sender": "", "userid": "", "password": ""}```

To configure SMTP, you must set these values in the JSON as your systems require, using a MySQL tool. 

The host is the DNS name of your SMTP server; the port defaults to 587; the sender Documize use is "Documize <hello@documize.com>"; userid and password are your SMTP server credentials.

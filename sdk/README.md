# SDK for the Documize system

## documize command

The directory "documize" contains a command line utility to load files onto the Documize server. 
Run the command with "--help" to see the available flags.

## test suite

The directory "exttest" contains a set of tests that are used both to test this package and to test the main documize code.

In order to run these tests two environment variables must be set:
* DOCUMIZEAPI - the url of the endpoint, which must be http://localhost:5002 at present
* DOCUMIZEAUTH - the authorization credentials in the form ```domain:email:password```, 
which must be of the form ```:mick@jagger.com:demo123``` at present,
with the Documize DB organistion record having the default (empty) subdomain.
		
There must also be a single folder named "Test" for code to find and use.

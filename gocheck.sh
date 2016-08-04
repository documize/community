# Copyright 2013-2014 Documize (http://www.documize.com)

# run github.com/alecthomas/gometalinter to check correctness, style and error handling
# also check spelling with github.com/client9/misspell
# Only set up to look at non-vendored code, should be run from top level
for dir in $(find core sdk plugin-* -type d -print | grep -v -e "web" | grep -v -e "templates" | sort | tr '\n' ' ') 
do
	echo "*** " $dir
    gometalinter --vendor --disable='gotype' --deadline=30s $dir | sort 
    misspell $dir/*.go
done

# run github.com/FiloSottile/vendorcheck (including tests)
echo "*** vendorcheck"
for dir in core sdk 
do 
    cd $dir
    vendorcheck -t . | grep -v 'github.com/documize/community'
    cd ..
done


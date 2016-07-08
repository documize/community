# mime-ext

This is a library that adds a huge number of mime types for using with [mime.TypeByExtension()](http://golang.org/pkg/mime/#TypeByExtension)

## Usage

``` go

package main

import (
	"mime"
	_ "github.com/mytrile/mime-ex"
)

func main() {
	gz_type := mime.TypeByExtension(".gz") //=> "application/gzip"
}
```

## Meta

* Author  : Dimitar Kostov
* Email   : mitko.kostov@gmail.com
* Website : [http://mytrile.github.com](http://mytrile.github.com)
* Twitter : [http://twitter.com/mytrile](http://twitter.com/mytrile)

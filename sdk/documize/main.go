package main

import (
	"flag"
	"fmt"
	"os"

	sdk "github.com/documize/community/sdk"
)

func main() {

	flagSet := flag.NewFlagSet("documize client flags", flag.ExitOnError)

	url, auth, folder, action := flagSet.String("api", os.Getenv("DOCUMIZEAPI"),
		"the url of the endpoint (defaults to environment variable DOCUMIZEAPI)"), //e.g. http://localhost:5002
		flagSet.String("auth", os.Getenv("DOCUMIZEAUTH"), //e.g. demo1:mick@jagger.com:demo123
			"the authorization credentials in the form domain:email:password (defaults to the environment variable DOCUMIZEAUTH)"),
		flagSet.String("folder", "", "the Documize folder to use"),
		flagSet.String("action", "load", "the Documize action to take")

	flagSet.Parse(os.Args[1:])

	if *url == "" {
		fmt.Println("Please set the environment variable DOCUMIZEAPI or use the -api flag")
		os.Exit(1)
	}

	if *auth == "" {
		fmt.Println("Please set the environment variable DOCUMIZEAUTH or use the -auth flag")
		os.Exit(1)
	}

	c, e := sdk.NewClient(*url, *auth)
	if e != nil {
		fmt.Println("unable to create Documize SDK client for", *auth, "Error:", e)
		os.Exit(1)
	}

	switch *action {
	case "load":
		folderID := checkFolder(c, folder)
		for _, arg := range flagSet.Args() {
			_, ce := c.LoadFile(folderID, arg)
			if ce == nil {
				fmt.Println("Loaded file " + arg + " into Documize folder " + *folder)
			} else {
				fmt.Println("Failed to load file " + arg + " into Documize folder " + *folder + " Error: " + ce.Error())
			}
		}
	}
}

func checkFolder(c *sdk.Client, folder *string) string {
	if *folder == "" {
		*folder = os.Getenv("DOCUMIZEFOLDER")
		if *folder == "" {
			fmt.Println("Please set the environment variable DOCUMIZEFOLDER or use the -folder flag")
			os.Exit(1)
		}
	}
	fids, err := c.GetNamedFolderIDs(*folder)
	if err != nil {
		fmt.Println("Error reading folder IDs: " + err.Error())
		os.Exit(1)
	}
	if len(fids) != 1 {
		fmt.Println("There is no single folder called: " + *folder)
		os.Exit(1)
	}
	return fids[0]
}

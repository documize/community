// Package glick provides a simple plug-in environment.
//
// The central feature of glick is the Library which contains
// example types for the input and output of each API on the system.
// Each of these APIs can have a number of "actions" upon them,
// for example a file conversion API may have one action for each of
// the file formats to be convereted.
// Using the Run() method of glick.Library, a given API/Action combination
// runs the code in a function of Go type Plugin.
//
// Although it is easy to create your own plugins,
// there are three types built-in: Remote Procedure Calls (RPC),
// simple URL fetch (URL) and OS commands (CMD).
// A number of sub-packages simplify the use of third-party libraries
// when providing further types of plugin.
//
// The mapping of which plugin code to run occurs at three levels:
//
// 1) Intialisation and set-up code for the application will establish
// the glick.Library using glick.New(), then add API specifications using
// RegAPI(), it may also add the application's base plugins using RegPlugin().
//
// 2) The base set-up can be extended and overloaded using a JSON format configuration
// description (probaly held in a file) by calling the Config() method of
// glick.Library. This configuration process is extensible,
// using the AddConfigurator() method - see the glick/glpie or glick/glkit
// sub-pakages for examples.
//
// 3) Which plugin to use can also be set-up or overloaded at runtime within Run(). Each call to
// a plugin includes a Context (as described in https://blog.golang.org/context).
// This context can contain for example user details, which could be matched
// against a database to see if that user should be directed to one plugin
// for a given action, rather than another. It could also be used to wrap every
// plugin call by a particular user with some other code,
// for example to log or meter activity.
//
package glick

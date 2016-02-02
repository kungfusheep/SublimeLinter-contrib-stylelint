var fs = require("fs");

/// we're keeping this project-specific. 
var CLI_JS_LOCATION = "/node_modules/stylelint/dist/cli.js";
var PACKAGE_JSON = "/node_modules/stylelint/package.json";

/// get the config location, if it's been provided.
var configPath, prjPath, cliLocation, useOld = false;
var index = process.argv.indexOf("--config");
if (index > -1) {

    configPath = prjPath = process.argv[index + 1];

    /// choose a platform specific separator
    var sep = prjPath.indexOf("/") > -1 ? "/" : "\\";

    /// set the working directory to the config location - this is necessary because 'plugins' and 'extends' are relative.
    process.chdir(prjPath.slice(0, prjPath.lastIndexOf(sep)));

    /// now try to use the node_modules folder from the project folder (we're saying the project folder is where the config is...)
    /// we'll add a bunch of paths for require to check. 
    while (prjPath.indexOf(sep) > -1) {
        prjPath = prjPath.slice(0, prjPath.lastIndexOf(sep));

        /// look for the stylelint CLI on the way whilst we're here. we'll either need this or the require paths
        if(!cliLocation && fs.existsSync(prjPath + CLI_JS_LOCATION)){
            
            /// check the version number. old versions of stylelint had the cli.js file but it didn't work. 
            var json = JSON.parse(fs.readFileSync(prjPath + PACKAGE_JSON));
            var ver = Number(json.version.split(".")[0]);
            if(ver >= 2){

                cliLocation = prjPath + CLI_JS_LOCATION;
                break;
            }
            else {
                /// we've found a stylelint instance but it's an older version, 
                ///  so make sure this is the one that is used and not the global instance. 
                useOld = true;
            }
        }

        require.main.paths.splice(0, 0, prjPath + "/node_modules"); 
    }

    /// if we cannot locate a local stylelint CLI, try to look for it on npm global
    if(!cliLocation && !useOld) {
        var npmPath = require("child_process").execSync("npm root -g").toString()
            .trim().replace("/node_modules", "");

        if(fs.existsSync(npmPath + CLI_JS_LOCATION)) {
            cliLocation = npmPath + CLI_JS_LOCATION;    
        }
    }
}

/// we want to support the latest stylelint and use the CLI, but also want to support the pre-CLI version. 
/// using the CLI gets around a bunch of things, like needing the "postcss-scss" module. plus a lot of work went into it!
if(cliLocation){
    /// use the CLI, we found it earlier on.

    var child_process = require("child_process");
    var lint = child_process.spawnSync("node", [cliLocation, process.argv[2] ]);
    /// re-route the stdout to ours
    console.log(String(lint.stdout) + String(lint.stderr));
}
else {
    /// old stylelint versions.

    var postcss = require("postcss");
    var stylelint = require("stylelint");
    var reporter = postcss.plugin("reporter", require("./reporter/lib/reporter"));

    /// css to be processed
    var fileName = process.argv[2];
    var css = fs.readFileSync(fileName, "utf8");

    /// load the config json
    var config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};

    /// start the linting process.
    postcss([
            stylelint(config), reporter()
        ])
        .process(css, {
            from: fileName
        })
        .then()
        .catch(function(err) {
            console.error(err.stack)
        })
}

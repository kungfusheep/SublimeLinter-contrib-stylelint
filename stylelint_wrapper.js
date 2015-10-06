var fs = require("fs");

/// load the .stylelintrc config, if --config has been provided.
var config;
var index = process.argv.indexOf("--config");
if(index > -1){

    var prjPath = process.argv[index+1];

    /// load the config json
    config = JSON.parse( fs.readFileSync(prjPath) );

    /// now try to use the node_modules folder from the project folder (we're saying the project folder is where the config is...)
    var sep = prjPath.indexOf("/") > -1 ? "/" : "\\";

    /// set the working directory to the config location - this is necessary because 'plugins' and 'extends' are relative.
    process.chdir(prjPath.slice(0, prjPath.lastIndexOf(sep)));

    while(prjPath.indexOf(sep) > -1){
        prjPath = prjPath.slice(0, prjPath.lastIndexOf(sep));
        require.main.paths.splice(0, 0, prjPath + "/node_modules");
    }
}

var postcss = require("postcss");
var stylelint = require("stylelint");
var reporter = postcss.plugin("reporter", require("./reporter/lib/reporter"));

/// css to be processed
var fileName = process.argv[2];
var css = fs.readFileSync(fileName, "utf8");

/// start the linting process.
postcss([
        stylelint( config )
    	,reporter()
    ])
    .process(css, {
        from: fileName
    })
    .then()
    .catch(function(err) {
        console.error(err.stack)
    })

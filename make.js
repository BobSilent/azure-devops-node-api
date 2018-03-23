require('shelljs/make');
var path = require('path');
var fs = require('fs');

var rp = function(relPath) {
    return path.join(__dirname, relPath);
}

var buildPath = path.join(__dirname, '_build');
var testPath = path.join(__dirname, '_test');

var run = function(cl) {
    console.log('> ' + cl);
    var rc = exec(cl).code;
    if (rc !== 0) {
        echo('Exec failed with rc ' + rc);
        exit(rc);
    }
}

target.clean = function() {
    rm('-Rf', buildPath);
    rm('-Rf', testPath);
};

target.build = function() {
    target.clean();

    run('tsc --outDir ' + buildPath);

    cp('-Rf', rp('api/opensource'), buildPath);
    
    cp(rp('dependencies/typings.json'), buildPath);
    cp(rp('LICENSE'), buildPath);
    cp(rp('package.json'), buildPath);
    cp(rp('package-lock.json'), buildPath);
    cp(rp('ThirdPartyNotice.txt'), buildPath);
    cp(rp('README.md'), buildPath);
    
    // just a bootstrap file to avoid /// in final js and .d.ts file
    rm(path.join(buildPath, 'index.*'));
}

// test is just building samples
target.test = function() {
    target.build();

    var modPath = path.join(__dirname, 'samples', 'node_modules');
    rm('-Rf', modPath);
    mkdir('-p', modPath);
    pushd('samples');
    run('npm install ../_build');
    popd();
    run('tsc -p samples');
}

target.samples = function() {
    target.test();

    pushd('samples');
    run('node run.js');
    popd();
    console.log('done');
}
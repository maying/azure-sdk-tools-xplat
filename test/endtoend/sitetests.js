/**
* Copyright 2012 Microsoft Corporation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var exec = require('child_process').exec;
var should = require('should');

var publishsettingFilePath = process.env.PUBLISHSETTINGS_FILE_PATH;

suite('cli', function () {
    suite('account import', function () {
        setup(function (done) {
            AccountClear(done);
        });

        teardown(function (done) {
            AccountClear(done);
        });

        test('Credential Import - Basic', function (done) {
            AccountImport(done);
        });
    });
    suite('site list', function () {
        setup(function (done) {
            // Make sure there is one (and only one) account imported
            exec("azure account list --json", function (err, result) {
                if (err) {
                    AccountImport(done);
                } else {
                    var accountList = JSON.parse(result);
                    if (accountList.length !== 1) {
                        AccountClear(done);
                        AccountImport(done);
                    } else {
                        done();
                    }
                }
            });
        });

        teardown(function (done) {
            AccountClear(done);
        });

        // Precondition:  There is already one website running in the imported account
        test('Basic', function (done) {
            exec("azure site list --json", function (err, result) {
                if (err) {
                    throw err;
                }
                var siteList = JSON.parse(result);

                siteList.length.should.equal(1);
                console.log(siteList[0].HostNames);

                done();
            });

        });
    });
});

var AccountImport = function (callback) {

    if (!publishsettingFilePath) {
        throw new Error('The environement variable PUBLISHSETTINGS_FILE_PATH is not set!');
    }

    console.log('Importing this publishsettings file: ' + publishsettingFilePath);
    var accountImportCmd = 'azure account import ' + publishsettingFilePath;
    exec(accountImportCmd, function (err, result) {
        if (err) {
            throw err;
        }
        callback();
    });
}

var AccountClear = function(callback) {
    var accountClearCmd = 'azure account clear --json';
    exec(accountClearCmd, function (err, result) {
        if (err) {
            throw err;
        }
        console.log(result);
        callback();
    });
}
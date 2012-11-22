/*
* Copyright 2011-2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var utils = require("./utils"),
    fs = require("fs"),
    path = require("path"),
    jWorkflow = require("jWorkflow"),
    _c = require("./conf");

module.exports = function (isForUnitTest) {
    var MAKE_CMD = "make " + "JLEVEL=" + _c.COMPILER_THREADS,
        buildEnv = process.env;

    return function (prev, baton) {
        var build = jWorkflow.order(),
            thisBaton = baton;

        thisBaton.take();

        if (isForUnitTest) {
            buildEnv.UNIT_TESTS = "1";
        }

        build = build.andThen(utils.execCommandWithJWorkflow(MAKE_CMD))
        .andThen(function () {
            //catch the success case
            thisBaton.pass(prev);
        });

        //catch the error case
        build.start(function (error) {
            if (error) {
                thisBaton.drop(error);
            }
        });
    };
};

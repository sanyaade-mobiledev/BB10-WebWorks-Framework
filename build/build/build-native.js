/*
* Copyright 2011 Research In Motion Limited.
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
var childProcess = require("child_process"),
    utils = require("./utils"),
    fs = require("fs"),
    path = require("path"),
    _c = require("./conf");

function _getCmd() {
    var exts = fs.readdirSync(_c.EXT), ext,
        cmd = "",
        nativeDir, simDir, deviceDir,
        configureX86, configureARM,
        stripX86, stripARM,
        
        //Command constants
        AND_CMD = " && ",
        CD_CMD = "cd ",
        MAKE_CMD = "make",
        CP_CMD = "cp ",
        SH_CMD = "sh ";
        
    for (ext in exts) {
        //Native build directories
        nativeDir = path.join(_c.EXT, exts[ext], "native");
        simDir = path.join(_c.EXT, exts[ext], "simulator");
        deviceDir = path.join(_c.EXT, exts[ext], "device");
        
        //configure-qsk commands
        configureX86 = path.join(simDir, "configure-qsk x86");
        configureARM = path.join(deviceDir, "configure-qsk arm a9");
    
        //strip binary commands
        stripX86 = "ntox86-strip *.so";
        stripARM = "ntoarmv7-strip *.so";
          
        //If native folder exists, Build
        if (path.existsSync(nativeDir)) {
            if (!path.existsSync(simDir)) {
                fs.mkdirSync(simDir);
            }

            if (!path.existsSync(deviceDir)) {
                fs.mkdirSync(deviceDir);
            }
            
            if (cmd) {
                cmd += AND_CMD;
            }
            
            if (utils.isWindows()) {
                cmd += CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK + " " +
                simDir + AND_CMD + CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK +
                " " + deviceDir + AND_CMD +
                CD_CMD + simDir + AND_CMD + 
                SH_CMD + configureX86 + AND_CMD +
                MAKE_CMD + AND_CMD + stripX86 + AND_CMD + 
                CD_CMD + deviceDir + AND_CMD + 
                SH_CMD + configureARM + AND_CMD +
                MAKE_CMD + AND_CMD + stripARM;
            } else {
                cmd += CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK + " " +
                simDir + AND_CMD + CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK +
                " " + deviceDir + AND_CMD +
                CD_CMD + simDir + AND_CMD + 
                configureX86 + AND_CMD +
                MAKE_CMD + AND_CMD + stripX86 + AND_CMD +
                CD_CMD + deviceDir + AND_CMD + 
                configureARM + AND_CMD +
                MAKE_CMD + AND_CMD + stripARM;
            }
            
        }
    }
    return cmd;
}

module.exports = function (prev, baton) {
    baton.take();

    childProcess.exec(_getCmd(), function (error, stdout, stderr) {
        if (error) {
            console.log(stdout);
            console.log(stderr);
            baton.pass(error.code);
        } else {
            baton.pass(prev);
        }
    });
};
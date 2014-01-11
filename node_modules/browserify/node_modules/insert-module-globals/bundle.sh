#!/bin/bash

browserify --no-detect-globals -r native-buffer-browserify > buffer.js
echo ';module.exports=require("native-buffer-browserify").Buffer' >> buffer.js

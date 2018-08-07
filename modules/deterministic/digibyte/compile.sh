#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../../../node/bin:"$PATH"
NODEINST=`which node`


../../../node_modules/webpack/bin/webpack.js --config webpack.config.js
../../../tools/lzmapack.js bundle.js
mv bundle.js.lzma deterministic.js.lzma

# clean up
rm bundle.js

PATH=$OLDPATH
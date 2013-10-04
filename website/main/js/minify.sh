#!/bin/bash

type='js'
compressor="java -jar $HOME/dev/extern/yuicompressor-2.4.8.jar --type $type"
target="min.$type"
rm -f $target
for i in $(find -type f -regex .*$type | grep -v extern)
do
echo "Compressing $i…"
$compressor $i >> $target
done

#!/bin/bash


rm -f $PWD/hidetoolbarsforapptabs.xpi


echo source directory: $PWD/src

echo creating xpi
7z a $PWD/hidetoolbarsforapptabs.xpi -tzip $PWD/src/*
#!/bin/bash


rm -f $PWD/hideToolbarsByURL.xpi


echo source directory: $PWD/src

echo creating xpi
7z a $PWD/hideToolbarsByURL.xpi -tzip $PWD/src/*
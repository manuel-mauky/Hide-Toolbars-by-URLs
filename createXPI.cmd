@echo off


set zip=c:\programme\7-zip\7z.exe

set srcdir=%cd%\src\*

set xpi=%cd%\hideToolbarsByURL.xpi



del %xpi%



echo source directory: %srcdir%
echo xpi : %xpi%

echo creating xpi
%zip% a %xpi% -tzip %srcdir%

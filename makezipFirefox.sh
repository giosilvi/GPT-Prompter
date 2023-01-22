# make a zip file from the files: popup.js and popup.html
# using a bash shell command on windows:
# save list of files in env variable called files

files=" icons/ node_modules/ background.js content.js history.html history.js manifest.json popup_world.js popup.html popup.js style.css"
# get the input number of the version
echo "Enter the version number: "
read version
# make the zip file
zip -r  $files
zip "Firefox_GPTPrompter-v0$version.zip" -r $files

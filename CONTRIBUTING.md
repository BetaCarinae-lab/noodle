### Contribution
Ok, To be honest here, I have no idea how to contribute to anything.  
your best bet is to look online for some general public contribution tutorials, but!
  
#### Here is what you need to know:  
When you fork the repo use
`npm install` to install the dependencies
and create 2 folders, `js` and `zipped`

Since I had a bad experience with `npm run` once, We, er I use  
manual `.sh` files for all my tasks,  
`sudo ./build.sh` -> Builds noodle, uninstalls the current one, and installs the newly built one  
`./install/./uninstall .sh` -> Pretty self explanatory  
`./package.sh` -> Packages noodle into zip files, ready for distribution  
(note: i have been told that making custom .sh files is not a *me* thing)

Once done, submit your PR and i'll review soon as I can :)

### File Guide
`etc.ts` contains stuff like the Enviroment and Variable classes
`exec.ts` is where `runBowl` and `runND` is
`graphics.ts` is the library for the graphics engine
`info.ts` is most likely going to get dissolved into another file, but it contains the version and `isPkg`
`projectSetup` is for setting up projects, but will be dissolved into another file later
`semantics.ts` contains the semantics for ohmjs

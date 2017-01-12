/*
 Update command for REST API
 It will create a new deployment and place it on latest version.
*/

//CREATE
parseArgs(process.args)
  .then( askMissingParams )
  .then( configure )
  .then( saveConfiguration )
  .then( buildPackage )
  .then( getAPIDescription )
  .then( createLambda )
  .then( createApi )
  .then( createPermissions )

//UPDATE
parseArgs(process.args)
  .then( configure )
  .then( askMissingParams )
  .then( buildPackage )
  .then( getAPIDescription )
  .then( updateLambda )
  .then( updateApi )
  .then( updatePermissions )

//DESTROY
parseArgs(process.args)
  .then( configure )
  .then( removePermissions )
  .then( removeApi )
  .then( removeLambda )

//DEPLOY
parseArgs(process.args)
  .then( configure )
  .then( askMissingParams )
  .then( updatePermissions )
  .then( updateDeployment )

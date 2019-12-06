const fs = require('fs');
const path = require('path');

/**
 * This module is used to create a directory recursively
 */

module.exports = {
    createDir:createDir
}

/**
 * get the path information
 * @param {string} path 
 */
function getStat(path){
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if(err){
                resolve(false);
            }else{
                resolve(stats);
            }
        })
    })
  }
  
  /**
  * create the directory of path #dir#
  * @param {string} dir path
  */
  function mkdir(dir){
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, err => {
            if(err){
                resolve(false);
            }else{
                resolve(true);
            }
        })
    })
  }
  
  /**
  * create the dir if it doesn't exsite
  * @param {string} dir path
  */
  async function createDir(dir){
    let isExists = await getStat(dir);
    if(isExists && isExists.isDirectory()){
        return true;
    }else if(isExists){     //if this path points to a file，return false
        return false;
    }
    //if the dir doesn't exist
    let parentDir = path.parse(dir).dir;      //get the parent dir
    //check in recursive untill the parent dir exists
    let status = await createDir(parentDir);
    let mkdirStatus;
    if(status){
        mkdirStatus = await mkdir(dir);
    }
    return mkdirStatus;
  }

  
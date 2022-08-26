// Author: Seif-eddine BENOMAR

const fs = require('fs')
const _ = require("lodash")
const argv = require('yargs').argv
require('dotenv').config();

if (!argv.src) console.log('Error, must give src langs')

let src, totalCharacters
const srcPath = __dirname + `/lang/${argv.src}/ns.json`

fs.readFile(srcPath, (err, src1) => {
  src = JSON.parse(src1)
  console.log(src);

  // iterate recursively though all entries in the src JSON and count the number of characters in each entry
  totalCharacters = 0;

  const traverse = function (o) {
    for (var i in o) {

      if (o[i] !== null && typeof (o[i]) == "object") {
        console.log("[↳] Going deeper into: " + i);
        traverse(o[i]);
      } else {
        totalCharacters += o[i].length;
        console.log("[➞] " + o[i] + " -> " + o[i].length + " characters");
      }
    }
  }

  traverse(src , traverse);
  console.log(`\x1b[4mTotal characters: ${totalCharacters}\x1b[0m`);
});
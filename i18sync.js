const fs = require('fs')
const {
  TranslationServiceClient
} = require('@google-cloud/translate');
const _ = require("lodash")
const argv = require('yargs').argv
const axios = require('axios');
require('dotenv').config();

if (!argv.src || !argv.target) console.log('Error, must give src & target langs')

let src, target
let path = []

// const srcPath = __dirname+`/../../opensteam/classroom/assets/lang/${argv.src}/ns.json`
// const targetPath = __dirname+`/../../opensteam/classroom/assets/lang/${argv.target}/ns.json`
const srcPath = __dirname + `/lang/${argv.src}/ns.json`
const targetPath = __dirname + `/lang/${argv.target}/ns.json`

const doTranslation = argv.translate;
const doTranslationGoogle = argv.google;
let APIcounter = 0;

fs.readFile(srcPath, (err, src1) => {
  src = JSON.parse(src1)
  fs.readFile(targetPath, async (err, target1) => {

    try {
      target = JSON.parse(target1)
      const srcCopy = Object.assign({}, src)

      await traversePromise(srcCopy, function (k, v) {
        //console.log(k + " : " + v);
      });

      await applyTranslations(srcCopy);
      fs.writeFileSync(targetPath, JSON.stringify(srcCopy), {})
    } catch (e) {
      console.log(e);
    }
  });
});

const translations = {};
const toTranslate = [];

// loop recursively through lang file
// for each entry check if it exists in the dist lang file, if yes copy it else mark it to be translated in applyTranslations()
var traverse = function (o, fn) {
  for (var i in o) {
    path.push(i);
    fn.apply(this, [i, o[i]]);
    if (o[i] !== null && typeof (o[i]) == "object") {
      traverse(o[i], fn);
    } else {
      const value = _.get(target, path)
      // console.log(value);
      if (value) {
        o[i] = value;
      } else {
        o[i] = ' ' + o[i]
        if (doTranslation) {
          toTranslate.push(path.toString().replace(/,/g, '.'));
          APIcounter++;
        }
      }
    }
    path.pop()
  }
}

// promise wrapper for traverse function
function traversePromise(o, fn) {
  return new Promise((resolve, reject) => {
    traverse(o, fn);
    resolve();
  })
}

// loop through entries that need to be translated and translate them using deepl
function applyTranslations(object) {
  return new Promise((resolve, reject) => {
    const promises = [];
    toTranslate.forEach(path => {
      const promise = translate(argv.src.toUpperCase(), argv.target.toUpperCase(), _.get(object, path))
      promises.push(promise);

      if (translateGoogle) {
        promise.then(res => {          
          _.set(object, path, res)
        }).catch(err => {
          console.log(err);
        })
      } else {
        promise
          .then(res => {
            _.set(object, path, res.data.translations[0].text);
          })
          .catch(err => {
            console.log(err);
          })
      }


    });

    Promise.all(promises)
      .then(() => resolve())
      .catch(() => reject());
  });

}

const querystring = require("querystring");

const deeplUrl = 'https://api-free.deepl.com/v2/translate';
// translate a text using deepl API 
function translate(src, target, text) {

  if (doTranslationGoogle) {
    return translateGoogle(src, target, text);
  }

  const params = {
    auth_key: process.env.DEEPL_APIKEY,
    text,
    source_lang: src,
    target_lang: target
  };

  return axios.post(
    deeplUrl,
    querystring.stringify(params)
  )
}


async function translateGoogle(src, target, text) {
  // Instantiates a client
  const translationClient = new TranslationServiceClient();

  // read project ID from .env
  const projectId = process.env.GOOGLE_APPLICATION_PROJECT_ID;
  const location = 'global';

  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: src,
    targetLanguageCode: target,
  };

  // Run request
  const [response] = await translationClient.translateText(request);

  return response.translations[0].translatedText;
}
# i18n-auto-translator
Originally made by **Seif-Eddine BENOMAR** and built on by the Vittascience team.
Quick tool to translate entries of a JSON file for easy use with i18n.
## How to use? 

1. Run `npm install`
2. Add .env file containing `DEEPL_APIKEY` key
3. (Optional) Add Google Translation API Key file in the `keys/` folder and add the resulting path as a `GOOGLE_APPLICATION_CREDENTIALS` key in the .env file, as well as your Google Cloud Project ID in the `GOOGLE_APPLICATION_PROJECT_ID` key. 
You'll end up with something like this:
```
DEEPL_APIKEY=<your_deep_api_key>
GOOGLE_APPLICATION_CREDENTIALS=keys/<your_google_api_key_file>
GOOGLE_APPLICATION_PROJECT_ID=<your_google_cloud_project_id>
```

### Commands

- `node l18sync.js --src fr --target es`: Copy all missing entries from 'src' (fr) to 'target' (es) ns.json translation file.
- `node l18sync.js --src fr --target es --translate`: Copy and translate (using deepL API) all missing entries from 'src' to 'target' translation file.
- `node l18sync.js --src fr --target es --translate --google`: Copy and translate (using Google Translation API) all missing entries from 'src' to 'target' translation file.
# node-nlp-test1
A test of the NaturalNode package in javascript. This package seems to be more promising than the others for JS.

To test, first cd into the directory and install dependencies with:
```
npm install should
npm install csv-parse
npm install natural
npm install formidable
npm install snoowrap
npm install http
npm install fs
npm install util
```
For adding your own Reddit API information, create a file called index.js in a folder called DEV-API-CRED in your node_modules folder. Then just paste the following code and insert relevant information in the quotations. Because the node_modules folder is ignored by git, these credentials stay local, saving the hassle of adding and removing credentials every commit.
```
exports.userAgent = ""
exports.clientId = ""
exports.clientSecret = ""
exports.username = ""
exports.password = ""

```

Then run:
```
node index.js
```

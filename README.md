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
On lines 99-105 in index.js, you will have to fill it out with your own Reddit API information.
```
const r = new snoowrap({
  userAgent: 'bitch 1.0 by /u/username',
  clientId: 'id',
  clientSecret: 'psswd',
  username: 'reddit username',
  password: 'reddit passwd'
});
```

Then run:
```
node index.js
```

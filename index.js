var natural = require('natural');
var parse = require('csv-parse');
var fs = require('fs');
require('should');

var classifier = new natural.BayesClassifier();
var input = fs.readFileSync('twitter-hate.csv', 'utf8');


//Loads a classifier as saved.
natural.BayesClassifier.load('classifier.json', null, function(err, classifierLoad) {
    if (classifierLoad != undefined) {
        classifier = classifierLoad;
        onTrained();
    }
    else { trainData(); }
});

function trainData() {
    parse(input, {comment: '#'}, function(err, output){
        console.log("Loading files");
        for (i = 1; i < 14500; i++) {
            if (i % 1000 == 0) { console.log(i); }

            classifier.addDocument(String(output[i][19]), String(output[i][5]));
        }

        console.log("Training files");
        classifier.train();

        onTrained();
    });
}

function onTrained() {
     //Outputs "not hate"
     var testPhrase1 = "The world is a beautiful place."
     console.log(classifier.classify(testPhrase1));
     console.log(classifier.getClassifications(testPhrase1));

     //Outputs "hate"
     var testPhrase2 = "Suck my cock, you Nazi."
     console.log(classifier.classify(testPhrase2));
     console.log(classifier.getClassifications(testPhrase2));

     //Use this to save the classifier for later use
     classifier.save('classifier.json', function(err, classifier) {
         // the classifier is saved to the classifier.json file!
         console.log("Classifier saved!");
     });
}


//Use this to have it report each time a document is trained
classifier.events.on('trainedWithDocument', function (obj) {
    if (obj["index"] % 1000 == 0) {
        console.log(obj["index"]);
    }

    //Data format
    /* {
    *   total: 23 // There are 23 total documents being trained against
    *   index: 12 // The index/number of the document that's just been trained against
    *   doc: {...} // The document that has just been indexed
    *  }
    */
});

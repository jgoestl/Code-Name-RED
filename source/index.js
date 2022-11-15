'use strict';
const crypt = require('crypto');
const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');
const { Readable } = require('stream');
const https = require('https');
// Aufgabe 1
const algorithm = 'aes-256-gcm';
const secretKey = fs.readFileSync('./secret.key', { encoding: 'utf8' });
const iv = fs.readFileSync('./iv.txt');
const auth = fs.readFileSync('./auth.txt');
const secretMessage = fs.readFileSync('./secret.enc', { encoding: 'binary' });
console.log(secretMessage.length);
const key = Buffer.from(secretKey, "utf8").slice(0, 32);
const decipher = crypt.createDecipheriv(algorithm, key, iv);
decipher.setAuthTag(auth);
const message = decipher.update(secretMessage, 'binary');
console.log(message.length);
//fs.writeFileSync('./test.zip', message);
const stream = Readable.from(message);
let lineReader = readline.createInterface({
    input: stream.pipe(zlib.createGunzip())
});
// Testing
/*const message2 = fs.readFileSync('./clear_smaller.txt', {encoding: 'utf8'});
const stream2 = Readable.from(message2);
lineReader = readline.createInterface({
    input: stream2
});*/
let n = 0;
let sumDigits = 0;
let sumVowel = 0;
let sumInSentences = [];
lineReader.on('line', (line) => {
    n += 1;
    console.log("line: " + n);
    // Aufgabe 2
    const matchesDigits = line.match(/\d/g);
    if (matchesDigits != null) {
        matchesDigits.forEach(match => {
            sumDigits = sumDigits + parseInt(match);
        });
    }
    console.log("sumDigits = " + sumDigits);
    // Aufgabe 3
    const matchesVowels = line.match(/[aeiou]/g);
    if (matchesVowels != null) {
        matchesVowels.forEach(match => {
            let addend = 0;
            switch (match) {
                case 'a':
                    addend = 2;
                    break;
                case 'e':
                    addend = 4;
                    break;
                case 'i':
                    addend = 8;
                    break;
                case 'o':
                    addend = 16;
                    break;
                case 'u':
                    addend = 32;
                    break;
            }
            sumVowel = sumVowel + addend;
        });
    }
    console.log("sumVowel = " + sumVowel);
    // Aufgabe 4
    const matchesSentences = line.match(/\b[^.!?]+[.!?]+/g);
    if (matchesSentences != null) {
        matchesSentences.forEach(matchSentence => {
            let sumDigitsInSentence = 0;
            const matchesDigitsInSentence = matchSentence.match(/\d/g);
            if (matchesDigitsInSentence != null) {
                matchesDigitsInSentence.forEach(matchDigitsInSentence => {
                    sumDigitsInSentence = sumDigitsInSentence + parseInt(matchDigitsInSentence);
                });
            }
            if (sumDigitsInSentence > 0) {
                console.log("sumDigitsInSentence = " + sumDigitsInSentence);
                sumInSentences.push(sumDigitsInSentence);
            }
        });
    }
})
    .on('pause', function () {
    /* resume after read lines is finished to close file */
    lineReader.resume();
})
    .on('close', function () {
    /*action after file read is close*/
    console.log('Close ok');
    // Aufgabe 4a
    sumInSentences = sumInSentences.sort(function (a, b) {
        return b - a;
    });
    sumInSentences = sumInSentences.slice(0, 10);
    for (let i = 0; i < sumInSentences.length; i++) {
        sumInSentences[i] = sumInSentences[i] - i;
    }
    console.log("Final sumDigits = " + sumDigits);
    console.log("Final sumVowel = " + sumVowel);
    const sum = sumDigits + sumVowel;
    console.log("Final sum = " + sum);
    console.log("Final sumInSentences = " + sumInSentences);
    // Aufgabe 4b
    const answer = String.fromCharCode.apply(null, sumInSentences);
    console.log("Final answer = " + answer);
    // Aufgabe 4c
    const options = {
        key: fs.readFileSync('./localhost.key'),
        cert: fs.readFileSync('./localhost.crt')
    };
    https.createServer(options, function (req, res) {
        res.writeHead(200);
        res.end(answer + "\n");
    }).listen(8000);
});

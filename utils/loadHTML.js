const fs = require('fs');
const path = require('path');

function loadHTML(fileName) {
  return fs.readFileSync(
    path.join(__dirname, '..', 'masterframe', fileName),
    'utf8'
  );
}

module.exports = loadHTML;
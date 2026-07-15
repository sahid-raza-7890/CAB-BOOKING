const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;
walkDir('server/src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace $${...} with ₹${...}
    content = content.replace(/\$\$\{/g, '₹${');
    
    // Replace $ followed by numbers with ₹
    content = content.replace(/\$([0-9])/g, '₹$1');
    content = content.replace(/\$ ([0-9])/g, '₹ $1');
    
    // Replace specific strings
    content = content.replace(/USD/g, 'INR');
    content = content.replace(/911/g, '112');
    content = content.replace(/San Francisco/gi, 'Bengaluru');
    content = content.replace(/New York/gi, 'Mumbai');
    content = content.replace(/America\/New_York/gi, 'Asia/Kolkata');
    content = content.replace(/EST \(New York\)/gi, 'IST (Kolkata)');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Updated: ' + filePath);
    }
  }
});
console.log('Modified files count: ' + modifiedCount);

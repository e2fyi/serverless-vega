const lz = require('lz-string');
const fs = require('fs');

var spec = fs.readFileSync(__dirname+'/spec_vg.json', {encoding: 'utf8'});

var compressed = lz.compressToEncodedURIComponent(spec);
console.log(compressed)
console.log(lz.decompressFromEncodedURIComponent(compressed))

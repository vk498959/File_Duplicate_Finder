// find duplicate files with Node.js, cuz, you know, it's useful

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var crypto = require('crypto');
var path = require('path');

var pathA = "C:/Users/Admin/Desktop/fileDuplicateTest/test"; // folder you're in, wherever that might be
var pathB = "C:/Users/Admin/Desktop/fileDuplicateTest"; // yes, yes, argv, etc, but I haven't bothered yet, ok!


var hashes = []; // where the magical hashes will be stored - but wait, that's not all, now also with file info!

// I dub this: promise hell! (or possibly this could just be done eons better, but well, it works...)
function hashDirIn(folder) {
	var pathPromiseA = fs.readdirAsync(folder).map(function(fileName) {
		var workPath = path.join(folder, fileName);
		var statPromise = fs.statAsync(workPath);
		
		return Promise.join(statPromise, fileName, function(statPromise, fileName) {
			
			if(statPromise.isFile()) {

				function makeStream(file, callback) {
					var result = fs.createReadStream(workPath);
					return callback(result);
				}

				function process(stream) {
					var hash = crypto.createHash('md5'); 
					return new Promise(function(resolve, reject) {
						stream.on('data', function updateProcess(chunk) {
							hash.update(chunk, 'utf8');
						});
						stream.on('end', resolve);
					}).then(function publish() {
						var digest = hash.digest('hex');
						hashes.push({digest:digest, path:workPath});
					});
				}

				return makeStream(fileName, process);

			} // endif :p

		});

	}).then(function(){
		// sort and display dupes
		if(i==1) {
			hashes.sort(function(a, b) {
				if (a.digest < b.digest) {
					return -1;
				}
				if (a.digest > b.digest) {
					return 1;
				}
				return 0;
			});
			var dupe = 1;
			hashes.map(function(obj, index) {
				// note: currently this won't deal gracefully with more than two equal files at a time, though it will find them all (gotta find them all!)
				if (index-1 >= 0) {
					if(obj.digest == hashes[index-1].digest) {
						console.log("Dupe "+dupe+" found:");
						console.log(obj.path);
						console.log("Equal to:")
						console.log(hashes[index-1].path+"\n");
						dupe++;
					}
				}
			});
		}
		i++; // why do I feel this is cheating?
	});
}
var i = 0;
hashDirIn(pathA);
hashDirIn(pathB);
// but how to check both concurrently instead of one after the other? Ah well, it's late and my bottle of Ileach is soon empty...
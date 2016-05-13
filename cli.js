
var dataset = require('.')

console.log(process.argv)

function execute (command) {
  switch (command) {
    // TODO: Looks like the issue is in the extraction
    case 'extract':
      return dataset.extract(process.argv[3], process.argv[4]).then(function (data) {
        console.log(data)
      })
    case 'hash':
      return dataset.hashDir(process.argv[3]).then(function (hash) {
        console.log(hash)
      })
    default:
      console.log('use: dataset command [args]')
  }
}

execute(process.argv[2])

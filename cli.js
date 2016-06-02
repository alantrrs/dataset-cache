
var dataset = require('.')

// TODO: hash files and directories
// TODO: validate files and directories

function execute (command) {
  switch (command) {
    case 'install':
      return dataset.install(require(process.argv[3]), process.argv[4]).then(function (data) {
        console.log(data)
      })
    case 'extract':
      return dataset.extract(process.argv[3], process.argv[4]).then(function (data) {
        console.log(data)
      })
    case 'hash':
      return dataset.hash(process.argv[3]).then(function (hash) {
        if (!hash) return console.log('No such file or directory')
        console.log(`${process.argv[3]}\t${hash}`)
      })
    default:
      console.log('use: dataset command [args]')
  }
}

execute(process.argv[2])

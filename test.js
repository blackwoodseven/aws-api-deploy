const create = require('./src/commands/create')
create({}).then( options => {
  console.log('Result', options)
})

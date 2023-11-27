// Module for handling "code" path

const express = require('express')
const router = express.Router()

// // middleware that is specific to this router, is used for every request
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

//When the '/code' path is requested generally
router.get('/', (req, res) => {
  res.send(`'codes' home page`)
})

//When a specific code is requested
router.get('/:id', (req, res) => {
  res.send("The requested code: " + req.params.id)
})

//When the '/code' path is posted, creates a new code linked to the authorized user
router.post('/', (req, res) => {
  res.send(`This should create a new code, not yet configured.`)
})

module.exports = router
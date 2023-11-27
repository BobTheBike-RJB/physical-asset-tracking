// Module for handling "code" path

const express = require('express')
const router = express.Router()

// // middleware that is specific to this router, is used for every request
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

// define the home page route
router.get('/', (req, res) => {
  res.send(`'codes' home page`)
})

//When a specific code is requested
router.get('/:id', (req, res) => {
  res.send("The requested code: " + req.params.id)
})

module.exports = router
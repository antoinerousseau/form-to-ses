// Wrapper for Rollbar

'use strict'

const rollbar = require('rollbar')

const config = require('../config.json')

let initialized = false

if (config.rollbar_token) {
  rollbar.init(config.rollbar_token)
  rollbar.handleUncaughtExceptions()
  initialized = true
} else {
  console.warn('Warning: Rollbar has not been initialized due to missing Project Access Token in config.')
}

module.exports = (err, req) => {
  if (initialized) {
    rollbar.handleError(err, req)
  }
}

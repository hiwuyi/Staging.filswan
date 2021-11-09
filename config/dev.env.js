'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"https://staging.filswan.com/"',
  BASE_PAYMENT_GATEWAY_API: '"https://staging.filswan.com/"'
})

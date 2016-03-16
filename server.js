#!/usr/bin/env node

'use strict'

// load server config, based on config.dist.json:
let config
try {
  config = require('./config.json')
} catch (err) {
  console.error(err)
  console.error('Cannot find configuration file. You must copy `config.dist.json` into `config.json` and edit it with your settings.')
  process.exit()
}

const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 3000

const AmazonSES = require('amazon-ses')
const mailer = new AmazonSES(config.access_key_id, config.secret_access_key, config.region)

const rollbar = require('./lib/rollbar')

const express = require('express')
const bodyParser = require('body-parser')
const url = require('url')

const app = express()

app.use(bodyParser.urlencoded({extended: false}))

app.post('/send', (req, res) => {
  const body = req.body || {}
  if (!body.success || !body.error) {
    res.end('Missing params')
    return
  }

  const base_url = req.headers.origin + '/'
  const success_url = base_url + body.success
  const error_url = base_url + body.error

  const host = (req.headers['x-forwarded-host'] || req.headers.host).split(':')[0]
  const allowed_origins = [host].concat(config.allowed_origins || [])
  const origin = url.parse(req.headers.origin).hostname
  const ip = req.headers['cf-connecting-ip'] || req.ip

  if (allowed_origins.indexOf(origin) === -1) {
    res.redirect(error_url + '?reason=forbidden')
    return
  }

  if (!body.name || !body.email || !body.message) {
    res.redirect(error_url + '?reason=data')
    return
  }

  const subject = body.subject || config.default_subject

  if (typeof config.to === 'string') {
    config.to = [config.to] // must be an array
  }

  const message = {
    from: config.from.replace('[origin]', origin),
    replyTo: [body.name + ' <' + body.email + '>'],
    to: config.to,
    subject: subject,
    body: {
      text: body.message,
    },
  }

  mailer.send(message, (error, response) => {
    console.log('Attempting to send message from', message.replyTo[0], ip)
    if (error) {
      res.redirect(error_url + '?reason=amazon')
      rollbar(error, req)
      console.error(error.toString())
    } else {
      res.redirect(success_url)
      console.log('OK:', response.SendEmailResult)
    }
  })
})

app.listen(PORT, () => {
  console.log('Listening on port %s', PORT)
})

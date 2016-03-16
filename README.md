# Contact form to Amazon SES

Receive POST data and send them through Amazon SES (ideal for contact forms)

## Setup

Prerequisites:

* [Node.js](http://nodejs.org/)
* An [Amazon SES](https://aws.amazon.com/ses/) account

Retrieve dependencies:

    npm install

Configure:

    cp config.dist.json config.json

Then edit `config.json` to setup your app:

* `region`: your Amazon SES account region
* `access_key_id` and `secret_access_key`: your Amazon AWS credentials
* `from`: the sender email address of the emails you will receive (it *must* be [verified](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-email-addresses.html)). You can use the `[origin]` placeholder, which will be replaced by the hostname of your form, or `[domain]` for the domain name (origin root).
* `to`: your email address(es)
* `default_subject`: used if your visitor did not provide a subject to their message (or if you did not provide a `subject` field)
* `allowed_origins` (optional): hostnames allowed to post (no port)
* `rollbar_token` (optional): your [Rollbar](https://rollbar.com/) Project Access Token (usually the _post_server_item_)

## Start

    ./server.js

Or daemonize:

    npm install -g pm2
    PORT=3000 pm2 start server.js --name "form-to-ses" -- --color

## Use

Your contact form should look like this:

```html
<form method="post" action="http://mail.yourdomain.com/send">
    <input type="hidden" name="success" value="thanks.html">
    <input type="hidden" name="error" value="error.html">
    <input type="text" name="name" required>
    <input type="text" name="email" required>
    <input type="text" name="subject">
    <textarea name="message"></textarea>
    <button>Send</button>
</form>
```

If the mail is successfully sent to you, the user will be redirected to the page specified in the `success` input field.  
If an error happens, the user will be redirected to the page specified in the `error` input field, with the reason as a `reason` parameter in the URL query. If you have plugged a Rollbar account, you will find more information there.

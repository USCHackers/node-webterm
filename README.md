terminal.js-webshell
====================

this is a demo application for [child_pty](https://github.com/Gottox/child_pty) and [terminal.js](https://github.com/Gottox/terminal.js).

running this demo
-----------------

```
npm install
npm start
```

Then point your browser to http://127.0.0.1:3000

![Demo](https://raw.githubusercontent.com/Gottox/terminal.js-webshell/master/demo.gif)


Orientation Invite
===

This project powers the "Invite to Hacker Orientation", an event put on by
USC Hackers & Spark SC. The terminal UI pays homage to the command line
interface.


### Setup & Local Development

```bash
git clone git@github.com:uschackers/orientation-invite.git
cd orientation-invite
npm install
npm run start:dev
```


### Deployment

Install dependencies:
- Node (v8.4.0)

```bash
npm install
npm install -g forever
forever start app.js
```

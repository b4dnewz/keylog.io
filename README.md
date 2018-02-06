# keylog.io

## How it works?

#### Backend
The backend consist of an [expressjs](https://expressjs.com/) webserver which serves the administrator interface using __Basic HTTP Authentication__ customizable from the options and a [socket.io](https://socket.io/) server wait and handle the receiving of key logs from various sources, stores them and forward them to the administrator interface for be seen and analyzed.

#### Interface
The administrator interface for visualize the key logs archive and the live key logs feed from various clients is built with Angular using [Angular CLI](https://github.com/angular/angular-cli) version 1.6.6.

## Installation
```
npm install keylog.io
```
or
```
yarn add keylog.io
```

## Basic usage
```js
const keyloggerServer = require('keylog.io');

// Start the server connected with database
keyloggerServer({
  serveDemo: true,
  serveClient: true,
  database: {
    name: 'keylogger',
    username: 'user',
    password: 'pass'
  }
});

```
You call also start it from the __command line__, take a look at the arguments by typing: `keylog-io --help`
```bash
Options:

    -V, --version          output the version number
    -h, --hostname <host>  The address where start the server (default: 0.0.0.0)
    -p, --port <port>      The port where start the server (default: 9000)
    -c, --client           Serve the client keylogger file
    -d, --demo             Serve the demo client page
    -h, --help             output usage information

```
For a full list of options see the [default](lib/index.js#L27-L49) options on source code.

## Todo
- [x] Basic HTTP Authentication for administrator interface with options for username and password
- [x] Optionally save key logs results on a MySQL database
- [x] Change behavior, pausing and trying to hide when devtools is open
- [ ] Test key logger performances with multiple different hosts
- [ ] Complete the administrator interface with filters, groups, labels and stuff..
- [ ] Create different routes for live feeds and archive
- [ ] Get drunk at the end of all this

---

## Development

Run `npm run start` this will concurrently spin up the express/socketio development server and start angular-cli. It should open a browser page with the administrator interface, if not, vavigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Also it will serve a __keylogger client__ demo page at the address: `http://localhost:9000/demo/`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

Run `npm run build-client` to build the key logger-client file which is a socket.io-client module with a payload for capturing key presses and send them to a remote server.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
To get more informations about Socket.io visit the [official](https://socket.io/) page or visit the [documentation](https://socket.io/docs/).

---

## License
The __keylog.io__ is released under the MIT License by [b4dnewz](https://b4dnewz.github.io/).

## Contributing

1. Fork it ( https://github.com/b4dnewz/keylog.io/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Write and run the tests (`npm run test`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create a new Pull Request

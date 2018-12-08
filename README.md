# keylog.io

#### Backend
The backend consist of an [expressjs](https://expressjs.com/) webserver which serves the administrator interface using __Basic HTTP Authentication__ customizable from the options and a [socket.io](https://socket.io/) server wait and handle the receiving of key logs from various sources, stores them and forward them to the administrator interface for be seen and analyzed.

#### Interface
The administrator interface for visualize the key logs archive and the live key logs feed from various clients is built with Angular using [Angular CLI](https://github.com/angular/angular-cli) version 1.6.6. The administrator interface comes with a basic HTTP authorization which defaults to: `keylog-io`

#### Client script
The client script is a socketio.io client with key logger functions that try to hide himself by pausing when the dev-tools (inspector) is open. It catches only relevant keys and send them back to the server as a buffer with additional information, take a look at the [code](lib/client.js) if you want to see more.

---

## Installation
The best way to use it is installing it globally so you have access at the __keylog-io__ command anytime you want to spin up quickly your keylog server.
```
npm install -g keylog.io

```
or
```
yarn global add keylog.io
```
Than type `-h` or `--help` anytime to get informations about the program or the commands, for example:
```
$ keylog-io --help

Commands:

  start [options]                    Start the keylogger server
  build [options] <hostname> [port]  Build the client flle for the given endpoint
```
or sub commands for example:
```
$ keylog-io start --help

Usage: start [options]

Options:

  -h, --hostname <host>  The address where start the server
  -p, --port <port>      The port where start the server (default: 3000)
  -c, --client           Serve the client keylogger file
  -d, --demo             Serve the demo client page
  -h, --help             output usage information
```
You can also optionally [setup a database]() to use for storing persistently the keylog entries you grab with the client payload.

## Basic usage
You can also use it in your applications or scripts like a normal nodejs module.
First of all install it using __npm__ or __yarn__:
```
npm install keylog.io
yarn add keylog.io
```
Than require it in your code and use it like in the example below, it takes only few options:
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
By default the administrator interface will have __Basic HTTP Authentication__ with values: `keylog-io`

## Options
For a full list of options see the [default](lib/index.js#L27-L49) options on source code.

## Database
If you want to use the MySQL database to __persist the keylog entries__ across time when used multiple times or for using the
archive page to analyze your findings later using the filters, you must setup a table called __keylogs__, the suggested
table structure is the following but you can adapt the sized to your needs or suggest a more optimized structure. You can customize the database name using the `database` options property which is an object that let you configure the details of the connection to your MySQL instance.
```sql
CREATE TABLE `keylogs` (
  `id` int(11) NOT NULL,
  `hostname` varchar(50) NOT NULL,
  `element` varchar(50) NOT NULL,
  `key` varchar(50) NOT NULL,
  `path` varchar(255) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `keylogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `HOSTNAME_INDEX` (`hostname`);

ALTER TABLE `keylogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
```

---

## Todo
- [x] Basic HTTP Authentication for administrator interface with options for username and password
- [x] Optionally save key logs results on a MySQL database
- [x] Change behavior, pausing and trying to hide when devtools is open
- [x] Create different routes for live feeds and archive
- [x] Handle mobile input events (mobile browsers support)
- [ ] Test key logger performances with multiple different hosts
- [ ] Complete the administrator interface with filters, groups, labels and stuff..
- [ ] Write a good documentation with examples and video use during simulated MITM attacks
- [ ] Write tests for backend and frontend code
- [ ] Get drunk at the end of all this

---

## Development

Run `npm run start` this will concurrently spin up the express/socketio development server and start angular-cli. It should open a browser page with the administrator interface, if not, vavigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Also it will serve a __keylogger client__ demo page at the address: `http://localhost:3000/demo/`

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

Run `npm run build-client` to build the key logger-client file which is a socket.io-client module with a payload for capturing key presses and send them to a remote server.

### Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
To get more informations about Socket.io visit the [official](https://socket.io/) page or visit the [documentation](https://socket.io/docs/).

## Contributing

1. Fork it ( https://github.com/b4dnewz/keylog.io/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Write and run the tests (`npm run test`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create a new Pull Request

---

## License
The __keylog.io__ is released under the MIT License by [b4dnewz](https://b4dnewz.github.io/).

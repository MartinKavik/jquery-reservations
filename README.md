jQuery table reservations plugin
===========
> [demo](http://kavik.cz/demos/reservation/)

# Description
This project is a small experiment with application of [The Elm Architecture](http://guide.elm-lang.org/architecture/) in Javascript world.

Plugin's [code](app/reservation.js) contains 4 main sections:
- INIT
 - sets default values of "private" vars (including merge of user's settings)
- EVENT HANDLERS (= *update*)
 - processes user inputs and modifies *model*
   - (*model* matches "private" vars in the project and the most important is var *floors* - it is container for [db.json](db.json) content)
- VIEW
 - renders the plugin according to the *model*
 - render is started after every *model* change (inspiration: http://elm-lang.org/blog/blazing-fast-html)
   - *main advantage* - it is not necessary to modify *model* and also corresponding part of the DOM in EVENT HANDLERS
    - *main disadvantages* - it is slow without diff algorithm (reservation grid with more than ~30x30 cells has noticeable delays before responses to user actions) and input fields loses focus during rerender
- API
 - "public" plugin functions
   - (public / private vars in JS - viz *closures* - http://ryanmorr.com/understanding-scope-and-context-in-javascript/)

# Technologies / libraries
- [Webpack boilerplate](https://github.com/cvgellhorn/webpack-boilerplate)
- [jQuery](https://jquery.com/)
- [SASS](http://sass-lang.com/)
- ["old" Javascript](https://es5.github.io/) 

# Requirements
- [Node.js](https://nodejs.org/en/)
- [Bower](https://www.npmjs.com/package/bower)

# Setup
```sh
$ sudo npm install
```

```sh
$ bower install
```

# Development
Run the local webpack-dev-server with livereload and autocompile
```sh
$ npm run dev
```

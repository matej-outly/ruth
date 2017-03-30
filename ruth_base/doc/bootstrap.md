# Bootstrap

Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.

- [Bootstrap website](http://getbootstrap.com/)
- [GitHub sources](https://github.com/twbs/bootstrap-sass/tree/master/assets/stylesheets/bootstrap)

## Installation

Bootstrap is available as gem for Rails.

Add into your Gemfile and run `bundle install` afterwards:
```ruby
# Bootstrap
gem "bootstrap-sass", "~> 3.3.6"
```

Add these lines into your `application.js` file:

```js
// Bootstrap
//= require bootstrap-sprockets
```

Add style into `application.scss` file:

```scss
@import "bootstrap-sprockets";
@import "bootstrap";
```

## Settings

It is possible to override default Bootstrap variables. The simplies way is to create new `bootstrap-settings.scss` file and include it before Bootstrap includes:

```scss
@import "bootstrap-settings";
@import "bootstrap-sprockets";
@import "bootstrap";
```

### Typical variables to override

```scss
// Gap between columns
$grid-gutter-width: 20px;
```


## Extensions

We added some extensions into Bootstrap, which can be found in **Ruth Website** module.
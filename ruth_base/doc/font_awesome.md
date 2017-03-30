# Font Awesome

Font Awesome gives you scalable vector icons that can instantly be customized — size, color, drop shadow, and anything that can be done with the power of CSS.

- [Font Awesome website](http://fontawesome.io/)
- [Icon search](http://fontawesome.io/icons/)

## Installation

Font Awesome is available as gem for Rails.

Add into your Gemfile and run `bundle install` afterwards:
```ruby
# Font awesome
gem "font-awesome-sass", "~> 4.6.2"
```

Add style into `application.scss` file:
```scss
@import "font-awesome-sprockets";
@import "font-awesome";
```


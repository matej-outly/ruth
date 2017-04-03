# Animate It!

Because static content is boring!

- [Animate It! website](http://jackonthe.net/css3animateit/)


## Typical use cases

- Add animations on webpage

## Usage

For proper use needs [Appear](appear.md) and [Do Timeout](do_timeout.md) plugins.

Add into your `application.js`:
```js
//= require appear/appear
//= require do_timeout/do_timeout
//= require animate_it/animate_it
```

Add into your `application.scss`:
```scss
@import "animate_it/animate_it";
```

If you need animations proper work in IE9 and bellow:
```html
<!--[if lte IE 9]>
      <link href="/PATH/TO/FOLDER/animate_it_ie_fix.css" rel="stylesheet">
<![endif]-->
```
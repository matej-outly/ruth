# Fancybox 

FancyBox is a tool for displaying images, html content and multi-media in a Mac-style "lightbox" that floats overtop of web page. 

- [Fancybox website](http://fancybox.net/)

## Typical use cases

- Showing images in full size
- Simple "modal" image gallery
- Showing simple content in modal window

## Installation

Add into your Gemfile and run `bundle install` afterwards:
```ruby
gem "ruth_base"
```

Add these lines into your `application.js` file:

```js
//= require fancybox/fancybox
```

Add style into `application.scss` file:

```css
@import "fancybox/fancybox";
```

## Usage

Typical usage on images for example is:

```erb
<%= link_to image_full_url, class: "fancybox", rel: "optional_gallery_identifier" do %>
    <%= image_tag image_thumbnail_url %>
<% end %>
```

Set up in your main JavaScript file:
```js
$(document).ready(function() {
    $(".fancybox").fancybox({
        openEffect  : 'none',
        closeEffect : 'none'
    });
});
```
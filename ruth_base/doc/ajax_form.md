# Ajax Form

Ajax Form is JQuery plugin for managing Ajax form requests from/to Ruby on Rails framework. It is developed by Clockstar team.

## Installation

Add into your Gemfile and run `bundle install` afterwards:
```ruby
gem "ruth_base"
```

Add these lines into your `application.js` file:

```javascript
//= require ajax_form/ajax_form
```

Ajax Form requires a little bit styling, add into `application.scss` file:

```css
@import "ajax_form/ajax_form";
```


## Set up your controller

For proper working of Ajax Form controller actions must return:

- `@object.id` in case of success, or 
- `@object.errors` in case of errors.

Example of controller action, which can handle both AJAX and regular POST events:

```ruby
def create
    @my_model = MyModel.new(my_model_params)
    if @my_model.save
        respond_to do |format|
            format.html { redirect_to request.referrer, notice: "Created" }
            format.json { render json: @my_model.id }
        end
    else
        respond_to do |format|
            format.html { redirect_to request.referrer, alert: "Error" }
            format.json { render json: @my_model.errors }
        end
    end
end
```


## Set up your views

Ajax Form works with every standard HTML form. AJAX request is sent to form `action` url by `POST` method.

### Standard Rails forms

For error messages there should be container, where these message can be displayed. Container is identified by its id, which is composed of `form id`, `field name` and suffix `_errors`.

```erb
<%= form_for @object, html: { id: "form_id" } do |f| %>
    <%= f.label :field_name %>
    <%= f.text_field :field_name %>
    <div id="form_id_field_name_errors"></div>

    <%= f.submit "Create" %>
<% end %>

<script type="text/javascript">
    $(document).ready(function() {
        $("#form_id").ajaxForm();
    });
</script>
```


### Rug Forms Builder integration

Ajax Form plugin is integrated into [Rug Forms Builder](/rug_builder/form_builder/). To make form AJAX ready, just set `ajax` flag:

```erb
<%= rug_form_for(
        @object, 
        ajax: true, 
        html: {
            data: {
                // ... Ajax Form configuration via data attributes ...
            }
        }
    ) do |f| %>
```

Errors are automatically added to fields, if you use `f.*_row` variants of input fields, like:

```erb
<%= f.text_input_row :name %>
```

If you need to show errors on different place, use standalone variant:

```erb
Usually not neccessary:
<%= f.errors :name %>
```

There is no need to call javascript explicitly, it is done automatically.

## How it works

After form submit, AJAX request is send and class `af-sending-request` is set on form. This can be used for styling some kind of "waiting for response..." message or animation on form.

### Data are correct, form has been submitted

When everything is OK and data from form has been successfully proccessed, form can disapear, be cleared or other action can be done depending on [configuration options](#configuration-options).

### Data are incorrect, form has errors

From validation errors are automatically pushed into appropriate error fields in form.

## Configuration options

Each configuration option have its data attribute equivalent, which should be set on form element.

- `flashSelector` (`string`)
    - Selector for inline flash container, if not provided, Alertify plugin used

- `successMessage` (`string`) 
    - Message displayed at success

- `errorMessage` (`string`) 
    - Message displayed at error

- `clearOnSubmit` (`boolean`)
    - Clear form values when successfuly submitted?

- `behaviorOnSubmit` (`none|hide|redirect`)
    - What to do when form is successfuly submitted

- `hideTimeout` (`integer`)
    - How many seconds to wait until hidden form is shown again, hide forever if null (only for 'hide' behavior)

- `copyToObject` (`string`)
    - JS object implementing addItem() and changeItem()  functions where submitted data will be copied

- `redirectUrl` (`string`)
    - URL where to redirect when form is successfuly submitted (necessary for 'hide' behavior)

- `showUrl` (`string`)
    - URL where edited object can be loaded through AJAX (necessary if copyToObject defined)


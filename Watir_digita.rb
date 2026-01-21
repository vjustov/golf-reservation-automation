require 'watir'
browser = Watir::Browser.start 'watir.com/examples/simple_form.html'

text_field = browser.text_field(id: 'first_name')
text_field.set 'Luke'
text_field.value == 'Luke' # => true
text_field.append ' Perry'
text_field.value == 'Luke Perry' # => true
text_field.clear
text_field.value == '' # => true
text_field.append 'Luke'
text_field.value == 'Luke' # => true
text_field.set ' Perry'
text_field.value == ' Perry' # => true

browser.close
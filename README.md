# AJAX Forms
A class that simplifies AJAX form submission.

## Installation
Install the package with NPM:

```
npm install @donutteam/ajax-forms
```

## Usage
Simply import the class:

```js
import { AJAXForm } from "@donutteam/ajax-form";
```

And then call `bindAll`:

```js
AJAXForm.bindAll();
```

That will bind all forms on the page with the `ajax` class on them by default. This can also be customized, see Configuration below.

If you prefer, you can also manually construct an `AJAXForm` by passing in a form element:

```js
const myForm = document.querySelector("form.my-form");

new AJAXForm(myForm);
```

## Configuration
The `AJAXForm` class contains various static members that can be changed to configure its functionality.

Below are the default options and a brief explanation of what they do:

```js
// The selector required for an element to be selected by bindAll.
AJAXForm.selector = "form.ajax";

// The default credentials mode for the fetch requests performed by AJAXForm.
//	This can be overriden on a per-form basis by a "data-credentials-mode" attribute.
AJAXForm.defaultCredentialsMode = "same-origin";

// A selector used on the form itself to find it's message list.
AJAXForm.messageListSelector = "ul";

// The Regular Expression used on message codes to determine if they were success codes.
//	This applies a different class to the message list items.
AJAXForm.successCodeRegExp = /SUCCESS_(.*)/;

// The class applied to messages whose codes match the above RegExp.
AJAXForm.successCSSClass = "success";

// The class applied to messages whose codes DO NOT match the above RegExp.
AJAXForm.errorCSSClass = "error";
```

## License
[MIT](https://github.com/donutteam/ajax-form/blob/main/LICENSE.md)
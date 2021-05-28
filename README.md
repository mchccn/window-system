# window-system

> An easy way to add a themed window system to your app. Draggable from the top, and resizable from any corner or side. Performant and light weight. What more could you ask for?

This is a small 500 line piece of code that will create a window that acts similar to actual windows on your desktop. 
It's easy to use and has a good UX while still being extremely lightweight and customizable.

It's really easy to use in code as well. 
There are a few constants at the top that modify the sizes of the window that you can change to your liking, and after that, it's easy as one to three to use:

```js
const [window, toggle] = createWindow({
  content: "main content",
});
```

`createWindow` takes one optional parameter, options, that it uses to inject content into the blank window. 
If no options are provided, a blank window with defaults is created.

There are currently 4 options:

- `icon` – The icon of the window; can be a string or HTML element (empty string to make it disappear).
- `title` – Title of the window (empty string to make it disappear).
- `content` – The window's content as an HTML element.
- `button` – Custom button element to toggle the window.

A demo can be found [here (in JavaScript)](https://jsfiddle.net/cursorsdottsx/os1xbty8/).

`ButtonWithOptions`
===================

A call-to-action button with a list of secondary options on a dropdown.

Props
-----

### `accent`

Colour accent.

- type: `enum('system')`


### `callback`

function to call with the value of the action

- type: `func`


### `children`

The text to be rendered inside the main button.

- type: `node`


### `disabled`

Whether the button is disabled.

- type: `bool`


### `href`

When present, the button will be rendered as an `a` element with the given
href.

- type: `string`


### `onClick`

Callback to be executed when the main button is clicked.

- type: `func`


### `options`

Object containing the secondary options. Keys define the text of the option and values contain the click callbacks.

 ```jsx
 <ButtonWithOptions
   onClick={this.mainCallback()}
   options={new Map(
     [
      'Save and continue',
       {
         action: 'save',
         methods: [
           'edit',
           'new'
         ]
       }
     ]
   ])}
 >
   Save
 </ButtonWithOptions>
 ```

- type: `custom`


### `type`

Type/function of the button

- type: `enum('button'|'submit')`
- default value: `'button'`


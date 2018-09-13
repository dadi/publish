import { h } from 'preact'
import { storiesOf } from '@storybook/react'
import Button from '../frontend/components/Button/Button.jsx'

storiesOf('Storybook With Preact', module)
    .add('render some text', () => <Button>test button</Button>)

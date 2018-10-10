import { h } from 'preact'
import { storiesOf } from '@storybook/react'

import {styles} from "../frontend/components/Main/Main.css"

import FieldStringEdit from '../frontend/components/FieldString/FieldStringEdit'
import FieldStringFilter from '../frontend/components/FieldString/FieldStringFilter'
import FieldStringList from '../frontend/components/FieldString/FieldStringList'

import FieldBooleanEdit from '../frontend/components/FieldBoolean/FieldBooleanEdit'
import FieldBooleanFilter from '../frontend/components/FieldBoolean/FieldBooleanFilter'
import FieldBooleanList from '../frontend/components/FieldBoolean/FieldBooleanList'

import FieldDateTimeEdit from '../frontend/components/FieldDateTime/FieldDateTimeEdit'
import FieldDateTimeFilter from '../frontend/components/FieldDateTime/FieldDateTimeFilter'

import FieldImageEdit from '../frontend/components/FieldImage/FieldImageEdit'
import FieldImageReferenceSelect from '../frontend/components/FieldImage/FieldImageReferenceSelect'

import FieldNumberEdit from '../frontend/components/FieldNumber/FieldNumberEdit'
import FieldNumberFilter from '../frontend/components/FieldNumber/FieldNumberFilter'

import FieldPasswordEdit from '../frontend/components/FieldPassword/FieldPasswordEdit'

const schema = {
  type: 'String'
}

storiesOf('FieldString', module)
  .add('FieldStringEdit', () => (
    <FieldStringEdit
      displayName='Display name'
      schema={schema}
    />
  ))

  .add('FieldStringList', () =>
    <div><FieldStringList schema={schema} />Expected to return null</div>)
  .add('FieldStringFilter', () =>
    <FieldStringFilter schema={schema} />)

storiesOf('FieldBoolean', module)
  .add('FieldBooleanEdit', () =>
    <FieldBooleanEdit schema={schema} />)
  .add('FieldBooleanFilter', () =>
    <FieldBooleanFilter schema={schema} />)
  .add('FieldBooleanList', () =>
    <FieldBooleanList schema={schema} />)

storiesOf('FieldDateTime', module)
  .add('FieldDateTimeEdit', () =>
    <FieldDateTimeEdit schema={schema} />)
  .add('FieldDateTimeFilter', () =>
    <FieldDateTimeFilter schema={schema} />)

storiesOf('FieldImage', module)
  .add('FieldImageEdit', () =>
    <FieldImageEdit schema={schema} />)
  .add('FieldImageReferenceSelect', () =>
    <div><FieldImageReferenceSelect schema={schema} />This one needs actual data to render</div>)

storiesOf('FieldNumber', module)
  .add('FieldNumberEdit', () =>
    <FieldNumberEdit schema={schema} />)
  .add('FieldNumberFilter', () =>
    <FieldNumberFilter schema={schema} />)

storiesOf('FieldPassword', module)
  .add('FieldPasswordEdit', () =>
    <FieldPasswordEdit schema={schema} />)

import edit from './FieldDateTimeEdit'
import list from './FieldDateTimeList'
import filterEdit from './FieldDateTimeFilterEdit'
import filterList from './FieldDateTimeFilterList'

const filterOperators = {
  $lt: 'is before',
  $gt: 'is after'
}

export {edit, list, filterEdit, filterList, filterOperators}

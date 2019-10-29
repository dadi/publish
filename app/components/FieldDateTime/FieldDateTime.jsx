import edit from './FieldDateTimeEdit'
import filterEdit from './FieldDateTimeFilterEdit'
import filterList from './FieldDateTimeFilterList'
import list from './FieldDateTimeList'

const filterOperators = {
  $lt: 'is before',
  $gt: 'is after'
}

export {edit, list, filterEdit, filterList, filterOperators}

import edit from './FieldNumberEdit'
import filterEdit from './FieldNumberFilterEdit'

const filterOperators = {
  $gt: 'is greater than',
  $gte: 'is greater than or equal to',
  $lt: 'is less than',
  $lte: 'is less than or equal to'
}

export {edit, filterEdit, filterOperators}

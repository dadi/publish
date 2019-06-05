import edit from './FieldStringEdit'
import filterEdit from './FieldStringFilterEdit'
import list from './FieldStringList'

const filterOperators = {
  $regex: 'contains',
  $ne: 'does not equal'
}

export {
  edit,
  filterEdit,
  filterOperators,
  list
}

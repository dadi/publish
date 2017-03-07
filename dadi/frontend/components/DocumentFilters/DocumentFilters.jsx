'use strict'

import {h, Component} from 'preact'

import {isValidJSON} from 'lib/util'

import DocumentFilter from 'components/DocumentFilter/DocumentFilter'
import Button from 'components/Button/Button'

export default class DocumentFilters extends Component {

  componentWillMount() {
    const {
      filter, 
      collection, 
      field, 
      value, 
      fields
    } = this.props

    // Evaluate passed filter / store in state
    this.state = {
      edit: false,
      visible: filter || false,
      filters: isValidJSON(filter) ? JSON.parse(filter) : null
    }
  }
  render() {
    const {visible, filters, edit} = this.state
    const {collection} = this.props
    return (
      <div>
        <Button onClick={this.toggleFilters.bind(this)}>Filters</Button>

        {visible && filters && Object.keys(filters).length && collection && (
          <div>
            {Object.keys(filters).map(key => ( 
              <DocumentFilter field={key} value={filters[key]} fields={collection.fields} updateFilter={this.updateUrlFilters.bind(this)} />
            ))}
          </div>
        )}
        {edit && (
          <DocumentFilter fields={collection.fields} updateFilter={this.updateUrlFilters.bind(this)} />
        )}
        {visible && (
          <Button onClick={this.addFilter.bind(this)}>Add</Button>
        )}
      </div>
    )
  }

  updateUrlFilters(filter) {
    const {updateUrlParams} = this.props
    const {filters} = this.state

    this.setState(Object.assign(filters, filter))
    
    if (typeof updateUrlParams === 'function') {
      updateUrlParams(filters)
    }
  }

  toggleFilters() {
    this.setState({
      visible: !this.state.visible
    })
  }

  addFilter() {
    this.setState({
      edit: true
    })
  }
}
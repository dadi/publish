'use strict'

import { h, Component } from 'preact'

import { isValidJSON } from 'lib/util'

import DocumentFilter from 'components/DocumentFilter/DocumentFilter'

export default class DocumentFilters extends Component {

  render() {
    const { filter, collection } = this.props
    let filters = isValidJSON(filter) ? JSON.parse(this.props.filter) : null
    
    return (
      <div>
        {filters && Object.keys(filters).length && collection && (
          <div>
            {Object.keys(filters).map(key => ( 
              <DocumentFilter key={key} value={filters[key]} fields={collection.fields} />
            ))}
          </div>
        )}
        <DocumentFilter fields={collection.fields} />
        <button onClick={this.addFilter}>Add filter</button>
      </div>
    )
  }

  addFilter() {
    console.log('new filter')
  }
}
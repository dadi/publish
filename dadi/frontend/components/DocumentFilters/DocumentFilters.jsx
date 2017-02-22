'use strict'

import { h, Component } from 'preact'

import DocumentFilter from 'components/DocumentFilter/DocumentFilter'

export default class DocumentFilters extends Component {

  render() {
    const { filter, collection } = this.props
    let filters = filter ? JSON.parse(this.props.filter) : null
    return (
      <div class="DocumentFilters">
        {filters && Object.keys(filters).length &&
          <div>
            {Object.keys(filters).map(key => ( 
              <DocumentFilter key={key} value={filters[key]}/>
            ))}
          </div>
        }
        <button onClick={this.addFilter}>Add filter</button>
      </div>
    )
  }

  addFilter() {
    console.log('new filter')
  }
}
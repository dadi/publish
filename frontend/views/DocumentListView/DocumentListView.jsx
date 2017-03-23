'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './DocumentListView.css'

import {isValidJSON, setPageTitle} from 'lib/util'

import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentList from 'containers/DocumentList/DocumentList'

export default class DocumentListView extends Component {
  constructor(props) {
    super(props)

    // If we have a valid filter when we mount the component for the first time,
    // then we start with the filters visible by default. Otherwise, they're
    // hidden.
    this.state.filtersVisible = props.filter && isValidJSON(props.filter)
  }

  render() {
    const {
      collection,
      filter,
      group,
      order,
      page,
      sort,
      state
    } = this.props
    const {filtersVisible} = this.state

    return (
      <div class={styles.container}>
        <section class="Documents">
          <DocumentListController
            collection={collection}
            group={group}
            filter={filter}
            filtersVisible={filtersVisible}
            onFiltersToggle={this.handleFilterToggle.bind(this)}
          />

          <DocumentList
            collection={collection}
            filter={filter}
            group={group}
            onPageTitle={this.handlePageTitle}
            order={order}
            page={page}
            sort={sort}
          />
        </section>
      </div>
    )
  }

  handleFilterToggle() {
    this.setState({
      filtersVisible: !this.state.filtersVisible
    })
  }

  handlePageTitle(title) {
    // We could have containers calling `setPageTitle()` directly, but it should
    // be up to the views to control the page title, otherwise we'd risk having
    // multiple containers wanting to set their own titles. Instead, containers
    // have a `onPageTitle` callback that they fire whenever they want to set
    // the title of the page. It's then up to the parent view to decide which
    // of those callbacks will set the title.

    setPageTitle(title)
  }
}

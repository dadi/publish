'use strict'

import {Component, h} from 'preact'

import Style from 'lib/Style'
import styles from './DocumentListView.css'

import {isValidJSON, setPageTitle} from 'lib/util'

import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentList from 'containers/DocumentList/DocumentList'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

export default class DocumentListView extends Component {
  constructor(props) {
    super(props)

    // If we have a valid filter when we mount the component for the first time,
    // then we start with the filters visible by default. Otherwise, they're
    // hidden.
    this.state.newFilter = false
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
    const {newFilter} = this.state

    return (
      <Page>
        <Header />

        <Main>
          <div class={styles.container}>
            <DocumentListController
              collection={collection}
              group={group}
              filter={filter}
              newFilter={newFilter}
              onAddNewFilter={this.handleAddNewFilter.bind(this)}
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
          </div>        
        </Main>
      </Page>
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.collection !== this.props.collection) {
      this.setState({
        newFilter: false
      })
    }
  }

  handleAddNewFilter(isNewFilter) {
    this.setState({
      newFilter: isNewFilter
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

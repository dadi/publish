'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './DocumentListView.css'

import {Keyboard} from 'lib/keyboard'
import {isValidJSON} from 'lib/util'

import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentList from 'containers/DocumentList/DocumentList'

export default class DocumentListView extends Component {
  constructor(props) {
    super(props)

    this.keyboard = new Keyboard()

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
            onFiltersToggle={() => {
              this.setState({
                filtersVisible: !this.state.filtersVisible
              })
            }}
          />

          <DocumentList
            collection={collection}
            group={group}
            order={order}
            page={page}
            sort={sort}
          />
        </section>
      </div>
    )
  }

  // (!) This should probably move to <Table>
  componentDidMount() {
    this.keyboard.on('space+a').do(cmd => {
      console.log(cmd.pattern)
      // Trigger something
    })
  }

  componentWillUnmount() {
    // Clear keyboard
    this.keyboard.off()
  }
}

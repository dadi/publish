import {h, Component} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'
import {route} from '@dadi/preact-router'
import * as Constants from 'lib/constants'
import * as searchActions from 'actions/searchActions'
import proptypes from 'proptypes'
import TextInputWithSuggestions from 'components/TextInputWithSuggestions/TextInputWithSuggestions'

/**
 * A text input that performs a search
 */
class TextInputWithCollectionSearch extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * A unique key to identify this search context. Multiple instances
     * of the component with the same context will share the same cache
     * pool.
     */
    context: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.state.value = null
  }

  handleInputChange(value) {
    const {actions, context} = this.props

    this.setState({
      value
    })

    actions.searchCollections({
      context,
      term: value
    })
  }

  render() {
    const {
      children,
      context,
      currentCollection,
      state
    } = this.props
    const {value} = this.state
    const query = state.search[context] &&
      state.search[context][value]
    const {results} = query || {}
    
    let suggestions = {}

    Object.keys(results || {}).forEach(collection => {
      results[collection].forEach(document => {
        suggestions[document._id] = document[document._primaryField]
      })
    })

    return (
      <TextInputWithSuggestions
        onChange={this.handleInputChange.bind(this)}
        suggestions={suggestions}
        value={value}
      />
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    search: state.search
  }),
  dispatch => bindActionCreators(searchActions, dispatch)
)(TextInputWithCollectionSearch)

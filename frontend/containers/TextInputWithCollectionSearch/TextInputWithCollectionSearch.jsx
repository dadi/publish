import {h, Component} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, debounce} from 'lib/util'
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
     * The debounce time (in ms) before a new set of results is requested.
     * Higher values will render a more responsive input at the cost of more
     * network traffic and more stress placed on the API.
     */
    debounceRate: proptypes.number,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  static defaultProps = {
    debounceRate: 500
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
      debounceRate,
      state
    } = this.props
    const {value} = this.state
    const query = state.search[context] &&
      state.search[context][value]
    const {isLoading, results} = query || {}

    let suggestions = {}

    Object.keys(results || {}).forEach(collection => {
      results[collection].forEach(document => {
        suggestions[document._id] = document[document._primaryField]
      })
    })

    return (
      <TextInputWithSuggestions
        isLoading={isLoading}
        onChange={debounce(this.handleInputChange, debounceRate).bind(this)}
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

import {h, Component} from 'preact'
import {route} from 'preact-router'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'

import * as userActions from 'actions/userActions'
import {connectHelper} from 'lib/util'
import * as Constants from 'lib/constants'

import CollectionNav from 'containers/CollectionNav/CollectionNav'
import IconBurger from 'components/IconBurger/IconBurger'
import IconCross from 'components/IconCross/IconCross'

import Style from 'lib/Style'
import styles from './Header.css'

/**
 * The application masthead.
 */
class Header extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.state.expanded = false
  }

  render() {
    const {state} = this.props
    const compact = state.app.breakpoint === null
    const user = state.user.remote

    if (!user) return null

    let contentStyle = new Style(styles, 'content')

    contentStyle.addIf('content-compact', compact)
    contentStyle.addIf('content-expanded', this.state.expanded)

    return (
      <header class={styles.header}>
        {compact &&
          <button
            type="button"
            class={styles.toggle}
            onClick={this.toggleCollapsed.bind(this, undefined)}
          >
            <span class={styles['toggle-icon']}>
              {this.state.expanded ?
                <IconCross width="16" height="16" />
                :
                <IconBurger width="12" height="16" />
              }
            </span>
            <span class={styles['toggle-label']}>Menu</span>
          </button>
        }
        
        <div class={contentStyle.getClasses()} onClick={this.toggleCollapsed.bind(this, false)}>
          <div class={styles.masthead}>
            <a href="/">
              <img class={styles.logo} src="/public/images/publish.png" />
            </a>

              {user && !user.error && (
                <div class={styles.controls}>
                  <button
                    class={styles.signout}
                    onClick={this.handleSignOut.bind(this)}
                  >
                    Sign out
                  </button>
                  <a href="/profile" class={styles.user}>{`${user.first_name} ${user.last_name}`}</a>
                </div>
              )}
          </div>

          <CollectionNav />
        </div>
      </header>
    )
  }

  handleSignOut() {
    const {actions} = this.props

    actions.signOut()
  }

  toggleCollapsed(expanded, event) {
    if (expanded === undefined) {
      expanded = !this.state.expanded
    }

    this.setState({
      expanded
    })
  }
}

export default connectHelper(
  state => ({
    app: state.app,
    user: state.user
  }),
  dispatch => bindActionCreators(userActions, dispatch)
)(Header)

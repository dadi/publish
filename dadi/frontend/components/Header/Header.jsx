import {h, Component} from 'preact'

import CollectionNav from 'containers/CollectionNav/CollectionNav'
import IconBurger from 'components/IconBurger/IconBurger'
import IconCross from 'components/IconCross/IconCross'

import Style from 'lib/Style'
import styles from './Header.css'

export default class Header extends Component {
  constructor(props) {
    super(props)

    this.state.expanded = false
  }

  toggleCollapsed(expanded, event) {
    if (typeof expanded === 'undefined') {
      expanded = !this.state.expanded
    }

    this.setState({
      expanded
    })
  }

  render() {
    const {compact, user} = this.props
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
              <img class={styles.logo} src="/images/publish.png" />
            </a>

            <div class={styles.controls}>
              <button
                class={styles.signout}
                onClick={this.props.onSignOut}
              >
                Sign out
              </button>
              <a href="#" class={styles.user}>{`${user.firstName} ${user.lastName}`}</a>
            </div>
          </div>

          <CollectionNav />
        </div>
      </header>
    )
  }
}
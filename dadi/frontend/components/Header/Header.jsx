import { h, Component } from 'preact'

import CollectionNav from 'containers/CollectionNav/CollectionNav'
import IconBurger from 'components/IconBurger/IconBurger'

import Style from 'lib/Style'
import styles from './Header.css'

export default class Header extends Component {
  toggleCollapsed() {
    this.setState({
      expanded: !this.state.expanded
    })
  }

  constructor(props) {
    super(props)

    this.state.expanded = false
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
            onClick={this.toggleCollapsed.bind(this)}
          >
            <span class={styles['toggle-icon']}>
              <IconBurger width="12" height="16" />
            </span>
            <span class={styles['toggle-label']}>Menu</span>
          </button>
        }
        
        <div class={contentStyle.getClasses()}>
          <div class={styles.masthead}>
            <a href="/">
              <img class={styles.logo} src="/images/publish.png" />
            </a>

            <div class={styles.controls}>
              <a href="/signout" class={styles.signout}>Sign out</a>
              <a href="#" class={styles.user}>{`${user.firstName} ${user.lastName}`}</a>
            </div>
          </div>

          <CollectionNav />
        </div>
      </header>
    )
  }
}
import {ExpandMore} from '@material-ui/icons'
import proptypes from 'prop-types'
import React from 'react'

import Style from 'lib/Style'
import styles from './EditInterface.css'

import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * An interface for editing documents.
 */
export default class EditInterface extends React.Component {
  static propTypes = {
    /**
     * The text to be rendered.
     */
    sections: proptypes.node
  }

  constructor(props) {
    super(props)

    this.toggleDropdown = () =>
      this.setState(({isNavOpen}) => ({isNavOpen: !isNavOpen}))

    this.state = {
      isNavOpen: false
    }
  }

  render() {
    const {children} = this.props
    const sections = React.Children.map(children, section => {
      const {hasErrors, href, isActive, label} = section.props

      return {hasErrors, href, isActive, label}
    })
    const {label: activeLabel} = sections.find(({isActive}) => isActive)
    const {isNavOpen} = this.state
    const mobileNavStyle = new Style(styles, 'mobile-navigation').addIf(
      'is-open',
      isNavOpen
    )

    return (
      <div className={styles.container}>
        {children.length > 1 && (
          <>
            <div className={mobileNavStyle.getClasses()}>
              <div className={styles.select} onClick={this.toggleDropdown}>
                <div className={styles.label}>{activeLabel}</div>
                <div className={styles.icon}>
                  <ExpandMore />
                </div>
              </div>

              {isNavOpen && (
                <div className={styles.dropdown}>
                  {sections.map(({hasErrors, href, isActive, label}) => (
                    <SubNavItem
                      active={Boolean(isActive)}
                      error={Boolean(hasErrors)}
                      href={href}
                      inDropdown
                      key={href}
                      onClick={this.toggleDropdown}
                    >
                      {label}
                    </SubNavItem>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.navigation}>
              {sections.map(({hasErrors, href, isActive, label}) => (
                <SubNavItem
                  active={Boolean(isActive)}
                  error={Boolean(hasErrors)}
                  href={href}
                  key={href}
                >
                  {label}
                </SubNavItem>
              ))}
            </div>
          </>
        )}

        {children}
      </div>
    )
  }
}

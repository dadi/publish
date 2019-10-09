import {connectRouter} from 'lib/router'
import proptypes from 'prop-types'
import React from 'react'
import {Select} from '@dadi/edit-ui'
import styles from './EditInterface.css'
import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * An interface for editing documents.
 */
class EditInterface extends React.Component {
  static propTypes = {
    /**
     * The text to be rendered.
     */
    sections: proptypes.node
  }

  constructor(props) {
    super(props)

    this.handleMobileTabSelect = this.handleMobileTabSelect.bind(this)
  }

  handleMobileTabSelect(event) {
    const {route} = this.props
    const {value} = event.target

    if (value) {
      route.history.push(value)
    }
  }

  render() {
    const {children} = this.props
    const sections = React.Children.map(children, section => {
      const {hasErrors, href, isActive, label} = section.props

      return {hasErrors, href, isActive, label}
    })
    const mobileNavigationOptions = sections.map(({href, isActive, label}) => ({
      label,
      selected: isActive,
      value: href
    }))

    return (
      <div className={styles.container}>
        {children.length > 1 && (
          <>
            <div className={styles['mobile-navigation']}>
              <Select
                onChange={this.handleMobileTabSelect}
                options={mobileNavigationOptions}
              />
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

export default connectRouter(EditInterface)

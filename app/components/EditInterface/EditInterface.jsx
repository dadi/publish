import React from 'react'
import proptypes from 'prop-types'

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

  render() {
    const {children} = this.props

    return (
      <div className={styles.container}>
        {children.length > 1 && (
          <div className={styles.navigation}>
            {React.Children.map(children, section => {
              const {hasErrors, href, isActive, label} = section.props

              return (
                <SubNavItem
                  active={Boolean(isActive)}
                  error={Boolean(hasErrors)}
                  href={href}
                  key={href}
                >
                  {label}
                </SubNavItem>
              )
            })}
          </div>
        )}

        {children}
      </div>
    )
  }
}

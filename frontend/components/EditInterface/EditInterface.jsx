'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './EditInterface.css'

import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * An interface for editing documents.
 */
export default class EditInterface extends Component {
  static propTypes = {
    /**
     * The text to be rendered.
     */
    sections: proptypes.node
  }

  render() {
    const {children} = this.props

    return (
      <div class={styles.container}>
        {(children.length > 1) && (
          <div class={styles.navigation}>
            {children.map(section => {
              let {
                hasErrors,
                href,
                isActive,
                label,
                slug
              } = section.attributes

              return (
                <SubNavItem
                  active={Boolean(isActive)}
                  error={Boolean(hasErrors)}
                  href={href}
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

import proptypes from 'prop-types'
import React from 'react'

import Style from 'lib/Style'
import styles from './EditInterface.css'

/**
 * An interface for editing documents.
 */
export default class EditInterfaceSection extends React.Component {
  static propTypes = {
    /**
     * Whether the section has pending validation errors.
     */
    hasErrors: proptypes.bool,

    /**
     * Whether the section is the one currently active.
     */
    isActive: proptypes.bool,

    /**
     * The children to be rendered in the main placement.
     */
    main: proptypes.node,

    /**
     * The children to be rendered in the sidebar placement.
     */
    sidebar: proptypes.node
  }

  render() {
    const {isActive, main, sidebar} = this.props
    const sectionStyle = new Style(styles, 'section').addIf(
      'section-active',
      isActive
    )
    const mainBodyStyle = new Style(styles, 'main').addIf(
      'main-full',
      !sidebar.length
    )

    return (
      <section className={sectionStyle.getClasses()}>
        <div className={mainBodyStyle.getClasses()}>{main}</div>

        {sidebar && sidebar.length > 0 && (
          <div className={styles.sidebar}>{sidebar}</div>
        )}
      </section>
    )
  }
}

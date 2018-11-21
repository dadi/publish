'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './EditInterface.css'

/**
 * An interface for editing documents.
 */
export default class EditInterfaceSection extends Component {
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
    const {
      hasErrors,
      isActive,
      main,
      sidebar
    } = this.props

    let sectionStyle = new Style(styles, 'section')
    let mainBodyStyle = new Style(styles, 'main')

    sectionStyle.addIf('section-active', isActive)

    // If there are no fields in the side bar, the main body can use
    // the full width of the page.
    //mainBodyStyle.addIf('main-full', !fields.sidebar.length)

    return (
      <section class={sectionStyle.getClasses()}>
        <div class={mainBodyStyle.getClasses()}>
          {main}
        </div>

        {sidebar &&
          <div class={styles.sidebar}>
            {sidebar}
          </div>
        }
      </section>
    )
  }
}

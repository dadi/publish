import proptypes from 'prop-types'
import React from 'react'

import Style from 'lib/Style'
import styles from './TabbedFieldSections.css'

import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * A list of sections navigatable with a tab bar
 */
export default class TabbedFieldSections extends React.Component {
  static propTypes = {
    /**
     * The slug of the section that is currently active.
     */
    activeSection: proptypes.string,

    /**
     * Render function for fields.
     */
    renderField: proptypes.func,

    /**
     * Array of sections to render.
     */
    sections: proptypes.array
  }

  static defaultProps = {
    sections: []
  }

  render() {
    const {activeSection, renderField, sections} = this.props

    return (
      <div className={styles.container}>
        {sections.length > 1 && (
          <div className={styles.navigation}>
            {sections.map(section => (
              <SubNavItem
                active={section.slug === activeSection}
                error={section.hasErrors}
                href={section.href}
              >
                {section.name}
              </SubNavItem>
            ))}
          </div>
        )}

        {sections.map(section => {
          const fields = {
            main: section.fields.filter(field => {
              return (
                !field.publish ||
                !field.publish.placement ||
                field.publish.placement === 'main'
              )
            }),
            sidebar: section.fields.filter(field => {
              return (
                field.publish &&
                field.publish.placement &&
                field.publish.placement === 'sidebar'
              )
            })
          }

          const sectionStyle = new Style(styles, 'section')
          const mainBodyStyle = new Style(styles, 'main')

          sectionStyle.addIf('section-active', section.slug === activeSection)

          // If there are no fields in the side bar, the main body can use
          // the full width of the page.
          mainBodyStyle.addIf('main-full', !fields.sidebar.length)

          return (
            <section className={sectionStyle.getClasses()}>
              <div className={mainBodyStyle.getClasses()}>
                {fields.main.map(field => (
                  <div className={styles.field}>{renderField(field)}</div>
                ))}
              </div>

              {fields.sidebar.length > 0 && (
                <div className={styles.sidebar}>
                  {fields.sidebar.map(field => (
                    <div className={styles.field}>{renderField(field)}</div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    )
  }
}

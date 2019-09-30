import * as appActions from 'actions/appActions'
import * as userActions from 'actions/userActions'
import {Button} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
import Header from 'containers/Header/Header'
import NotificationCentre from 'containers/NotificationCentre/NotificationCentre'
import ProfileField from 'containers/ProfileField/ProfileField'
import React from 'react'
import {setPageTitle} from 'lib/util'
import styles from './ProfileEditView.css'
import Toolbar from 'components/Toolbar/Toolbar'

const PROFILE_SCHEMA = {
  _publishLink: '/profile',
  fields: {
    'data.publishFirstName': {
      _id: 'data.publishFirstName',
      label: 'First name',
      type: 'String',
      publish: {
        section: 'Personal details'
      }
    },
    'data.publishLastName': {
      _id: 'data.publishLastName',
      label: 'Last name',
      type: 'String',
      publish: {
        section: 'Personal details'
      }
    },
    currentSecret: {
      _id: 'currentSecret',
      label: 'Current password',
      publish: {
        section: 'Credentials',
        subType: 'Password'
      },
      type: 'String'
    },
    secret: {
      _id: 'secret',
      label: 'New password',
      publish: {
        requireConfirmation: true,
        section: 'Credentials',
        subType: 'Password'
      },
      type: 'String'
    }
  },
  name: 'Profile',
  slug: 'profile'
}

class ProfileEditView extends React.Component {
  constructor(props) {
    super(props)

    this.contentKey = 'profile'

    this.handleBuildBaseUrl = this.handleBuildBaseUrl.bind(this)
    this.handleSave = this.handleSave.bind(this)
  }

  componentDidUpdate(oldProps) {
    const {actions, state} = this.props
    const {user} = state
    const {user: oldUser} = oldProps.state

    if (oldUser.saveAttempts < user.saveAttempts) {
      return actions.saveUser()
    }

    if (oldUser.isSaving && !user.isSaving) {
      const message = user.remoteError
        ? 'Could not update your settings'
        : 'Your settings have been updated'

      return actions.setNotification({
        message,
        type: user.remoteError ? 'negative' : 'positive'
      })
    }
  }

  handleBuildBaseUrl({
    referenceFieldSelect = this.props.route.params.referenceField,
    section = this.props.route.params.section
  }) {
    let urlNodes = ['profile', section]

    if (referenceFieldSelect) {
      urlNodes = urlNodes.concat(['select', referenceFieldSelect])
    }

    const url = urlNodes.filter(Boolean).join('/')

    return `/${url}`
  }

  handleSave() {
    const {actions} = this.props

    actions.registerSaveUserAttempt()
  }

  render() {
    setPageTitle('Profile')

    return (
      <>
        <Header />

        {this.renderToolbar()}

        <main className={styles.main}>
          <div className={styles.container}>
            <h1 className={styles.title}>Profile</h1>
            {this.renderFields()}
          </div>
        </main>
      </>
    )
  }

  renderFields() {
    return (
      <section className={styles.fields}>
        <div className={styles.column}>
          <div className={styles.input}>
            <ProfileField
              field={PROFILE_SCHEMA.fields['data.publishFirstName']}
              onBuildBaseUrl={this.handleBuildBaseUrl}
            />
          </div>

          <div className={styles.input}>
            <ProfileField
              field={PROFILE_SCHEMA.fields['data.publishLastName']}
              onBuildBaseUrl={this.handleBuildBaseUrl}
            />
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.input}>
            <ProfileField
              field={PROFILE_SCHEMA.fields.currentSecret}
              onBuildBaseUrl={this.handleBuildBaseUrl}
            />
          </div>

          <div className={styles.input}>
            <ProfileField
              field={PROFILE_SCHEMA.fields.secret}
              onBuildBaseUrl={this.handleBuildBaseUrl}
            />
          </div>
        </div>
      </section>
    )
  }

  renderToolbar() {
    const {validationErrors} = this.props.state.user
    const hasValidationErrors = Boolean(
      validationErrors &&
        Object.keys(validationErrors).filter(field => validationErrors[field])
          .length
    )

    return (
      <div className={styles.toolbar}>
        <NotificationCentre />

        <Toolbar>
          <div className={styles['toolbar-container']}>
            <Button
              accent="positive"
              disabled={hasValidationErrors}
              fillStyle="filled"
              onClick={this.handleSave}
            >
              Save settings
            </Button>
          </div>
        </Toolbar>
      </div>
    )
  }
}

export default connectRedux(appActions, userActions)(ProfileEditView)

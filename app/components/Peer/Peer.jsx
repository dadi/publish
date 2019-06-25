import Button from 'components/Button/Button'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Peer.css'

export default class Peer extends React.Component {
  static propTypes = {
    /**
     * The peer is currently active.
     */
    active: proptypes.bool.isRequired,

    /**
     * The socket peer.
     */
    peer: proptypes.object.isRequired
  }

  static defaultProps = {
    active: true
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {active, peer} = this.props

    if (typeof peer !== 'object' || !peer.name) return null

    const initial = peer.name.charAt(0)
    const peerClass = new Style(styles, 'avatar').addIf('active', active) // {!} TD - Set this using timestamp

    return (
      <Button accent="data" className={peerClass.getClasses()} type="mock">
        {initial}
      </Button>
    )
  }
}

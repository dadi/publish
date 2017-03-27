'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Peer.css'

import Button from 'components/Button/Button'

export default class Peer extends Component {
  static propTypes = {
    /**
     * The socket peer.
     */
    peer: proptypes.object
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {peer} = this.props
    const initial = peer.name.charAt(0)

    const peerClass = new Style(styles, 'avatar')
      .addIf('active', true) // {!} TD - Set this using timestamp
    
    return (
      <Button
        accent="data"
        className={peerClass.getClasses()}
        type="mock"
      >{initial}</Button>
    )
  }
}

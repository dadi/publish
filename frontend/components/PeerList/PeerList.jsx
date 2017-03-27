'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './PeerList.css'

import PeerItem from 'components/PeerItem/PeerItem'

export default class PeerList extends Component {

  static propTypes = {
    
    /**
     * The array of socket peers.
     */
    peers: proptypes.object
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {peers} = this.props

    if (!peers || !peers.length) return null

    return (
      <div class={styles.container}>
        {peers.map(peer => (
          <PeerItem peer={peer} />
        ))}
      </div>
    )
  }
}

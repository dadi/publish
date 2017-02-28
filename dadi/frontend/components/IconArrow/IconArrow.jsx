import { h, Component } from 'preact'

import styles from './IconArrow.css'

const DIRECTIONS = [
  'left',
  'right',
  'down'
]

export default class IconArrow extends Component {
  render () {
    let classes = [styles.icon]

    if (this.props.direction && DIRECTIONS.includes(this.props.direction)) {
      classes.push(styles[this.props.direction])
    }

    return (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36.9 20.8' class={classes.join(' ')}>
        <g>
          <path d='M1.1,20.8c-1.1,0-1.4-0.7-0.7-1.5L17.5,0.4c0.5-0.5,1.4-0.5,1.9,0l17.1,18.9c0.7,0.8,0.4,1.5-0.7,1.5H1.1z' />
        </g>
      </svg>
    )
  }
}

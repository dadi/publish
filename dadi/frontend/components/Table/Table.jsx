'use strict'

import { h, Component } from 'preact'

import Style from 'lib/Style'
import styles from './Table.css'

import IconArrow from 'components/IconArrow/IconArrow'

//
// Table
//
export default class Table extends Component {
  static defaultProps = {
    fillBlanks: true,
    selectable: true
  }

  groupChildren() {
    let head = []
    let body = []
    
    this.props.children.forEach(child => {
      child.attributes = Object.assign({}, child.attributes, this.props)

      if (child.nodeName.name === 'TableHead') {
        head.push(child)
      } else {
        body.push(child)
      }
    })

    return {
      head,
      body
    }
  }

  render() {
    let children = this.groupChildren()

    return (
      <table class={styles.table}>
        {children.head}

        <tbody>
          {children.body}
        </tbody>
      </table>
    )
  }
}

//
// Table row
//
class TableRow extends Component {
  renderChildren() {
    return this.props.children.map(child => {
      child.attributes = child.attributes || {}
      child.attributes.fillBlanks = child.attributes.fillBlanks || this.props.fillBlanks

      return child
    })
  }

  render() {
    let select = this.props.selectable ?
      <TableRowCell><input class={styles.select} type="checkbox" /></TableRowCell>
      : null


    return (
      <tr class={styles.row}>
        {select}
        {this.renderChildren()}
      </tr>
    )
  }
}

//
// Table row cell
//
class TableRowCell extends Component {
  render() {
    let children = this.props.children
    
    if (!children.length && this.props.fillBlanks) {
      children = <span class={styles['row-cell-blank']}>None</span>
    }

    return (
      <td class={styles['row-cell']}>
        {children}
      </td>
    )
  }
}

//
// Table head
//
class TableHead extends Component {
  render() {
    let select = this.props.selectable ?
      <TableHeadCell><input class={styles.select} type="checkbox" /></TableHeadCell>
      : null

    return (
      <thead class={styles.head}>
        {select}
        {this.props.children}
      </thead>
    )
  }
}

//
// Table head cell
//
class TableHeadCell extends Component {
  static defaultProps = {
    arrow: null,
    link: null
  }

  render() {
    return (
      <th class={styles['head-cell']}>
        {this.props.arrow && ['up', 'down'].includes(this.props.arrow) &&
          <IconArrow
            class={styles['head-cell-arrow']}
            width="10"
            height="10"
            direction={this.props.arrow}
          />
        }

        <span class={styles['head-cell-label']}>
          {this.props.children}
        </span>
      </th>
    )
  }
}

export {
  TableHead,
  TableHeadCell,
  TableRow, 
  TableRowCell
}

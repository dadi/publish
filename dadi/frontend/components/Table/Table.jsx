'use strict'

import { h, Component } from 'preact'

import Style from 'lib/Style'
import styles from './Table.css'

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
      child.attributes = child.attributes || {}
      child.attributes.fillBlanks = child.attributes.fillBlanks || this.props.fillBlanks
      child.attributes.selectable = child.attributes.selectable || this.props.selectable

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
      <tr class={styles.row} {...this.props}>
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
      <thead class={styles.head} {...this.props}>
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
  render() {
    return (
      <th class={styles['head-cell']}>
        {this.props.children}
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

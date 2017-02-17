import { h, Component } from 'preact'

export default class CollectionNav extends Component {

  render() {
    const { collections } = this.props
    return (
      <div class="CollectionNav">
        <h3>Collections</h3>
        {collections ? (
          <ul class="CollectionList">
            {collections.map(collection => (
              <li class="CollectionListItem">
                <a href={ `/${collection.slug}/documents` }>{ collection.name }</a>
              </li>
            ))}
          </ul>
        ) : (
          <h1 />
        )}
      </div>
    )
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { collections } = this.props
    if (collections === nextProps.collections) {
      return false
    }
  }
}

 

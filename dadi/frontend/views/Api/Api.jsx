import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'

/*
* Actions
 */
import * as apiActions from 'actions/apiActions'

/*
* Components
 */
import Main from 'components/Main/Main'
import Nav from 'components/Nav/Nav'

class Api extends Component {

  render({ api }, { authenticate }) {
    const { state } = this.props
    return (
      <Main>
        <Nav apis={ state.apis } />
        {state.apis.map(api => (
          <li>
            <h2>{api.database}</h2>
            <p>host: {api.host}</p>
            {api.collections ? (
              <div>
                <h2>Collections</h2>
                <ul>
                  {api.collections.map(collection => (
                    <li>
                      <h2>{collection.name}</h2>
                      <p>Path: {collection.path}</p>
                      {collection.fields ? (
                        <div>
                          <h2>Fields</h2>
                          <ul>
                            {Object.keys(collection.fields).map(field => (
                              <li>
                                <h3>{collection.fields[field].label}</h3>
                                <p>{collection.fields[field].type}</p>
                                <p>{field}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <h1 />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <h1 />
            )}
          </li>
        ))}
        {api ? (
          <h1>Current API is {api}</h1>
        ) : (
          <h1 />
        )}
      </Main>
    )
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(Api)
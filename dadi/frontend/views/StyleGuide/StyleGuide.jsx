import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as userActions from '../../actions/userActions'

import Main from '../../components/Main/Main'
import Card from '../../components/Card/Card'
import CardGroup from '../../components/CardGroup/CardGroup'
import Select from '../../components/Select/Select'
import SubmitButton from '../../components/SubmitButton/SubmitButton'
import TextInput from '../../components/TextInput/TextInput'

class StyleGuide extends Component {
  constructor(props) {
    super(props)
    this.initialise()
  }

  initialise() {
    this.selectOptions = [
      'apple', 'orange', 'banana', 'lemon', 'lime',
      'grapes', 'raspberries', 'blueberries', 'kiwi',
      'plumb', 'dragonfruit', 'pineapple', 'coconut'
    ]
  }

  render() {
    return (
      <div>
        <CardGroup>
          <Card>
            <h2>TextInput</h2>
            <TextInput />
          </Card>
          <Card>
            <h2>SubmitButton</h2>
            <SubmitButton />
          </Card>
        </CardGroup>

        <CardGroup>
          <Card>
            <h2>Select (searchable, with options)</h2>
            <Select
                searchable={true}
                options={this.selectOptions} />
          </Card>
          <Card>
            <h2>Select (searchable, with options, limit 3)</h2>
            <Select
                limit={3}
                searchable={true}
                options={this.selectOptions} />
          </Card>
        </CardGroup>

        <CardGroup>
          <Card>
            <h2>Select (not searchable, with options)</h2>
            <Select
                searchable={false}
                options={this.selectOptions} />
          </Card>
          <Card>
            <h2>Select (not searchable, with options, limit 3)</h2>
            <Select
                limit={3}
                searchable={false}
                options={this.selectOptions} />
          </Card>
        </CardGroup>

      </div>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators(userActions, dispatch)
)(StyleGuide)

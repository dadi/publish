// import { h, Component } from 'preact'
// import { connect } from 'preact-redux'
// import { bindActionCreators } from 'redux'
// import { connectHelper } from 'lib/util'

// import Main from 'components/Main/Main'
// import Select from 'components/Select/Select'
// import SubmitButton from 'components/SubmitButton/SubmitButton'
// import TextInput from 'components/TextInput/TextInput'

// class StyleGuide extends Component {
//   constructor(props) {
//     super(props)
//     this.initialise()
//   }

//   initialise() {
//     this.selectOptions = [
//       'apple', 'orange', 'banana', 'lemon', 'lime',
//       'grapes', 'raspberries', 'blueberries', 'kiwi',
//       'plumb', 'dragonfruit', 'pineapple', 'coconut'
//     ]
//   }

//   render() {
//     return (
//       <div>
//         <h2>TextInput</h2>
//         <TextInput />
//         <h2>SubmitButton</h2>
//         <SubmitButton />
//         <h2>Select (searchable, with options)</h2>
//         <Select
//           searchable={true}
//           options={this.selectOptions} />
//         <h2>Select (searchable, with options, limit 3)</h2>
//         <Select
//           limit={3}
//           searchable={true}
//           options={this.selectOptions} />
//         <h2>Select (not searchable, with options)</h2>
//         <Select
//           searchable={false}
//           options={this.selectOptions} />
//         <h2>Select (not searchable, with options, limit 3)</h2>
//         <Select
//           limit={3}
//           searchable={false}
//           options={this.selectOptions} />
//       </div>
//     )
//   }
// }

// export default connectHelper(
//   dispatch => bindActionCreators({}, dispatch)
// )(StyleGuide)

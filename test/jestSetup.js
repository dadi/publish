import chai from 'chai'
import assertJsx, {options} from 'preact-jsx-chai'
import assertMatch from 'preact-jsx-chai-match'

// when checking VDOM assertions, don't compare functions,
// just nodes and attributes
options.functions = false

// activate the JSX assertion extension
chai.use(assertJsx)

chai.use(assertMatch)
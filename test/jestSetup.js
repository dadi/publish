import chai from 'chai'
import assertJsx, {options} from 'preact-jsx-chai'
import assertMatchTemplate from 'preact-jsx-chai-match-template'

// when checking VDOM assertions, don't compare functions,
// just nodes and attributes
options.functions = false

// activate the JSX assertion extension
chai.use(assertJsx)

chai.use(assertMatchTemplate)
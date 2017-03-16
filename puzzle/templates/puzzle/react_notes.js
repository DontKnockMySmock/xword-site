// to create a component:
class CompName extends React.Component {
    render() {
        return (<div></div>)
    }
}

// initialize the state with:
constructor() {
    super();
    this.state = {/* initial state here */}
}

// to create a component with a certain property:
<Subcomponent value={whatever} />

// to access a components property within the component's render function:
<div>{this.props.value}</div>

// the {} notation is used within the react element

// to make the component interactive:
<button className="square" onClick={() => alert('click')}>

// if a component needs to know the state of the subcomponent, it's best to store that information in the supercomponent
// and then give that information to the subcomponent.  "Move the state upwards so that it lives in the parent component"

// to render a react component to html:
ReactDOM.render(<ComponentName />, document.getElementById('container_id'));

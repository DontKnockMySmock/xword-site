class CrosswordBuilder extends React.Component {
    constructor() {
        super();
        this.state = {
            title: '',
            notes: '',
            exclude_words: '',
            template_info: {
                size: 15,
                word_lengths: '',
                max_length: 10
            }
        }
    }
    render() {
        return (
            <div>
                <Title onChange={(val) => this.setState({title:val})} title_val={this.state.title}/>
                <Notes onChange={(val) => this.setState({notes:val})} notes_val={this.state.notes}/>
                <ExcludeWords onChange={(val) => this.setState({exclude_words:val})} exclude_words={this.state.exclude_words}/>
                <TemplateSpecs
                    onChange={(event) => this.inputChangeHandler(event)}
                    temp_specs={this.state.template_info}
                />
            </div>
        )
    }
    inputChangeHandler(event) {
        var temp_info = this.state.template_info;
        temp_info[event.target.id] = event.target.value;
        this.setState({template_info: temp_info});
    }
    randomTemplate() {
        $.ajax({
            url: 'random_template',
            data: this.state.template_info,
            type: 'GET',
            success: function(result) {
                console.log(result);
            }
        })
    }
}

class TemplateSpecs extends React.Component {
    render() {
        return (
            <div>
                <input id="size"
                    type="number"
                    defaultValue={this.props.temp_specs.size}
                    onChange={(event)=>this.props.onChange(event)}
                /><br/>
                <input id="word_lengths"
                    type="text"
                    defaultValue={this.props.temp_specs.word_lengths}
                    onChange={(event)=>this.props.onChange(event)}
                /><br/>
                <input id="max_length"
                    type="number"
                    defaultValue={this.props.temp_specs.max_length}
                    onChange={(event)=>this.props.onChange(event)}
                />
            </div>
        )
    }
}

class Title extends React.Component {
    render() {
        return (
            <input
               type="text" placeholder="Title"
               defaultValue={this.props.title_val}
               onChange={(event) => this.props.onChange(event.target.value)}
            />
        )
    }
}

class Notes extends React.Component {
    render() {
        return (
            <textarea
               type="text" placeholder="Input notes here"
               defaultValue={this.props.notes_val}
               onChange={(event) => this.props.onChange(event.target.value)}
            />
        )
    }
}

class ExcludeWords extends React.Component {
    render() {
        return (
            <textarea
               type="text" placeholder="List words to exclude"
               defaultValue={this.props.exclude_words}
               onChange={(event) => this.props.onChange(event.target.value)}
            />
        )
    }
}

class Grid extends React.Component {
    render() {
        return (<div></div>)
    }
}

class Cell extends React.Component {
    render() {
        return (
            <div></div>
        )
    }
}


ReactDOM.render(<CrosswordBuilder />, document.getElementById('crossword_builder'));

var grid_width = 600;

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
            },
            template: '',
            cmd_text: 'Fill out grid',
            cmd_action: this.getGridSolution,
            highlightedWord: '',
            currentSelectedWord: '',
            clues: {},
            completing: false,
            selected_cell: '',
        };
        this.randomTemplate();
    }
    render() {
        return (
            <div
                tabIndex="1"
                onKeyPress={(e) => console.log(e.which)}
            >
                <Title onChange={(val) => this.setState({title:val})} title_val={this.state.title}/>
                <Notes onChange={(val) => this.setState({notes:val})} notes_val={this.state.notes}/>
                <ExcludeWords onChange={(val) => this.setState({exclude_words:val})} exclude_words={this.state.exclude_words}/>
                <TemplateSpecs
                    onChange={(event) => this.eventChangeHandler(event)}
                    temp_specs={this.state.template_info}
                    rand_temp_action={() => this.randomTemplate()}
                />
                <table>
                    <tr>
                        <td>
                            <Grid
                                highlightedWord={this.state.highlightedWord} template={this.state.template}
                                toggleBlackCells={(e, cells) => this.toggleBlackCells(e, cells)}
                                selected_cell={this.state.selected_cell}
                                onCellClick={(x,y) => this.setState({selected_cell: ''+x+','+y})}
                            />
                        </td>
                        <td>
                            <CurrentWords onChange={(word, cells) => this.highlightWord(word, cells)} words={this.getCurrentWords()} />
                        </td>
                        <td>
                            <WordInfo word={this.state.currentSelectedWord}/>
                        </td>
                        <td>
                            <Clues
                                selWord={this.state.currentSelectedWord+this.state.highlightedWord}
                                defValue={this.getCurrentClue()}
                                onChange={(key, newClue) => this.setClue(key, newClue)}
                                nextClue={() => this.nextClue()}
                            />
                        </td>
                    </tr>
                </table>
                <ActionButton onClick={() => this.state.cmd_action(this)} text={this.state.cmd_text} />
                <ActionButton text='Publish' onClick={() => this.publish()} />
                <ActionButton text='Kill process' onClick={() => this.setState({completing: false})} />
            </div>
        )
    }
    getGridSolution(self) {
        self.setState({completing: true})
        var client = new XMLHttpRequest();
        var len = self.state.template_info.size*self.state.template_info.size;
        client.onprogress = function(){
            self.fillInGrid(this.responseText.substring(this.responseText.length-len, this.responseText.length));
            if (!self.state.completing) client.abort()
        }
        client.open('get', 'fill_out_grid?template='+self.state.template+'&exclude_words='+self.state.exclude_words);
        client.send();
    }
    nextClue() {
        var words = this.getCurrentWords();
        for(var i=0;i<words.length;i++) {
            if (words[i].word == this.state.currentSelectedWord && words[i].cells == this.state.highlightedWord) {break;}
        }
        if(i+1==words.length) {i=-1}
        var nextWord = words[i+1]
        $('#word_list').val(nextWord.cells).change();
        this.setState({currentSelectedWord: nextWord.word, highlightedWord: nextWord.cells})
    }
    toggleBlackCells(e, cells) {
        e.preventDefault();
        var cellArr = cells.split('-');
        var newTemp = this.state.template;
        for (var i=0;i<cellArr.length;i++) {
            var x=cellArr[i].split(',')[0];
            var y=cellArr[i].split(',')[1];
            var index = parseInt(x)*this.state.template_info.size+parseInt(y)
            var val = newTemp[index];
            newTemp = newTemp.substr(0, index) + (val==' ' ? '*' : ' ') + newTemp.substr(index + 1);
        }
        this.setState({template: newTemp})
    }
    publish() {
        $.ajax({
            url: 'publish',
            data: {
                title: this.state.title,
                template: this.state.template,
                clues: JSON.stringify(this.state.clues)
            },
            success(result) {
                window.location.href = window.location.href.replace('builder/',result)
            }
        })
    }
    getCurrentClue() {
        if(this.state.currentSelectedWord == '') return '';
        var key = this.state.currentSelectedWord+this.state.highlightedWord;
        if (!key in this.state.clues) return '';
        return this.state.clues[key];
    }
    setClue(key, newClue) {
        var stateClue = this.state.clues;
        stateClue[key] = newClue;
        this.setState({clues: stateClue});
    }
    highlightWord(word, cells) {
        this.setState({highlightedWord: cells, currentSelectedWord: word});
    }
    getCurrentWords() {
        var allWords = [];
        var remHighlight = true;
        //across
        for (var i=0;i<this.state.template_info.size;i++) {
            var line = this.state.template.substring(i*this.state.template_info.size, (i+1)*this.state.template_info.size);
            var words = line.split(' ');
            for (var w=0;w<words.length;w++) {
                if (words[w].indexOf('*')==-1 && words[w].length > 0) {
                    var cells = [];
                    for (var j=0;j<words[w].length;j++) {cells.push(''+i+','+(line.indexOf(words[w])+j))}
                    allWords.push({word: words[w], cells: cells.join('-')})
                    if (this.state.currentSelectedWord == words[w] && this.state.highlightedWord == cells.join('-')) {
                        remHighlight=false;
                    }
                }
            }
        }
        //down
        for (var i=0;i<this.state.template_info.size;i++) {
            var line = '';
            for (var j=0;j<this.state.template_info.size;j++) {
                line += this.state.template[i+j*this.state.template_info.size];
            }
            var words = line.split(' ');
            for (var w=0;w<words.length;w++) {
                if (words[w].indexOf('*')==-1 && words[w].length > 0) {
                    var cells = [];
                    for (var j=0;j<words[w].length;j++) {cells.push(''+(line.indexOf(words[w])+j)+','+i)}
                    allWords.push({word: words[w], cells: cells.join('-')})
                    if (this.state.currentSelectedWord == words[w] && this.state.highlightedWord == cells.join('-')) {
                        remHighlight=false;
                    }
                }
            }
        }
        if (remHighlight && this.state.currentSelectedWord!='' && this.state.highlightedWord!='') {this.highlightWord('','')}
        allWords.sort(function(a,b){return (a.word>b.word ? 1 : -1)});
        return allWords;
    }
    fillInGrid(template) {this.setState({template: template});}
    eventChangeHandler(event) {
        var temp_info = this.state.template_info;
        temp_info[event.target.id] = event.target.value;
        this.setState({template_info: temp_info});
    }
    randomTemplate() {
        var self = this;
        $.ajax({
            url: 'random_template',
            data: this.state.template_info,
            type: 'GET',
            success: function(result) {
                if(result!='None') {
                    self.setState({template: result})
                } else {
                    console.log('Couldn\'t find matching template')
                }
            }
        })
    }
}

class ActionButton extends React.Component {
    render() {
        return (
            <button onClick={() => this.props.onClick()}>
                {this.props.text}
            </button>
        )
    }
}

class Clues extends React.Component {
    render() {
        return (
            <textarea
                placeholder="Enter clue here"
                style={{
                    height: grid_width,
                }}
                onChange={(event) => this.props.onChange(this.props.selWord, event.target.value)}
                value = {this.props.defValue==null ? '' : this.props.defValue}
                onKeyPress={(event) => this.onKeyPress(event)}
            />
        )
    }
    onKeyPress(event) {
        if (event.key == 'Enter') {
            event.preventDefault();
            this.props.nextClue();
        }
    }
}

class WordInfo extends React.Component {
    render() {
        return (
             <iframe style={{
                height: grid_width,
             }} src={'/puzzle/builder/word_info?word='+this.props.word}></iframe>
        )
    }
}

class CurrentWords extends React.Component {
    render() {
        return (
            <select id='word_list'
                size='100'
                style={{height:grid_width}}
                onChange={(event) => this.props.onChange(event.target.options[event.target.selectedIndex].text, event.target.value)}
            >
                {this.props.words.map((wordInfo) =>
                    <option key={wordInfo.cells} word={wordInfo.word} value={wordInfo.cells}>{wordInfo.word}</option>
                )}
            </select>
        )
    }
}

class Grid extends React.Component {
    constructor() {
        super();
        this.state = {
            hover: ''
        }
    }
    render() {
        var highlightedCells = this.props.highlightedWord.split('-');
        var rowJSX = [];
        var size = Math.sqrt(this.props.template.length);
        for (var i=0;i<size;i++) {
            var cellJSX = [];
            for (var j=0;j<size;j++) {
                cellJSX.push(
                    <Cell
                        grid_size={size}
                        key={''+i+','+j}
                        x={i} y={j}
                        val={this.props.template[i*size+j]}
                        highlighted = {highlightedCells.indexOf(''+i+','+j)>-1}
                        selected = {this.props.selected_cell}
                        onhover = {(x,y) => this.setHover(x,y)}
                        onMouseOut = {() => this.setState({hover: ''})}
                        toHover = {this.state.hover.split('-')}
                        onrightclick = {(e, x, y) => this.props.toggleBlackCells(e, this.state.hover)}
                        onCellClick = {(x,y) => this.props.onCellClick(x,y)}
                    />
                )
            };
            rowJSX.push(
                <div key={i}>
                    {cellJSX}<br/>
                </div>
            )
        }
        return (
            <div
                style={{
                    width:''+grid_width+'px',
                    height:''+grid_width+'px'
                }}
            >
                {rowJSX}
            </div>
        )
    }
    setHover(x,y) {
        var size = Math.sqrt(this.props.template.length);
        var hover = ''+x+','+y;
        var opposite = ''+(size-x-1)+','+(size-y-1);
        if(hover!=opposite) {hover += '-'+opposite;}
        this.setState({hover: hover})
    }
}

class Cell extends React.Component {
    shouldComponentUpdate(nextProps) {
        if(''+this.props.x+','+this.props.y == this.props.selected ||
           ''+this.props.x+','+this.props.y == nextProps.selected) {
            return true
        }
        if(this.props.highlighted || nextProps.highlighted) {return true}
        if(this.props.toHover.indexOf(''+this.props.x+','+this.props.y)!=-1 ||
            nextProps.toHover.indexOf(''+this.props.x+','+this.props.y)!=-1) {
                return true
        }
        if(this.props.val != nextProps.val) {return true}
        return false;
    }
    render() {
        var cell_size = grid_width / this.props.grid_size - 2;
        return (
            <div
                style={{
                    width: ''+cell_size+'px',
                    height: ''+cell_size+'px',
                    border: '1px solid',
                    float:'left',
                    background: this.background(),
                    position: 'static',
                    textAlign: 'center',
                    fontSize: ''+(cell_size*.7)+'px',
                    color: (this.props.val==this.props.val.toUpperCase() ? 'black' : 'grey')
                }}
                onMouseOver={() => this.props.onhover(this.props.x, this.props.y)}
                onMouseOut={() => this.props.onMouseOut()}
                onClick={() => this.onClick()}
                onContextMenu={(e) => this.props.onrightclick(e, this.props.x, this.props.y)}
            >
                {this.props.val == '*' ? ' ' : this.props.val.toUpperCase()}
            </div>
        )
    }
    onClick() {
        if(this.props.val != ' ') {
            this.props.onCellClick(this.props.x, this.props.y)
        }
    }
    background() {
        if(''+this.props.x+','+this.props.y == this.props.selected) {return '#e6e600'} // dark yellow
        if(this.props.toHover.indexOf(''+this.props.x+','+this.props.y) != -1) {
            if(this.props.val == ' ') {return '#595959'}
            return '#a6a6a6'
        }
        if(this.props.val == ' ') {return 'black'}
        if(this.props.highlighted) {return '#66ffff'} // light blue
        return 'white'
    }
}

class TemplateSpecs extends React.Component {
    render() {
        return (
            <div>
                <button onClick={() => this.props.rand_temp_action()}>
                    Random template
                </button><br/>
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


ReactDOM.render(<CrosswordBuilder />, document.getElementById('crossword_builder'));

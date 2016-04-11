// main.js

////////////////////////////////////////////////////////////////////////////////////
// Dummy data for testing
//
////////////////////////////////////////////////////////////////////////////////////
var data = {
  paragraphs: [
    { id: 1, 
      speaker: "Bill O'Reilly", 
      text: ["I","have","opinions","."],
      concepts:[
        {i:2,j:3,label:"opinions",s:"0"},
      ]
    },
    { id: 2, 
      speaker: "Jordan Walke",
      text: ["I","have", "much", "better", "opinions", "and", "a", "life","."],
      concepts:[
        {i:2,j:5,label:"opinions",s:"+"},
        {i:7,j:8,label:"life",s:"-"},
      ]
    }
   ],
   title:"Look ma, I'm a title",
}

// highlight ------------------------------------------------------------------------
// returns the css class for concept
// tbd whether this is the best way yet
function highlight(concept) {
  var the_map = {
    opinions:"chartreuse",
    life:"yellow",
  }
  return the_map[concept]
}

// Words ---------------------------------------------------------------
// Render all the words with concepts highlighted
var Words = React.createClass({
  render: function() {
    var text = this.props.text
    var concepts = this.props.concepts
    
    var out = []
    var temp = []
    var s = 0
    var e = text.length

    concepts.forEach(function(c,i,arr){
      var before = {text:text.slice(s,c['i']),concept:"none",sentiment:"none"}
      if (before['text'].length > 0) {
        out.push(before)
      }
      var slice = {text:text.slice(c['i'],c['j']),concept:c['label'],sentiment:c['s']}
      out.push(slice)
      s = c['j']
    });
    var end = {text:text.slice(s,e),concept:"none",sentiment:"none"}
    out.push(end)
    
    var spacer = function(text) {
        return text.map(function(t){
          if (t == "," || t == ".") {
            return t
          }
          else {
            return " " + t
          }
        })
    }

    var ret = out.map(function(s){
      return (<span className={highlight(s['concept'])} data-sentiment={s['sentiment']} key={s['text']}>{spacer(s['text'])}</span>)
    })

    return (<span>{ret}</span>)
  }

  });

// Paragraph ------------------------------------------------------------
// Render a single paragraph
var Paragraph = React.createClass({
  render: function() {
    return (
      <div className="paragraph">
        <p><strong>{this.props.speaker}: </strong><Words text={this.props.text} concepts={this.props.concepts}/></p>
      </div>
    );
  }
});

// Paragraphs -----------------------------------------------------------
// Render all paragraphs
var Paragraphs = React.createClass({
  render: function() {
    var paragraphs = this.props.paragraphs.map(function(paragraph) {
      return (
        <Paragraph 
          speaker  = {paragraph['speaker']} 
          text     = {paragraph['text']} 
          concepts = {paragraph['concepts']}
          key      = {paragraph['id']} />
      );
    });
    return (
      <div className="paragraphList">
        {paragraphs}
      </div>
    );
  }
});

// Story ---------------------------------------------------------------
// Render a whole story
var Story = React.createClass({
  render: function() {
    return (
      <div className="story">
        <h1 className="title">{this.props.data['title']}</h1>
        <Paragraphs paragraphs={this.props.data['paragraphs']}/>
      </div>
    )
  }
});


class CountMap {
  constructor() {
    this.map = new Map()
  }
  add(i,n) {
    if (this.map.has(i)) {
      this.map.set(i,this.map.get(i) + n)
    }
    else {
      this.map.set(i,n)
    }
    return [i,this.map.get(i)]
  }
  get(i) {
    return this.map.get(i)
  }
  keys() {
    return this.map.keys()
  }
  keyvals() {
    return Array.from(this.map.entries());
  }
};

var Bar = React.createClass({
  render: function() {
    var sentimap = {
      "+":"positive",
      "-":"negative",
      "0":"neutral"
    }
    return (<div className={sentimap[this.props.data]}></div>)
  }
})

var BarGraph = React.createClass({
  render: function() {
    var concept = this.props.concept
    var count = 0
    var barmap = this.props.data.split("").map(function(s){
      count++//needed for unique keys
      return(<Bar key={concept+count} data={s} />)
    })
    return (<div className="graph">{barmap}</div>)
  }
});

var Visualizer = React.createClass({
  render: function() {
    
      var concept_set = new CountMap()
      var concept_vis = new CountMap()
      this.props.data['paragraphs'].forEach(function(p){
        p['concepts'].forEach(function(c) {
          concept_set.add(c['label'],1)
          console.log(concept_vis.add(c['label'],c['s']))
        });
      });

    var pairs = concept_set.keyvals().map(function([k,v]){
      var vis = concept_vis.get(k)
      console.log(vis)
      return(<div key={k} className="concept">
              <div className="concept_text">
                <strong>{k}</strong> : {v}
              </div>
              <BarGraph concept={k} data={vis} />
             </div>
      )
    })

    return (
      <div className="sentiments">
        {pairs}
      </div>
    )
  },
});

// Main function
ReactDOM.render(
  <div>
    <Visualizer data={data}/>
    <Story data={data}/>
  </div>,
  document.getElementById('content')
);
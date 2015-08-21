var React = require('react');
var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

// cowboy in my previous jQuery
var scripts = require('./scripts')();
var data = require('./data');

const _ = {
  findWhere : require('lodash/collection/findWhere'),
  findIndex : require('lodash/array/findIndex')
}
 
/*
  Videos Component for displaying a list of all videos
*/
var Videos = React.createClass({
  render : function() {
    return (
      <div className="videos">
        {this.props.videos.map(function(vid, i){
          return <Video vid={vid} i={i} key={i}/>
        })}
      </div>
    )
  }
});


/*
  Listed Video Component
*/
var Video = React.createClass({
  updateHash : function(e) {
    e.preventDefault();
    // check if they have "authenticated"
    if(!!localStorage.hash) {
      window.location.hash = "#/view/" + this.props.vid.id;
      $("html, body").animate({ scrollTop: $('#watch').position().top });
    } else  {
      $("html, body").animate({ scrollTop: $('.signup').position().top }, 1000);
      $('input[name=email]').focus();
      $('p.underline').text('Looks like you aren\'t logged in. Lost your link? Enter your email again and I\'ll re-send the link.').show();
    }
  },
  render : function() {
    var video = this.props.vid;
    return (
      <div className="video">
        <span className="video-number">{this.props.i +  1}</span>
         <a onClick={this.updateHash}>
           <img width="100" height="56.25" src={"https://img.youtube.com/vi/" + video.id + "/mqdefault.jpg"} alt={video.description} />
            <h2>
              {video.title}
              <span className="duration">{video.duration}</span>
            </h2>
           <p className="description">{video.description}</p>
          </a>
      </div>
    )
  }
});

/*
  Viewer Component
*/

var Viewer = React.createClass({
  mixins : [Router.State, Router.Navigation],
  getInitialState: function() {
    var params = this.getParams();
    return {
       videos : data.videos,
       video : data.videos[0],
       videoid : params.videoid || data.videos[0].id
    }
  },
  // This gets called right before render - we use it to set some state
  componentWillMount : function() {
    console.log("viewer updating..");
  },
  goToVideo : function(videoid, e) {
    e.preventDefault();
    this.transitionTo('viewer', {videoid: videoid});
    this.setState({videoid : videoid});
  },
  renderNavButtons : function() {
    var params = this.getParams();
    var videoid = this.state.videoid;
    var index = _.findIndex(this.state.videos,{id : this.state.videoid});
    
    var prevVideo = this.state.videos[index - 1];
    var prevButton = (prevVideo ? <a onClick={this.goToVideo.bind(null,prevVideo.id)} href={`#/view/${prevVideo.id}`}>← {prevVideo.title}</a> : '');
    
    var nextVideo = this.state.videos[index + 1];
    var nextButton = (nextVideo ? <a onClick={this.goToVideo.bind(null,nextVideo.id)} href={`#/view/${nextVideo.id}`}>{nextVideo.title} → </a> : '');

    return (
      <nav className="prev-and-next">
        {prevButton}
        {nextButton}
      </nav>
    )
  },
  render : function() {
    var params = this.getParams();
    var videoid = this.state.videoid;
    
    var video = _.findWhere(this.state.videos,{id : videoid});
    
    var autoplay = (videoid === this.state.videos[0].id ? 0 : 1);

    // var video = (this.state.videos.filter(function(video) {
    //   if(video.id === videoid) {
    //     return video;
    //   }
    // }))[0];

    return (
      <div className="viewer">
        <Player videoid={videoid} autoplay={autoplay}/>
        <div className="video-details">
          <h2>Now Playing: {video.title} - {video.number} of 20</h2>
          <p>{video.description}</p>
          {this.renderNavButtons()}
        </div>
        <Videos videos={this.state.videos} />
      </div>

    )
  }
});

/*
  Video Player
*/

var Player = React.createClass({
  generateURL : function() {
    // sorry about the whistling
    return `https://www.youtube.com/embed/${this.props.videoid}?autoplay=${this.props.autoplay}&showinfo=0&rel=0&start=9`;
  },
  render : function() {
    return (
      <div className="scaler">
        <iframe width="560" height="315" src={this.generateURL()} frameBorder="0" allowFullScreen></iframe>
      </div>
    )
  } 
});

/*
  Authentication
*/

var Auth = React.createClass({
  mixins : [Router.State, Router.Navigation],
  getInitialState : function() {
    return {
      videos : data.videos
    }
  },
  render : function() {
    var params = this.getParams();
    localStorage.hash = params.hash;
    this.transitionTo('viewer', {videoid: this.state.videos[0].id});
    return <div></div>
  }
});


/*
  The main "wrapper" of the app
  RouteHandler will be replaced with a component 
*/ 

var Main = React.createClass({
   mixins : [Router.State],
   render : function() {
    var params = this.getParams();
    // we pass a key here so that the router will trigger a render when we change from /view/1 to /view/2
    return (
      <div>
        <RouteHandler key={params.videoid} />
      </div>
    )
   }
});


/*
  Router
*/

var routes = (
  <Route name="app" path="/" handler={Main} ignoreScrollBehavior={true}>
    <Route name="auth" path="auth/:hash" handler={Auth} />
    <Route name="viewer" path="view/:videoid" handler={Viewer} />
    <Route name="video" path="videos" handler={Videos} />
    <DefaultRoute handler={Viewer} />
  </Route>
)

Router.run(routes,function(Root){
  React.render(<Root />, document.getElementById('watch'));
});

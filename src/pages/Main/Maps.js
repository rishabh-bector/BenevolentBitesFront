import React from "react";
import ReactDOM from "react-dom";
import { GoogleApiWrapper, InfoWindow, Map, Marker } from "google-maps-react";
import { withStyles } from "@material-ui/core/styles";
import RestaurantCard from "./RestaurantCard";
import { Memoized } from "../common";

const styles = (theme) => ({
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    marginRight: theme.spacing(0.5),
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  card: {
    borderRadius: "10px",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
});

class InfoWindowEx extends React.Component {
  constructor(props) {
    super(props);
    this.infoWindowRef = React.createRef();
    this.contentElement = document.createElement("div");
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      ReactDOM.render(
        React.Children.only(this.props.children),
        this.contentElement
      );
      this.infoWindowRef.current.infowindow.setContent(this.contentElement);
    }
  }

  render() {
    return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
  }
}

class GoogleMapsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      place: {},
    };
    // binding this to event-handler functions
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
  }

  onMarkerClick = (props, marker, e) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      place: props.place,
      showingInfoWindow: true,
    });
  };

  onMapClick = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };

  onExpandClick(expanded) {
    this.setState({ expanded: !expanded });
  }

  componentDidMount() {
    document.querySelector("#main > div:first-child").style =
      "height:100%; z-index:-1";
  }

  render() {
    const style = {
      width: "100%",
      height: "100%",
      marginLeft: "auto",
      marginRight: "auto",
    };
    const containerStyle = {
      width: "100%",
      height: "100%",
      position: "relative",
    };
    const mapObj = (
      <Map
        style={style}
        containerStyle={containerStyle}
        google={this.props.google}
        onClick={this.onMapClick}
        zoom={Object.keys(this.props.location || {}).length === 0 ? 4 : 16}
        onIdle={(_, map) => this.props.mapSearch(map)}
        onReady={() => this.setState({ needsUpdate: true })}
        center={this.props.location || {}}
        initialCenter={this.props.location || {
          lat: 30.27379,
          lng: -97.80073,
        }}
      >
        {this.props.list.map((place) => (
          <Memoized
            component={Marker}
            shouldUpdate={(np) => {
              if (this.state.needsUpdate || np.place.restID !== place.restID)
                return true;
              else return false;
            }}
            position={{ lat: place.latitude, lng: place.longitude }}
            name={place.title}
            title={place.title}
            onClick={this.onMarkerClick}
            list={this.props.list}
            place={place}
            icon={
              place.on
                ? null
                : {
                    url: process.env.PUBLIC_URL + "/img/greymarker.png",
                    scaledSize: new this.props.google.maps.Size(25, 40),
                  }
            }
          />
        ))}
        <InfoWindowEx
          marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}
          onClose={() => this.setState({ showingInfoWindow: false })}
        >
          {Object.keys(this.state.place).length > 0 && (
            <RestaurantCard
              map
              signedIn={this.props.signedIn}
              data={this.state.place}
              supported={this.state.place.on}
              classes={this.props.classes}
            />
          )}
        </InfoWindowEx>
      </Map>
    );
    if (this.state.needsUpdate) this.setState({ needsUpdate: false });
    return mapObj;
  }
}

export default withStyles(styles)(
  GoogleApiWrapper({
    apiKey: process.env.REACT_APP_GOOGLE_API,
  })(GoogleMapsContainer)
);

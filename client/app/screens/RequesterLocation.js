import React from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';
import MapComponent from 'client/app/components/MapComponent';
import CustomButton from 'client/app/components/CustomButton';
import MapView from 'react-native-maps';


export default class RequesterLocation extends React.Component {
    constructor(props) {
        super(props);
        state = {
            user: null,
            latitude: 34.0635,
            longitude: -118.4455,
            request: null
        };
        this.submitRequest = this.submitRequest.bind(this);
        this._getUserAndRequest = this._getUserAndRequest.bind(this);
    }
	static navigationOptions = {
		
    }
    
    submitRequest(latitude, longitude) {
        this.state.request.latitude = latitude;
        this.state.request.longitude = longitude;
        this.state.user.createRequest(this.state.request).then((responseStatus) => {
            this.props.navigation.navigate("HomeScreen", {user: this.state.user});
        });
    }

    _getUserAndRequest() {
        if (this.props.navigation.state.params) {
            this.setState({
                user: this.props.navigation.state.params.user,
                request: this.props.navigation.state.params.request});
        }
    }

    componentWillMount() {
        this._getUserAndRequest();
    }

	render() {
		// const address = this.props.address;
		const address = 'westwood village 90024'; // TODO: replace this w/ props.address
		const buttonText = 'Confirm Location' // TODO: replace this based on requester/provider
		return (
			<MapComponent address={this.state.request.address} buttonText={buttonText}
                setParentState={newState=>{this.setState(newState)}}
                goTo={this.submitRequest}/>
		);
	}
}


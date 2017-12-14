import React from 'react';
import { ListView, Alert, Text, View, TextInput, Button } from 'react-native';
import styles from 'client/styles/style';
import User from 'client/app/Common/User';
import Request from 'client/app/Common/Request';
import RequestListComponent from 'client/app/components/RequestListComponent';

export default class NearbyRequestsScreen extends React.Component {
    static navigationOptions = {
        title: 'Nearby'
    }
    constructor(props) {
        super(props);
        state = {
            data: [],
            user: null
        };
		this.fetchNearbyRequests = this.fetchNearbyRequests.bind(this);
		this.handleOnNavigateBack = this.handleOnNavigateBack.bind(this);
	}

	handleOnNavigateBack(requestId) {
		if(requestId) {
			let newData = this.state.data;
			let spliceIndex;
			for(let i = 0; i < newData.length; i++) {
				let curRequest = newData[i].request;
				if(curRequest.requestId === requestId) {
					spliceIndex = i;
				}
			}
			newData.splice(spliceIndex, 1);
			this.setState({data: newData});	
		} 
	}

    fetchNearbyRequests() {
        if (this.props.navigation.state.params) {
            this.setState({user: this.props.navigation.state.params.user}, () => {
                this.state.user.getNearbyRequests(this.props.navigation.state.params.latitude,
                    this.props.navigation.state.params.longitude).then(data => {
                        this.setState({ data });
                    });
            });
        }
    }

    componentWillMount() {
        this.fetchNearbyRequests();
    }
	render() {
        if (this.state.data) {
            return (
              <View style={styles.simpleContainer}>
                <RequestListComponent data={this.state.data} user={this.state.user} navigation={this.props.navigation} handleOnNavigateBack={this.handleOnNavigateBack}/>
              </View>
            );
        }
        else {
            return (
            <View>
                <Text>No requests found.</Text>
            </View>
            );
        }
    }
}

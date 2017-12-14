import React from 'react';
import axios from 'axios';
import moment from 'moment';

import { AsyncStorage, Button, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import RequestInfoLine from 'client/app/components/RequestInfoDetails';
import CustomButton from 'client/app/components/CustomButton';
import User from 'client/app/Common/User';

import { getUser } from 'client/app/utils';
import styles from 'client/styles/style';
import config from 'client/config';
import Moment from 'react-moment'; // 0.6.8

export default class RequestDetailsScreen extends React.Component {
	static navigationOptions = {
		title: 'Request Details',
	}

	constructor(props) {
		super(props);

		this.state = {
			userId: '',
			request: {},
		};
		this.getButtons = this.getButtons.bind(this);
		this.accept = this.accept.bind(this);
		this.complete = this.complete.bind(this);
		this.messageRequester = this.messageRequester.bind(this);
	}

	componentWillMount() {
		const { request } = this.props.navigation.state.params;
		AsyncStorage.getItem('userId')
			.then(userId => this.setState({ userId }));
		  this.setState({user: this.props.navigation.state.params.user, request})
	}

	componentWillUnmount () {
		if(this.state.request.completed) {
			this.props.navigation.state.params.onNavigateBack([this.state.request.requestId, 'completed']);
		}
		else if(this.state.request.accepted && !this.state.request.completed) {
			this.props.navigation.state.params.onNavigateBack(this.state.request.requestId, 'accepted');
		} 
	}

	getButtons() {
		const { userId, request } = this.state;
		const { requesterId, providerId, accepted, confirmed, completed } = request;
        // Can't accept/complete your own requests or a request that's already taken
		if (userId === requesterId) {
			return;
		}
		const currentTime = moment();
		if (!accepted) {
			return <CustomButton text="Accept" onPressHandle={() => this.accept() && currentTime < request.timeEnd} />;
		} else if (userId === providerId && !completed && currentTime < request.timeEnd) {
			return <CustomButton text="Complete" onPressHandle={() => this.complete()} />;
		}
		return;
	}

	accept() {
		const { user } = this.state;
		const { requestId } = this.props.navigation.state.params.request;
		user.acceptRequest(requestId).then((response) => {
			if (response.status === 200) {
				const { request } = this.state;
				this.setState({ request: { ...request, accepted: true }});
			}
		}).catch((error) => (Alert.alert("There was an error accepting the request, try again later")));
	}

	complete() {
		const { user } = this.state;
		const { requestId } = this.props.navigation.state.params.request;
		user.completeRequest(requestId).then((response) => {
			const { request } = this.state;
			this.setState({ request: { ...request, completed: true }});
			this.props.navigation.navigate('RequestHistory', {user: user});
		}).catch((error) => {
			console.log(error);
			Alert.alert("There was an error completing the request, try again later")
		});
	}

	messageRequester() {
		const navigation = this.props.navigation;
		const { userId, request } = this.state;
		const { requesterId } = request;

		axios.post(`${config.API_URL}/v1/message/session/create`, {
			userId1: userId,
			userId2: requesterId
		})
			.then(response => JSON.parse(response.data))
			.then(messageSession => {
				navigation.navigate('MessageScreen', {
					messageSessionId: messageSession.messageSessionId,
					userId,
					otherUserId: requesterId
				});
			});
	}

	render() {
		const { userId, request } = this.state;
		const { requesterId, title, address, description } = request;
		const { accepted, confirmed, completed } = request;
		const timeStart = moment(request.timeStart).format('M-D-YY h:ma');
		const timeEnd = moment(request.timeEnd).format('M-D-YY h:ma');
		return (
			<View style={styles.simpleContainer}>
				<ScrollView style={styles.detailsMakeContainer}>
					<View style={styles.makeInputView}>
						<RequestInfoLine primary={'Requester'} secondary={' ' + requesterId} />
						<RequestInfoLine primary={'Request'} secondary={' ' + title} />
						<RequestInfoLine primary={'Location'} secondary={' ' + address} />
						<RequestInfoLine primary={'Start Time'} secondary={' ' + timeStart} />
						<RequestInfoLine primary={'End Time'} secondary={' ' + timeEnd} />
						<Text style={styles.key}>Details: <Text style={styles.value}>{' ' + description}</Text></Text>
					</View>


					<View style={styles.genericContainer}>
						{ this.getButtons() }
						{ userId === request.requesterId ||
							<CustomButton
								text="Message Requester"
								onPressHandle={() => this.messageRequester()}
							/>
						}
					</View>
				</ScrollView>
			</View>
		);
	}
}

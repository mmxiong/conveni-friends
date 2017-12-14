import React from 'react';
import axios from 'axios';
import moment from 'moment';

import { AsyncStorage, Button, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import RequestInfoLine from 'client/app/components/RequestInfoDetails';
import CustomButton from 'client/app/components/CustomButton';
import User from 'client/app/Common/User';

import { getUser } from 'client/app/utils';
import styles from 'client/styles/style';
import config from 'client/config';

export default class RequestDetailsScreen extends React.Component {
	static navigationOptions = {
		title: 'Request Details',
	}

	constructor(props) {
		super(props);

		this.state = {
			userId: '',
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

	getButtons() {
		const { userId } = this.state;
		const { accepted, requesterId, completed } = this.props.navigation.state.params.request;

		if (!userId || userId === requesterId) {
			return;
		}
		if (!accepted) {
			return <CustomButton text="Accept" onPressHandle={() => this.accept()} />;
		} else if (userId === providerId && !completed) {
			return <CustomButton text="Complete" onPressHandle={() => this.complete()} />;
		}
		return;
	}

	accept() {
		const { userId } = this.state;
		const { requesterId, requestId } = this.props.navigation.state.params.request;

		axios.post(`${config.API_URL}/v1/request/${requestId}/accept`, {
			userId,
			time: moment().format('YYYY-MM-DD HH:MM:ss')
		});
		user = new User();
		user.userId = userId;
		this.props.navigation.navigate('ProviderScreen', {user: user});
	}

	complete() {
		const { user } = this.state;
		const { requestId } = this.props.navigation.state.params.request;
		user.completeRequest(requestId).then((response) => {
			this.props.navigation.navigate('RequestHistory', {user: user});
		}).catch((error) => (Alert.alert("There was an error completing the request, try again later")));
	}

	messageRequester() {
		const navigation = this.props.navigation;
		const { requesterId } = navigation.state.params.request;
		const { userId } = this.state;

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
		const request = this.props.navigation.state.params.request;
		const { requesterId, title, address, description } = request;
		const { timeStart, timeEnd, accepted, confirmed, completed } = request;
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

					{ this.getButtons() }
						<View style={styles.genericContainer}>
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

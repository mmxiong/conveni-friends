import React from 'react';
import moment from 'moment';
import {
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import styles from 'client/styles/style';

export default class Card extends React.Component {
	static navigationOptions = {
		// title: 'Home',
	}

	constructor(props) {
		super(props);
	}

	render() {
		let { data, onClick } = this.props;
		let { distance, request } = data;
		let timeStart = moment(request.timeStart).format('M-D-YY h:ma');
		let timeEnd = moment(request.timeEnd).format('M-D-YY h:ma');
		distance = distance.toString().substr(0, 4) + ' mi';
		return (
			<View >
				<TouchableOpacity onPress={() => onClick()} style={styles.cardContainer}>
					<View style={styles.cardLeft}>
						<Text style={styles.cardTitle} numberOfLines={1} >{request.title}</Text>
						<Text style={styles.cardSubTitle} numberOfLines={1}>{timeStart} - {timeEnd}</Text>
					</View>
					<View style={styles.cardRight}>
						<Text style={styles.cardDistance}>{distance}</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
}

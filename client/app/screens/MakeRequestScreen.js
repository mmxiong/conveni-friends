import React from 'react';
import {
	Text,
	TextInput,
	Button,
	View,
	Alert,
	TouchableWithoutFeedback,
	Keyboard
} from 'react-native';
import styles from 'client/styles/style';

import moment from 'moment'; // 2.19.2
import Moment from 'react-moment'; // 0.6.8
import Request from 'client/app/Common/Request';
import FormInput from 'client/app/components/FormInput';
import DateTimePicker from 'client/app/components/DateTimePicker';
import User from 'client/app/Common/User';
import CustomButton from 'client/app/components/CustomButton';


import "prop-types"; // 15.6.0


export default class MakeRequestScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			title: '',
			location: '',
			startTime: new Date(),
			endTime: new Date(),
			description: '',
		}

		this._onPressHandle = this._onPressHandle.bind(this);
		this._getUser = this._getUser.bind(this);
	}

	static navigationOptions = {
		title: 'Make a Request',
	};

	state = {
		user: new User(),
		isDateTimePickerVisible: false,
		startTime: new Date(),
		endTime: new Date(),
		title: '',
		location: '',
		description: ''
	}

	_onPressHandle() {
		if (this.state.title && this.state.location && this.state.description) {
			//get latitude and longitude from address?
			if ((this.state.endTime - this.state.startTime < 3600000) || this.state.startTime < new Date()) {
				Alert.alert("Invalid time, please reenter a valid start time and valid end time." +
				 "Start time can't be from the past. Start and end times must be an hour apart");
			}
			else {
				let timeStart = this.state.startTime.toISOString().slice(0, 19).replace('T', ' ');
				let timeEnd = this.state.endTime.toISOString().slice(0, 19).replace('T', ' ');
				let request = new Request(this.state.user.userId, null, this.state.title,
					this.state.description, 0.0, 0.0, this.state.location, timeStart, timeEnd);
				this.props.navigation.navigate("RequesterLocation", {
					user: this.state.user,
					request: request
				});
			}
		}
		else {
			Alert.alert("Please fill in all the fields.");
		}
	}

	_getUser() {
        if (this.props.navigation.state.params) {
            this.setState({user: this.props.navigation.state.params.user});
        }
	}

	componentWillMount() {
        this._getUser();
	}
	  
	render() {
		const { navigate } = this.props.navigation;
		return (
			<TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
				<View style={styles.makeContainer}>
					<View style={styles.makeInputView}>
						<FormInput setParentState={newState=>{this.setState(newState)}} field={"title"} 
							style={styles.makeSingleLine} title={'Title'} placeholder={'Your short title'}/>
						<FormInput setParentState={newState=>{this.setState(newState)}} field={"location"} 
							style={styles.makeSingleLine} title={'Location'} placeholder={'123 Bruin Ave'} />
						<View style={[styles.makeDateContainer, styles.makeSingleLine]}>
							<DateTimePicker setParentState={newState=>{this.setState(newState)}} field={"startTime"} style={styles.makeSingleLine} type='Start'/>
							<DateTimePicker setParentState={newState=>{this.setState(newState)}} field={"endTime"} style={styles.makeSingleLine} type='End'/>
						</View>
						<FormInput setParentState={newState=>{this.setState(newState)}} field={"description"}
							style={styles.formMultiLine} title={'Description'} placeholder={'Some other details would include...'} multiLine={true}/>
					</View>
					<CustomButton text={'Make Request'} onPressHandle={() => {this._onPressHandle();}} />
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

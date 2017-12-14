import React from 'react';
import { Alert, Text, View, TextInput, Button } from 'react-native';
import styles from 'client/styles/style';
import CustomButton from 'client/app/components/CustomButton';
import LoginFormInput from 'client/app/components/LoginFormInput';

export default class ChangePassword extends React.Component {
    static navigationOptions = {
      drawerLabel: 'Change Password'
    }
    constructor(props) {
        super(props);
        this.state = {
            oldPassword: '',
            password: '',
            password2: '',
        };
        this._changePass = this._changePass.bind(this)
        this._getUser = this._getUser.bind(this);
    }
    _changePass() {
        //alphanumeric characters
        const alphanum = /[0-9a-zA-Z]+/g;
            if (this.state.oldPassword && this.state.password && this.state.password2) {
                if (this.state.password === this.state.password2) {
                  this.state.user.changePassword(this.state.oldPassword, this.state.password).then(
                    (response) => {this.props.navigation.navigate('LoginScreen')}
                  ).catch((error) => {Alert.alert("There was an error changing your password.")});


                }
                else {
                    Alert.alert("Passwords do not match, please reenter.");
                }
            }
            else {
                Alert.alert("Password field(s) blank, please enter.");
            }
    }
    componentWillMount() {
        this._getUser();
    }
    _getUser() {
            if (this.props.navigation.state.params) {
                this.setState({user: this.props.navigation.state.params.user});
            }
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
          <View style={styles.loginContainer}>

            <LoginFormInput
                setParentState={newState=>{this.setState(newState)}}
                field={"oldPassword"}
                secureTextEntry={true}
                style={styles.makeLoginLine}
                onSubmitEditing={(text) => {this.setState({oldPassword: text});}}
                placeholder={'Old Password'}/>

            <LoginFormInput
                setParentState={newState=>{this.setState(newState)}}
                field={"password"}
                secureTextEntry={true}
                style={styles.makeLoginLine}
                onSubmitEditing={(text) => {this.setState({password: text});}}
                placeholder={'New Password'}/>

            <LoginFormInput
                setParentState={newState=>{this.setState(newState)}}
                field={"password2"}
                secureTextEntry={true}
                style={styles.makeLoginLine}
                placeholder={'Confirm Password'}/>

            <CustomButton
                onPressHandle={() => {this._changePass();}}
                text="Confirm"/>

          </View>
        );
    }
}

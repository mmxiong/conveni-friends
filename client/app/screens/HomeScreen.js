import React from 'react';
import { AsyncStorage, Text, View, TextInput, Button } from 'react-native';
import LoginScreen from 'client/app/screens/LoginScreen';
import HamburgerMenu from 'client/app/Common/HamburgerMenu';
import Hamburger from 'client/app/Common/Hamburger';
import styles from 'client/styles/style';
import CustomButton from 'client/app/components/CustomButton';
import User from 'client/app/Common/User';

export default class HomeScreen extends React.Component {
    static navigationOptions = ({navigation, screenProps}) => {
        const params = navigation.state.params || {};
        return {
            headerRight: params.headerRight,
            headerLeft: null,
            gesturesEnabled: false,
            title: 'Home',
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            user: new User()
        };
        this.provider = this.provider.bind(this);
        this.requester = this.requester.bind(this);
        this._getUser = this._getUser.bind(this);
    }
    _getUser() {
            if (this.props.navigation.state.params) {
                const { user } = this.props.navigation.state.params;
                this.setState({ user });
                AsyncStorage.setItem('userId', user.userId);
            }
    }
    provider() {
        this.props.navigation.navigate('ProviderLocation', {user:this.state.user});
    }
    requester() {
        this.props.navigation.navigate('MakeRequestScreen', {user:this.state.user});
    }

    _setNavigationParams() {
        let headerRight =
        <Hamburger
            onPress={()=>{this.state.hamburgerMenu.toggleDrawer()}}
        />;
        this.props.navigation.setParams({
          headerRight,
        });
    }

    componentWillMount() {
        this._setNavigationParams();
        this._getUser();
	}

	componentDidMount () {
		const { navigate } = this.props.navigation;
		if (!this.state.user.userId) {
			navigate('LoginScreen');
		}
	}

    render() {      
		const view = (<View style={styles.genericContainer}>
			<Text style={styles.titleLarge}>I am a...</Text>
			<CustomButton
				onPressHandle={() => {this.provider();}}
				text='Provider'/>

			<CustomButton
				onPressHandle={() => {this.requester();}}
				text='Requester' />

			<CustomButton onPressHandle={() => this.props.navigation.navigate('MessagesScreen', { userId: this.state.user.userId, user: this.state.user })}  // TODO:remove later
				text='Messages' />
		</View>);
		return (          
			<HamburgerMenu
				setParentState={newState=>{this.setState(newState)}}
				user={this.state.user}
				navigation={this.props.navigation}
				view={view}
			/>        
		);
	}
}

import React, { Component } from 'react';
import { List, ListItem } from 'react-native-elements';
import Drawer from 'react-native-drawer';
import { View, AsyncStorage } from 'react-native';
import styles from 'client/styles/style';
import config from 'client/config';
import Hamburger from 'client/app/Common/Hamburger';
import MessageScreen from 'client/app/screens/MessageScreen';
import HamburgerMenu from 'client/app/Common/HamburgerMenu';

export default class MessagesScreen extends Component {
    static navigationOptions = ({navigation, screenProps}) => {
        const params = navigation.state.params || {};
        return {
            headerRight: params.headerRight,
            title: 'Messages',
        }
    };
    constructor(props) {
        super(props);

        this.state = {
            // messageSession = { messageSessionId, userId1, userId2 }
            messageSessions: [],
        };

        this.getMessageSession = this.getMessageSession.bind(this);
        this._setNavigationParams = this._setNavigationParams.bind(this);        
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
        AsyncStorage.getItem('userId')
        .then(userId => this.setState({ userId },
             () => {fetch(config.API_URL + `/v1/user/${userId}/messageSessions`)
                .then(response => {
                    if (!response.ok) {
                        // TODO: Handle errors
                    }

                    return response.json()
                })
                .then(messageSessions => this.setState({ messageSessions }))
                .catch(error => {
                    // TODO: Handle network errors
                });}));
        this.setState({user: this.props.navigation.state.params.user})
        this._setNavigationParams();
        // Grab active messageSessions
        
    }

    getMessageSession(messageSessionId, otherUserId) {
        const { navigation } = this.props;
        const { userId } = this.state;

        navigation.navigate('MessageScreen', {
            messageSessionId,
            userId,
            otherUserId
        });
    }

    render() {
        const { userId } = this.state;
        const { messageSessions } = this.state;
        console.log(this);
        const view = (<View style={styles.messageContainer}>
            <List>
                { messageSessions.map( messageSession => {
                    const { messageSessionId, userId1, userId2 } = messageSession;
                    const otherUserId = userId == userId1 ? userId2 : userId1;

                    return (
                        <ListItem
                            key={ messageSessionId }
                            title={ otherUserId }
                            onPress={ () => this.getMessageSession(messageSessionId, otherUserId) }
                        />
                    );
                })}
            </List>
          </View>);

        // TODO: Sort by most recent messages
        // TODO: Display most recent message
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

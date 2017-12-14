import React from 'react';
import { ListView, Alert, Text, View, TextInput, Button } from 'react-native';
import styles from 'client/styles/style';
import User from 'client/app/Common/User';
import Request from 'client/app/Common/Request';
import RequestListComponent from 'client/app/components/RequestListComponent';
import CustomButton from 'client/app/components/CustomButton';
import Hamburger from 'client/app/Common/Hamburger';
import HamburgerMenu from 'client/app/Common/HamburgerMenu';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';

export default class RequestHistory extends React.Component {
    static navigationOptions = ({navigation, screenProps}) => {
        const params = navigation.state.params || {};
        return {
            headerRight: params.headerRight,
            drawerLabel: 'Request History',
        }
    };
    constructor(props) {
        super(props);
        state = {
            user: null,
            index: 0,
            routes: [
              { key: 'created', title: 'Created' },
              { key: 'accepted', title: 'Accepted' },
            ],
        };
        this.fetchMyRequests = this.fetchMyRequests.bind(this);
        this._renderHeader = this._renderHeader.bind(this);
        this._renderScene = this._renderScene.bind(this);
        this._setNavigationParams = this._setNavigationParams.bind(this);
		this._handleIndexChange = this._handleIndexChange.bind(this);
		this.handleOnNavigateBack = this.handleOnNavigateBack.bind(this);
    }

    fetchMyRequests() {
        if (this.props.navigation.state.params) {
            this.setState({user: this.props.navigation.state.params.user,
                index: 0,
                routes: [
                  { key: 'created', title: 'Created' },
                  { key: 'accepted', title: 'Accepted' },
                ]}, () => {
                this.state.user.getMyRequests().then((response) => {
                    created = [];
                    accepted = [];
                    response.forEach(element => {
                        if(element.request.requesterId === this.state.user.userId) {
                            created.push(element);
                        }
                        else {
                            accepted.push(element);
                        }
                    });
                    this.setState({created: created, accepted: accepted});
                });
            });
        }
<<<<<<< HEAD
    }

=======
	}
	
	handleOnNavigateBack(requestId) {
		if(requestId && requestId[1] === 'completed') {
			let newData = this.state.accepted;
			let spliceIndex;
			for(let i = 0; i < newData.length; i++) {
				let curRequest = newData[i].request;
				if(curRequest.requestId === requestId) {
					spliceIndex = i;
				}
			}
			newData.splice(spliceIndex, 1);
			this.setState({accepted: newData});	
		} 
	}
    
>>>>>>> upstream/master
    _renderScene = ({ route }) => {
        switch (route.key) {
        case 'created':
        if (this.state.created) {
<<<<<<< HEAD
            return (<RequestListComponent data={this.state.created} user={this.state.user} navigation={this.props.navigation}/>);
        }
        case 'accepted':
        if (this.state.accepted) {
            return (<RequestListComponent data={this.state.accepted} user={this.state.user} navigation={this.props.navigation}/>);
=======
            return (<RequestListComponent data={this.state.created} user={this.state.user} navigation={this.props.navigation} handleOnNavigateBack={()=>{console.log('created')}}/>);
        }
        case 'accepted':
        if (this.state.accepted) {
            return (<RequestListComponent data={this.state.accepted} user={this.state.user} navigation={this.props.navigation} handleOnNavigateBack={this.handleOnNavigateBack}/>);
>>>>>>> upstream/master
        }
        default:
            return <View><Text>oops</Text></View>;
        }
      };

      _setNavigationParams() {
        let headerRight =
        <Hamburger
            onPress={()=>{this.state.hamburgerMenu.toggleDrawer()}}
        />;
        this.props.navigation.setParams({
          headerRight,
        });
    }

    _getUser() {
        if (this.props.navigation.state.params) {
            this.setState({user: this.props.navigation.state.params.user});
        }
    }

    _renderHeader = props => <TabBar {...props} />;
    _handleIndexChange = index => this.setState({ index });

    componentWillMount() {
        this._setNavigationParams();
        this._getUser();
        this.fetchMyRequests();
    }
	render() {
        let view = (
        <TabViewAnimated
            style={styles.simpleContainer}
            navigationState={this.state}
            renderScene={this._renderScene}
            renderHeader={this._renderHeader}
            onIndexChange={this._handleIndexChange}
        />);
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

import React, {Component} from 'react';
import {Text, View,Button, StyleSheet} from 'react-native';
import styles from 'client/styles/style';
import Drawer from 'react-native-drawer';

export default class HamburgerMenu extends Component {
    constructor(props) {
        super(props);
    }
    toggleDrawer = () => {
        if (!this._drawer._open) {
            this._drawer.open();
        }
        else {
            this._drawer.close();
        }
    }
    history() {
        this._drawer.close();
        this.props.navigation.navigate('RequestHistory', {user:this.props.user});
    }
    changePass(){
        this._drawer.close();
        this.props.navigation.navigate('ChangePassword', {user: this.props.user});
    }
    logout() {
        this._drawer.close();
        this.props.navigation.navigate('LoginScreen');
    }
    messages() {
        this._drawer.close();
        this.props.navigation.navigate('MessagesScreen', {userId: this.props.user.userId});
    }
    componentDidMount() {
        this.props.setParentState({hamburgerMenu: this});
    }
    render() {
        const drawerStyles = {
            drawer: { backgroundColor: '#000000',
                shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
            main: {paddingLeft: 3},
        }
        return(
            <Drawer type='overlay'
                content={<View style={styles.hamburgerContainer}>
                    <Text style={styles.hamburgerItem}
                      onPress={() => {this.changePass();}}
                      >Change Password</Text>

                    <Text style={styles.hamburgerItem}
                      onPress={() => {this.history();}}
                      >Request History</Text>

                    <Text style={styles.hamburgerItem}
                      onPress={() => {this.history();}}
                      >Messages</Text>

                    <Text style={styles.hamburgerItem}
                      onPress={() => {this.history();}}
                      >Logout</Text>
                                            
                </View>}
                ref={(ref) => this._drawer = ref}
                openDrawerOffset={0.6}
                style={drawerStyles}
                tapToClose={true}
                acceptPan={true}
                side={'right'}
                panCloseMask={0.6}
                panOpenMask={0}>
                {this.props.view}
           </Drawer>
        );
    }
}

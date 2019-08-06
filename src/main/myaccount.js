import React, {Component} from 'react';
import {Platform, View, BackHandler, StatusBar, NativeModules, StatusBarIOS, Text} from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import { TextButton } from 'react-native-material-buttons';
const { StatusBarManager } = NativeModules;
import { NavigationActions } from 'react-navigation'
import firebase from 'react-native-firebase';

export default class MyAccountScreen extends Component {

  state = {
    statusBarHeight: 0
  };

  componentDidMount() {
    StatusBar.setBarStyle("light-content")
    if (Platform.OS === 'ios') {
      StatusBarManager.getHeight(response =>
          this.setState({statusBarHeight: response.height})
      )
  
      this.listener = StatusBarIOS.addListener('statusBarFrameWillChange',
        (statusBarData) =>
          this.setState({statusBarHeight: statusBarData.frame.height})
      )
    } else {
      StatusBar.setBackgroundColor("#000000");
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios' && this.listener) {
      this.listener.remove()
    }
    if(Platform.OS == 'android') {
      StatusBar.setBackgroundColor("#000000");
      StatusBar.setBarStyle("light-content");
  }
    else StatusBar.setBarStyle("light-content");
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton() {
    return true;
  }

  signOut(){
      firebase.auth().signOut();
      this.props.navigation.navigate("Login");
  }

  render() {
    return <View style={{flex: 1, backgroundColor: Platform.OS == 'android' ? "#FFFFFF" : "#000000", paddingTop: Platform.OS === 'ios' ? this.state.statusBarHeight : 0}}>
      <Toolbar
        leftElement="arrow-back"
        onLeftElementPress={()=>{    
            const backAction = NavigationActions.back({
                key: null
            }) 
            
            this.props.navigation.dispatch(backAction);
        }}
        centerElement="My Account"
        style={{
          container: {
            backgroundColor: "#000000"
          }
        }}
        rightElement={{
          actions: [
            "cloud-off"
          ]
        }}
        onRightElementPress={ (label) => { 
            this.signOut();
         }}
      />
      <View style={{flex: 1, backgroundColor: "#ffffff"}}>
      <Text style={{paddingLeft: 16, paddingTop: 16, paddingBottom: 12, fontSize: 24, fontWeight: "700", color: "#000000"}}>Display Name:</Text>
        <Text style={{paddingLeft: 16, paddingBottom: 12, fontSize: 16, color: "#000000"}}>{firebase.auth().currentUser.displayName == null?"No Name Provided":firebase.auth().currentUser.displayName}</Text>
        <Text style={{paddingLeft: 16, paddingTop: 16, paddingBottom: 12, fontSize: 24, fontWeight: "700", color: "#000000"}}>Email:</Text>
        <Text style={{paddingLeft: 16, paddingBottom: 12, fontSize: 16, color: "#000000"}}>{firebase.auth().currentUser.email == null?"No Email Provided":firebase.auth().currentUser.email}</Text>
        <Text style={{paddingLeft: 16, paddingTop: 16, paddingBottom: 12, fontSize: 24, fontWeight: "700", color: "#000000"}}>User ID:</Text>
        <Text style={{paddingLeft: 16, paddingBottom: 12, fontSize: 16, color: "#000000"}}>{firebase.auth().currentUser.uid}</Text>
        <TextButton title="Delete Account" titleColor="#FF0000" onPress={()=>{
          firebase.auth().currentUser.delete().then(()=>this.props.navigation.navigate('Login')).catch((e)=>alert(e.message));
        }}/>
      </View>
      </View>;
  }

}
import React, {Component} from 'react';
import {Platform, SafeAreaView, View, BackHandler, ToastAndroid, StatusBar, NativeModules, StatusBarIOS, Text} from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TextButton } from 'react-native-material-buttons';
const { StatusBarManager } = NativeModules;

export default class LoginActionSuccessScreen extends Component {

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
      StatusBar.setBackgroundColor("#4CAF50");
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios' && this.listener) {
      this.listener.remove()
    }
    if(Platform.OS == 'android') {
      StatusBar.setBackgroundColor("#4CAF50");
      StatusBar.setBarStyle("light-content");
  }
    else StatusBar.setBarStyle("dark-content");
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton() {
    return true;
  }

  render() {
    return <View style={{flex: 1, backgroundColor: Platform.OS == 'android' ? "#FFFFFF" : "#4CAF50", paddingTop: Platform.OS === 'ios' ? this.state.statusBarHeight : 0}}>
      <View style={{flex: 1, backgroundColor: "#4CAF50"}}>
      <View style={{marginHorizontal: 32, marginTop: 48}}>
        <MaterialIcons name="error-outline" size={48} color="#fff" />
      </View>
      <View style={{marginHorizontal: 32, marginTop: 32}}>
        <Text style={{fontSize: 24, fontWeight: "500", color: "#ffffff"}}>{this.props.navigation.getParam("title", "Success")}</Text>
      </View>
      <View style={{marginHorizontal: 32}}>
        <Text style={{fontSize: 16, fontWeight: "500", color: "#ffffff"}}>{this.props.navigation.getParam("body", "")}</Text>
      </View>
      <View style={{bottom: 16, position: "absolute", right: 32}}>
        <TextButton title='FINISH' onPress={()=>{
            this.props.navigation.navigate(this.props.navigation.getParam("finishNavigate", "Login"));
        }} titleColor="#ffffff"/>
      </View>
      </View>
      </View>;
  }

}
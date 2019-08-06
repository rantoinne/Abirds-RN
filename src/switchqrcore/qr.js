import React, {Component} from 'react';
import {Platform, Text, View, BackHandler, ScrollView, StatusBar, NativeModules, StatusBarIOS} from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import { Button } from 'react-native-material-buttons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
const { StatusBarManager } = NativeModules;
import { NavigationActions } from 'react-navigation'
import firebase from 'react-native-firebase';
import { PermissionsAndroid } from 'react-native';

export default class NewQRScreen extends Component {

    state = {
        statusBarHeight: 0,
        CAMERA_PERMS: false,
        requested: false
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

      requestCameraPermission() {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              'title': 'Cool Photo App Camera Permission',
              'message': 'Cool Photo App needs access to your camera ' +
                         'so you can take awesome pictures.'
            }
          ).then((granted)=>{
            this.setState({CAMERA_PERMS: granted})
            this.scan();
          }, (err) => {
            this.setState({CAMERA_PERMS: false})
            this.scan();
          });
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

      buy(){
        this.props.navigation.navigate("BuyQR");
      }
    
      scan(){
        if (Platform.OS === 'android' && this.state.CAMERA_PERMS == false && this.state.requested == false) {
          this.setState({requested: true});
          this.requestCameraPermission();
        } else
        this.props.navigation.navigate("SwitchQR");
      }
    
      render() {
        return <View style={{flex: 1, backgroundColor: Platform.OS == 'android' ? "#FFFFFF" : "#000000", paddingTop: Platform.OS === 'ios' ? this.state.statusBarHeight : 0}}>
          <Toolbar
            leftElement="arrow-back"
            onLeftElementPress={()=>{    
                const backAction = NavigationActions.back({
                    key: null
                });
                
                this.props.navigation.dispatch(backAction);
            }}
            centerElement="Add New QR Codes"
            style={{
              container: {
                backgroundColor: "#000000"
              }
            }}
          />
          <View style={{flex: 1, backgroundColor: "#ffffff"}}> 
            <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
                <Button style={{margin: 16, marginBottom: 8, padding: 24, borderRadius: 8, borderWidth: 1, borderColor: "#000000"}} color="#ffffff" onPress={()=>{this.scan();}}>
                    <View style={{flexDirection: "row"}}>
                        <Ionicons name="md-qr-scanner" size={24} color="#000000"></Ionicons>
                        <View style={{height: 24, flexDirection: "column", alignItems: "center", paddingTop: 4}}>
                            <Text style={{fontWeight: "700", color: "#000000", marginLeft: 16, fontSize: 16}}>Scan a new QR Code</Text>
                        </View>
                    </View>
                </Button>
                <Button style={{margin: 16, marginTop: 8, marginBottom: 8, padding: 24, borderRadius: 8, borderWidth: 1, borderColor: "#000000"}} color="#ffffff" onPress={()=>{this.buy();}}>
                    <View style={{flexDirection: "row"}}>
                        <MaterialCommunityIcons name="qrcode" size={24} color="#000000"></MaterialCommunityIcons>
                        <View style={{height: 24, flexDirection: "column", alignItems: "center", paddingTop: 4}}>
                            <Text style={{fontWeight: "700", color: "#000000", marginLeft: 16, fontSize: 16}}>Buy a new QR Code</Text>
                        </View>
                    </View>
                </Button>
            </ScrollView>
          </View>
          </View>;
      }
    
}
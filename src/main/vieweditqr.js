import React, {Component} from 'react';
import {Platform, View, BackHandler, ScrollView, StatusBar, NativeModules, StatusBarIOS, Dimensions, Text, Linking} from 'react-native';
import { Toolbar, Checkbox } from 'react-native-material-ui';
import Spinner from 'react-native-loading-spinner-overlay';
const { StatusBarManager } = NativeModules;
import { NavigationActions } from 'react-navigation'
import firebase from 'react-native-firebase';
import { TextField } from 'react-native-material-textfield';
import QRCode from 'react-native-qrcode-svg';
import { Button, TextButton } from 'react-native-material-buttons';

export default class EditQRScreen extends Component {

    state = {
        statusBarHeight: 0,
        qrData: 'lod',
        dbData: {}
      };

      componentWillMount() {
          firebase.firestore().collection('qrcodes').doc(this.props.navigation.getParam('id', 'err')).get().then((value)=>{
            this.setState({dbData: value.data()});
          });
      }
    
      componentDidMount() {
        this.setState({qrData: this.props.navigation.getParam('id', 'err')});
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
                });
                
                this.props.navigation.dispatch(backAction);
            }}
            centerElement="Edit QR Code"
            style={{
              container: {
                backgroundColor: "#000000"
              }
            }}
            rightElement={
                [
                    "people",
                    "person"
                ]
            }
            onRightElementPress={(event)=>{
                if(event.index == 1){
                    firebase.firestore().collection('qrcodes').doc(this.props.navigation.getParam('id', 'err')).set(this.state.dbData).then((res)=>{
                        this.props.navigation.navigate("Requests", {id: this.props.navigation.getParam('id', 'err')});
                    });
                } else {
                    firebase.firestore().collection('qrcodes').doc(this.props.navigation.getParam('id', 'err')).set(this.state.dbData).then((res)=>{
                        this.props.navigation.navigate("AdminUsers", {id: this.props.navigation.getParam('id', 'err')});
                    });
                }
            }}
          />
          <Spinner visible={this.state.qrData == 'lod'} textContent={"Loading..."} textStyle={{color: '#FFFFFF'}} />
          <View style={{flex: 1, backgroundColor: "#ffffff"}}> 
            <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
                {this.state.qrData == "lod"?<View/>:this.state.qrData == "err"?<View>
                    <Text>Error</Text>
                </View>:<View>
                    <View style={{marginTop: 80, marginLeft: 80, marginRight: 80, marginBottom: 16}}>
                        <QRCode value={this.state.qrData} size={Dimensions.get('window').width - 160}/>
                    </View>
                    <View style={{paddingHorizontal: 40,paddingBottom: 0}}>
                        <TextField
                            label='Name'
                            value={this.state.dbData.name}
                            tintColor="#000000"
                            textContentType="none"
                            onChangeText={(newName) => {
                                var temp = this.state.dbData;
                                temp.name = newName;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 28,paddingBottom: 0}}>
                        <Checkbox label="Everyone can access your contact card" checked={this.state.dbData.permissions == "everyone"} onCheck={(checked)=>{
                            if(checked == false) return;
                                var temp = this.state.dbData;
                                temp.permissions = "everyone";
                                this.setState({ dbData: temp});
                        }}/>
                        <Checkbox label="Access to your contact card is granted by request" checked={this.state.dbData.permissions == "access"} onCheck={(checked)=>{
                            if(checked == false) return;
                                var temp = this.state.dbData;
                                temp.permissions = "access";
                                this.setState({ dbData: temp});
                        }}/>
                        <Checkbox label="Only people who can edit your QR can access your contact card" checked={this.state.dbData.permissions == "belongsTo"} onCheck={(checked)=>{
                            if(checked == false) return;
                                var temp = this.state.dbData;
                                temp.permissions = "belongsTo";
                                this.setState({ dbData: temp});
                        }}/>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Facebook Link'
                            value={this.state.dbData.fbLink}
                            tintColor="#000000"
                            prefix={"https://"}
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.fbLink = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='LinkedIn Link'
                            value={this.state.dbData.linkedInLink}
                            tintColor="#000000"
                            prefix={"https://"}
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.linkedInLink = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Twitter Link'
                            value={this.state.dbData.twitterLink}
                            tintColor="#000000"
                            prefix={"https://"}
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.twitterLink = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Personal Name'
                            value={this.state.dbData.personalName}
                            tintColor="#000000"
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.personalName = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Phone Number'
                            value={this.state.dbData.phoneNumber}
                            prefix={"+"}
                            tintColor="#000000"
                            textContentType="telephoneNumber"
                            keyboardType="number-pad"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.phoneNumber = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Home Phone Number'
                            value={this.state.dbData.homePhoneNumber}
                            prefix={"+"}
                            tintColor="#000000"
                            textContentType="telephoneNumber"
                            keyboardType="number-pad"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.homePhoneNumber = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Email Address'
                            value={this.state.dbData.emailAddress}
                            tintColor="#000000"
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.emailAddress = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Personal Address'
                            value={this.state.dbData.personalAddress}
                            tintColor="#000000"
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.personalAddress = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Website'
                            value={this.state.dbData.website}
                            tintColor="#000000"
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.website = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                        <TextField
                            label='Description'
                            value={this.state.dbData.description}
                            tintColor="#000000"
                            textContentType="none"
                            onChangeText={(newLink) => {
                                var temp = this.state.dbData;
                                temp.description = newLink;
                                this.setState({ dbData: temp});
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 40}}>
                        <TextButton title="Save" titleColor="#000000" onPress={()=>{
                        firebase.firestore().collection('qrcodes').doc(this.props.navigation.getParam('id', 'err')).set(this.state.dbData).then((res)=>{
                            this.props.navigation.pop();
                        });
                        }} style={{marginBottom: 16}}></TextButton>
                    </View>
                </View>}
            </ScrollView>
          </View>
          </View>;
      }
    
}
import React, {Component} from 'react';
import {Platform, View, BackHandler, StatusBar, Linking, Alert} from 'react-native';
import {NavigationActions, withNavigation} from 'react-navigation'
import firebase from 'react-native-firebase';
import QRScanner from '../ac-qrcode/QRScanner';
import Spinner from 'react-native-loading-spinner-overlay';
import { Toolbar, IconToggle } from 'react-native-material-ui';

const addScannedQRCode = firebase.functions().httpsCallable('addScannedQRCode');
const sendQRRequest = firebase.functions().httpsCallable('sendQRRequest');

class SwitchQRScreen extends Component {

    constructor(props){
      super(props);
      this.state = {
        backBtn: () => {},
        busy: false,
        flashOn: false
      };
    }

    componentWillMount() {
        const { navigation } = this.props;
        this.setState({backBtn: () => {
            const backAction = NavigationActions.back({
                key: null
            });
            navigation.dispatch(backAction);
            return false;
        }});
    }
    
      componentDidMount() {
        StatusBar.setTranslucent(true);
        StatusBar.setHidden(true);
        BackHandler.addEventListener("hardwareBackPress", this.state.backBtn);
      }
    
      componentWillUnmount() {
        StatusBar.setTranslucent(false);
        StatusBar.setHidden(false);
        this.setState({busy: false});
        if(Platform.OS == 'android') {
          StatusBar.setBackgroundColor("#000000");
          StatusBar.setBarStyle("light-content");
      }
        else StatusBar.setBarStyle("light-content");
        BackHandler.removeEventListener("hardwareBackPress", this.state.backBtn);
      }

      pauseScanning(){
        this.setState({busy: true});
      }

      resumeScanning(){
        this.setState({busy: false});
      }

      onScan(session) {
        if(this.state.busy) return;
        this.pauseScanning();
        Linking.canOpenURL(session.data).then(supported => {
          if(!supported){
            //TRY OPENING WITH SWITCHQR
            firebase.firestore().collection('qrcodes').doc(session.data).get().then((value)=>{
              if(value.exists){
                addScannedQRCode({qrId: value.id, permissions: value.data().permissions}).then((result)=>{
                  if(result.data.access == true){
                    sendQRRequest({qrId: value.id}).then((res)=>{
                      if(res.data.err == true){
                        alert(res.data.errM);
                      } else
                      alert("Successfully sent request to join QR Code");
                      this.resumeScanning();
                    }).catch((e)=>{alert(e.message); this.resumeScanning();});
                  } else if(result.data.scanned == true){
                    alert("Successfully joined QR Code. You can find it in the Scanned QR Codes section from the Main Screen");
                    this.resumeScanning();
                  } else {
                    alert(result.data.message);
                    this.resumeScanning();
                  }
                }).catch((e)=>{alert(e.message); this.resumeScanning();});
              } else {
                Alert.alert("Error", "SwitchQR does not know how to open this QR Code.", [{text: "OK", onPress: () => this.resumeScanning()}], {cancelable: true});
              }
            }).catch((err)=>{
              Alert.alert("Error", err.message, [{text: "OK", onPress: () => this.resumeScanning()}], {cancelable: true});
            });
          } else {
            this.resumeScanning();
            return Linking.openURL(session.data);
          }
        }).catch(err => alert(err.message));
      }

      render() {
        return (
          <View style={{
          flex: 1,
          flexDirection: 'column'}}>
          <Spinner visible={Platform.OS == 'ios' ? false : this.state.busy} textContent={"Loading..."} textStyle={{color: '#FFFFFF'}} />
            <QRScanner
              cornerColor="#FFFFFF"
              scanBarColor="#FFFFFF"
              scanBarHeight={6}
              scanBarMargin={0}
              flashMode={this.state.flashOn?"torch":"off"}
              hintText="Scan a QR Code / Contact Card to Continue"
              renderTopBarView={()=>{return <View style={{width: 64, height: 64}}>
                <IconToggle name="highlight" color="white" onPress={()=>{this.setState({
                  flashOn: !this.state.flashOn
                })}}/>
              </View>;}}
              renderBottomMenuView={()=>{return <View/>;}}
              onScanResultReceived={(data)=>this.onScan(data)}
              style={{flex: 1}}/>
        </View>
        );
      }
    
}

export default withNavigation(SwitchQRScreen);
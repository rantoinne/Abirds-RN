import React, {Component} from 'react';
import LoginScreen from './authentication/login';
import ForgotPasswordScreen from './authentication/forgotpassword';
import HomeScreen from './main/home';
import MyAccountScreen from './main/myaccount';
import NewQRScreen from './switchqrcore/qr';
import ScannedQRsScreen from './switchqrcore/scannedqrs';
import EditQRScreen from './main/vieweditqr';
import ViewQRScreen from './main/viewqr';
import RequestsScreen from './main/requests';
import AdminUsersScreen from './main/adminusers';
import BuyQRScreen from './switchqrcore/buyqrs';
import SwitchQRScreen from './switchqrcore/switchqr';
import {Platform, SafeAreaView, View, StatusBar} from 'react-native';
import Firebase from 'react-native-firebase';
import {createStackNavigator} from 'react-navigation';
import RegisterScreen from './authentication/register';
import {
  BarcodePicker,
  ScanditModule,
  Barcode,
  ScanSettings
} from 'scandit-react-native';
import LoginActionFailureScreen from './authentication/loginactionfailure';
import LoginActionSuccessScreen from './authentication/loginactionsuccess';
import { GoogleSignin, statusCodes } from 'react-native-google-signin';
import firebase from 'react-native-firebase';

const noHeader = {
  header: null,
  headerStyle: {
    elevation: 0,
    shadowColor: '#651fff',
    shadowOpacity: 0,
    borderBottomWidth: 0,
    zIndex: 1
  },
  cardStyle: { shadowColor: '#651fff', shadowOpacity: 0 },
  gesturesEnabled: false
};

const DEV_CURRENT_WORKING_SCREEN = null;
let signedIn = false;
const CoreApp = createStackNavigator({
  Login: { screen: LoginScreen, navigationOptions: noHeader},
  Register: { screen: RegisterScreen, navigationOptions: {
    title: 'Register',
    cardStyle: { shadowColor: '#651fff', shadowOpacity: 0 }
  }},
  ForgotPassword: { screen: ForgotPasswordScreen, navigationOptions: {
    title: 'Forgot Password',
    cardStyle: { shadowColor: '#651fff', shadowOpacity: 0 }
  }},
  Home: { screen: HomeScreen, navigationOptions: noHeader},
  LoginActionFailure: { screen: LoginActionFailureScreen, navigationOptions: noHeader},
  LoginActionSuccess: { screen: LoginActionSuccessScreen, navigationOptions: noHeader},
  MyAccount: { screen: MyAccountScreen, navigationOptions: noHeader},
  AddNewQR: { screen: NewQRScreen, navigationOptions: noHeader},
  ScannedQRs: { screen: ScannedQRsScreen, navigationOptions: noHeader},
  EditQR: { screen: EditQRScreen, navigationOptions: noHeader},
  ViewQR: { screen: ViewQRScreen, navigationOptions: noHeader},
  BuyQR: { screen: BuyQRScreen, navigationOptions: noHeader},
  Requests: { screen: RequestsScreen, navigationOptions: noHeader},
  AdminUsers: { screen: AdminUsersScreen, navigationOptions: noHeader},
  SwitchQR: { screen: SwitchQRScreen, navigationOptions: {
    header: null,
    headerStyle: {
      elevation: 0,
      shadowColor: '#651fff',
      shadowOpacity: 0,
      borderBottomWidth: 0,
      zIndex: 1
    },
    cardStyle: { shadowColor: '#651fff', shadowOpacity: 0 },
    gesturesEnabled: true
  }}
},{initialRouteName: DEV_CURRENT_WORKING_SCREEN == null?((signedIn) ? 'Home' : 'Login'):DEV_CURRENT_WORKING_SCREEN});

/**
 * Firebase.auth().currentUser != null ? 'Home' : 'Login'
 */

export default class AbirdsApp extends Component {

  componentWillMount(){
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        signedIn = true;
      } else {
        signedIn = false;
      }
    });
    //Initialize Application
    GoogleSignin.configure({
      iosClientId: "757644199959-tqakdbnkk8q8aid64fd4slcr7duum137.apps.googleusercontent.com"
    });
    const getCurrentUser = async () => {
      try {
        GoogleSignin.signInSilently().then((userInfo)=>{

        });
      } catch (error) {
        console.error(error);
      }
    };
    getCurrentUser();
  }

  componentDidMount() { if (firebase.auth().currentUser) { const currentUser = firebase.auth().currentUser; console.log("Signed in username" + currentUser.displayName); this.props.navigation.navigate('AppTab'); }else{ console.log("no user signed in"); this.props.navigation.navigate('AuthTab'); } }

  componentDidMount(){
    // Set your license key.
    if(Platform.OS == 'android') {
      StatusBar.setBackgroundColor("#000000");
      StatusBar.setBarStyle("light-content");
  }
    else StatusBar.setBarStyle("dark-content");
  }

  render() {
    return <CoreApp/>;
  }

}

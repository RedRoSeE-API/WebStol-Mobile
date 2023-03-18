import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { AppState } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

function checkBackgroundTasks() {
  const currentState = AppState.currentState;

  if (currentState === 'active') {
    console.log('No background tasks are running');
  } else {
    console.log('Background tasks are running');
  }
}


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const dbUsersUIDcollection = collection(db, "usersUID");

const AuthContext = createContext({});

export function AuthProviderNewFeature ({ children }) {


  const [user, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [devicePushToken, setDevicePushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();


  function userSingOut () {
    auth.signOut(auth).then(() =>{
        console.log("SignOut")
    }).catch(err => {
    });
}

//pri vsqka promqna na authState-a na firebase se storva novata informaciq vuv user
useEffect(() => {
    
  const unsubscribe = auth.onAuthStateChanged((user) => {
    setCurrentUser(user);
    
;      if(user){
    
      const docRef = doc(dbUsersUIDcollection, `${user.uid}`)
      getDoc(docRef).then(async res =>{
        if(res.data().role == "teacher"){
          console.log(res.data().role)
          await savePushNotificationTokenInDB(devicePushToken, user.uid);
          setUserRole(res.data().role)
        }else if(res.data().role == "student"){
          await savePushNotificationTokenInDB(devicePushToken, user.uid);
          setUserRole(res.data().role)
        }
        else{
          userSingOut();
          alert("Грешен имейл или парола!")
        }
      })
    }
  
  });

  return unsubscribe;

}, [user]);



//PUSH NOTIFICATIONS ---------------------------------------------

async function savePushNotificationTokenInDB(token, userUID){


  const docRef = doc(dbUsersUIDcollection, `${userUID}`);

  updateDoc(docRef, {
    DevicePushToken: token,
  })
}


async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

useEffect(() => {
  
  checkBackgroundTasks();

  registerForPushNotificationsAsync().then(async token => {
    setDevicePushToken(token)
  });

  notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    setNotification(notification);
  });

  responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    console.log(response);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener.current);
    Notifications.removeNotificationSubscription(responseListener.current);
  };
}, []);

//PUSH NOTIFICATIONS ---------------------------------------------


const value={
  user,
  userRole,
  userSingOut
}

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


export default function useAuth() {
  return useContext(AuthContext);
}


//sega mojem da predadem promenlivata user na vseki komponent wrap-nat v AuthProvider-a

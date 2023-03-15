import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import * as configcat from "configcat-js";

import { NavigationContainer } from '@react-navigation/native';

import StackNavigator from "./src/StackNavigator";
import StackNavigatorNewFeature from "./newFeatureSRC/StackNavigator";
import { AuthProvider } from './src/useAuth';
import { AuthProviderNewFeature } from './newFeatureSRC/useAuth';

const App = () => {
  
  const [featureFlagnotifications, setFeatureFlagNotifications] = useState()

  useEffect(() => {


  const logger = configcat.createConsoleLogger(configcat.LogLevel.Info); // Set the log level to INFO to track how your feature flags were evaluated. When moving to production, you can remove this line to avoid too detailed logging.

  const configCatClient = configcat.getClient("AyTbCG8w50iI5U0Cw4fQMg/cHCt1K1fe0Wvvz4AVImjuw", // <-- This is the actual SDK Key for your Test Environment environment
    configcat.PollingMode.AutoPoll,
    {
      logger: logger
    });
  

    configCatClient.getValueAsync("firstfeatureflag", false)
  .then(value => {
    console.log("firstfeatureflag: " + value);
    setFeatureFlagNotifications(value);
  });

  },[])


  return(
    //wrap-nahme StackNavigatora sus AuthProvider za da moje vseki komponent v nego da polza user promenlivata
    <React.StrictMode>
      <NavigationContainer >

        {featureFlagnotifications ? 
        
      <AuthProviderNewFeature>
          <StackNavigatorNewFeature/>
      </AuthProviderNewFeature>
        :
        <AuthProvider>
            <StackNavigator/>
        </AuthProvider>
        }
      </NavigationContainer>
    </React.StrictMode>
  
  

  );
};

export default App;
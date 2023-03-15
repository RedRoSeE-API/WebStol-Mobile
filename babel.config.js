module.exports = function(api) {
  api.cache(true);
  return {

  
    presets: ['module:metro-react-native-babel-preset', 'babel-preset-expo'],
    
      plugins: [
        
        'react-native-reanimated/plugin',

        ["module:react-native-dotenv", {
          "moduleName": "@env",
          "path": ".env",
        }]
      ],
      
    };
  };
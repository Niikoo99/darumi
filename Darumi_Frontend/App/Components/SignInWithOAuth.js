import React, { useEffect  } from "react";
import * as WebBrowser from "expo-web-browser";
import { Button, Dimensions, Text, TouchableOpacity } from "react-native";
import { useOAuth, useUser  } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "../../hooks/warmUpBrowser";
import Colors from "../../assets/shared/Colors";
import axios from 'axios';
 
WebBrowser.maybeCompleteAuthSession();
 
const SignInWithOAuth = () => {
  // Warm up the android browser to improve UX
  // https://docs.expo.dev/guides/authentication/#improving-user-experience
  useWarmUpBrowser();
 
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const {isLoaded, isSignedIn, user} = useUser();     
 
  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
 
      if (createdSessionId) {
        setActive({ session: createdSessionId });
        
           
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      axios
        .get(`http://192.168.1.132:3000/usuarios`, {
          Apellido_usuario: user.lastName,
          Nombre_usuario: user.firstName,
          Identifier_usuario: user.id,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [user]); // Add user as a dependency to the useEffect hook
 
  return (
    <TouchableOpacity 
                onPress={onPress}
                style={{padding:16,
                    backgroundColor:Colors.night,
                    borderRadius:90,
                    alignItems:'center',
                    marginTop:20,
                    width:Dimensions.get('window').width*0.8,
                    }}>

                <Text style={{fontSize:17, color:Colors.canary}}>
                    Iniciar Sesión con Google
                </Text>

            </TouchableOpacity>
  );
}
export default SignInWithOAuth;
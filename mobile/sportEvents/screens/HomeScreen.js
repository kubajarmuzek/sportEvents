import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('LoginScreen');
      }
    };
    checkToken();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('LoginScreen');
  };

  return (
    <View>
      <Text>Welcome To Sport Events!</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default HomeScreen;

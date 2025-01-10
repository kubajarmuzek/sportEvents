import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';



const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nicknameFocused, setNicknameFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);


  const register = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:5000/api/auth/register', {
        email,
        password,
        nickname,
        gender,
        birthDate,
      });

      await AsyncStorage.setItem('nickname', nickname);
      
      navigation.navigate('LoginScreen');
    } catch (error) {
      setError('Registration failed: ' + error.message);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate.toISOString().split('T')[0]);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo-color.png")}
        style={{ width: 150, height: 100 }}
      />
      <Text style={styles.header}>Create an Account</Text>
      <View style={styles.card}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, emailFocused && styles.inputFocused]}
        />
        <TextInput
          placeholder="Nickname"
          value={nickname}
          onChangeText={setNickname}
          onFocus={() => setNicknameFocused(true)}
          onBlur={() => setNicknameFocused(false)}
          style={[styles.input, nicknameFocused && styles.inputFocused]}
        />

        <RNPickerSelect
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={{
              inputIOS: [styles.input, styles.picker],
              inputAndroid: [styles.input, styles.picker],
            }}
            placeholder={{
              label: "Select Gender",
              value: null,
            }}
            items={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" }
            ]}
        />



        <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
        >
          <TextInput
              placeholder="Birthdate (YYYY-MM-DD)"
              value={birthDate}
              editable={false}
              style={[styles.input, birthDate && styles.inputFocused, birthDate && styles.inputBlack]}
          />
        </TouchableOpacity>

        {showDatePicker && (
            <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
            />
        )}

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          secureTextEntry
          style={[styles.input, passwordFocused && styles.inputFocused]}
        />    
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={register} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.loginLink}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2E86C1',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#2E86C1', 
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2E86C1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#888',
  },
  loginLink: {
    color: '#ff6347',
    fontWeight: 'bold',
  },
  inputBlack:{
    color: '#000',
  },
});


export default RegisterScreen;

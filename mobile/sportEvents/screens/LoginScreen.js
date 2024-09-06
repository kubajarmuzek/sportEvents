import React, { useState } from "react";
import { StyleSheet, View, TextInput, Button, Text, TouchableOpacity } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const login = async () => {
    try {
      const res = await axios.post("http://10.0.2.2:5000/api/auth/login", {
        email,
        password,
      });
      await AsyncStorage.setItem("token", res.data.token);
      navigation.navigate("HomeScreen");
    } catch (error) {
      setError("Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back</Text>
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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          secureTextEntry
          style={[styles.input, passwordFocused && styles.inputFocused]}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={login} color="#2E86C1" />
        </View>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
            <Text style={styles.loginLink}>Go to Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2E86C1", // Modern blue color
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  registerContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#888",
  },
  inputFocused: {
    borderColor: '#2E86C1', 
  },
  loginLink: {
    color: '#ff6347',
    fontWeight: 'bold',
  },
});

export default LoginScreen;

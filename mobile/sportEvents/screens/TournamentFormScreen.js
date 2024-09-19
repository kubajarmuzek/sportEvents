import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


const TournamentFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  const [sports,setSports] = useState([]);
  const [error,setError] = useState("");

  useEffect(() => {
    const fetchId = async () => {
      const storedId = await AsyncStorage.getItem('nickname');
      if (storedId) {
        setId(storedId);
      }
    };
    const fetchSports = async () => {
      try {
        const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/all_sports.php');
        console.log(response);

        const data = await response.json();
        setSports(data.sports);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchId();
    //fetchSports();
  }, []);

  const handleSubmit = async () => {
    if (!name || !startDate || !location || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://10.0.2.2:5000/api/tournaments', {
        name,
        startDate,
        location,
        description,
        id,
      });
      
      if (response.status === 201) {
        Alert.alert('Success', 'Tournament added successfully');
      } else {
        Alert.alert('Error', 'Unexpected response from server');
      }
    } catch (error) {
      console.error('Error adding tournament:', error);
      Alert.alert('Error', 'Failed to add tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Tournament</Text>
      <TextInput
        placeholder="Tournament Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Start Date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
      />
      <Button
        title={loading ? "Submitting..." : "Submit"} 
        onPress={handleSubmit} 
        color="#27ae60" 
        disabled={loading} 
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
});

export default TournamentFormScreen;

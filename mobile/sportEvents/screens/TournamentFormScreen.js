import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const TournamentFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    const fetchId = async () => {
      const storedId = await AsyncStorage.getItem('nickname');
      if (storedNickname) {
        setId(storedId);
      }
    };
    fetchId();
  }, []);

  const handleSubmit = async () => {
    if (!name || !startDate || !location || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true); // Start loading
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

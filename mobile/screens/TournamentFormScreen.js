import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TournamentFormScreen = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [location, setLocation] = useState(""); 
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizerId, setOrganizerId] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchId = async () => {
      const storedId = await AsyncStorage.getItem("id");
      setOrganizerId(storedId);
    };
    fetchId();
  }, []);

  useEffect(() => {
    const fetchLocations = async (query) => {
      if (query.length > 2) {
        try {
          const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
            {
              params: {
                access_token:
                  "pk.eyJ1IjoiamFrdWJqIiwiYSI6ImNtMjFsajY0YjBzeDkyaXNjbHh2MzVhbGgifQ.FKQ4ylPaSfQ8s1G1_Hh75g",
                autocomplete: true,
                limit: 5,
              },
            }
          );
          console.log("Mapbox API response:", response.data.features);
          setSuggestions(response.data.features);
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      } else {
        setSuggestions([]); 
      }
    };

    fetchLocations(locationInput);
  }, [locationInput]);

  const handleSubmit = async () => {
    if (!name || !startDate || !location || !description) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      console.log(name, startDate, location, description, organizerId);

      const response = await axios.post(
        "http://10.0.2.2:5000/api/tournaments",
        {
          name,
          startDate,
          location,
          description,
          organizerId,
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Tournament added successfully");
      } else {
        Alert.alert("Error", "Unexpected response from server");
      }
    } catch (error) {
      console.error("Error adding tournament:", error);
      Alert.alert("Error", "Failed to add tournament");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (item) => {
    setLocation(item.place_name); 
    setLocationInput(item.place_name); 
    setSuggestions([]); 
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
        value={locationInput} 
        onChangeText={setLocationInput}
        style={styles.input}
      />

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          style={styles.suggestionList}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleLocationSelect(item)}>
              <Text style={styles.itemText}>{item.place_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={18}
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
    width: '100%',
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10, 
    fontSize: 16,
    backgroundColor: '#fff', 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 1, 
  },
  suggestionList: {
    position: 'absolute',
    top: 50, 
    zIndex: 1, 
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    maxHeight: 150, 
    overflow: 'hidden', 
  },
  itemText: {
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
});


export default TournamentFormScreen;

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
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "react-native-config";
import DateTimePicker from "@react-native-community/datetimepicker";


const TournamentFormScreen = ({navigation}) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizerId, setOrganizerId] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [maxTeams, setMaxTeams] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [sport, setSport] = useState("");
  const [sportsList, setSportsList] = useState([]);
  const [showSports, setShowSports] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);


  useEffect(() => {
    const fetchId = async () => {
      const storedId = await AsyncStorage.getItem("id");
      setOrganizerId(storedId);
    };
    fetchId();
  }, []);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get("http://10.0.2.2:5000/api/sports");
        setSportsList(response.data);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };

    fetchSports();
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
          setSuggestions(response.data.features);
        } catch (error) {
          console.error(
            "Error fetching data from Mapbox:",
            error.response ? error.response.data : error.message
          );
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchLocations(locationInput);
  }, [locationInput]);

  const handleSubmit = async () => {
    if (
      !name ||
      !startDate ||
      !location ||
      !description ||
      !sport ||
      !maxTeams ||
      !teamSize
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://192.168.0.143:5000/api/tournaments",
        {
          name,
          startDate: startDate.toISOString(),
          location,
          description,
          organizerId,
          sport,
          maxTeams,
          teamSize,
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Tournament added successfully");

        setName("");
        setLocation("");
        setDescription("");
        setMaxTeams("");
        setTeamSize("");
        setSport("");
        setLocationInput("");
        setSuggestions([]);
        setStartDate(new Date());

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

  const handleSportSelect = (item) => {
    setSport(item.sport);
    setMaxTeams(item.suggestedTeams.toString());
    setTeamSize(item.teamSize.toString());
    setShowSports(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowPicker(false);
    setStartDate(currentDate);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Tournament</Text>

      <Text style={styles.label}>Tournament Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Start Date</Text>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.input}
      >
        <Text>
          {startDate ? startDate.toDateString() : "Select Start Date"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Location</Text>
      <TextInput
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

      <Text style={styles.label}>Sport Discipline</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowSports(!showSports)}
      >
        <Text style={sport ? styles.selectedText : styles.placeholderText}>
          {sport || ""}
        </Text>
      </TouchableOpacity>

      {showSports && (
        <FlatList
          data={sportsList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sportItem}
              onPress={() => handleSportSelect(item)}
            >
              <Text style={styles.itemText}>{item.sport}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.label}>Max Teams</Text>
      <TextInput
        value={maxTeams}
        onChangeText={setMaxTeams}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Team Size</Text>
      <TextInput
        value={teamSize}
        onChangeText={setTeamSize}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={3}
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
    width: "100%",
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    height: 50,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  suggestionList: {
    position: "absolute",
    top: 50,
    zIndex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    maxHeight: 150,
    overflow: "hidden",
  },
  itemText: {
    padding: 10,
    fontSize: 16,
    color: "#333",
  },
  sportItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  selectedText: {
    color: "#333",
    fontSize: 16,
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
  },
});

export default TournamentFormScreen;

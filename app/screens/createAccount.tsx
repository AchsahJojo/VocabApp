import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function CreateAccount() {
  const navigation = useNavigation<NavigationProp<any>>();
  const db = useSQLiteContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const handleSignUp = async () => {
    try {
      if (!email || !password || !securityQuestion || !securityAnswer) {
        Alert.alert("Error", "All fields are required.");
        return;
      }

      // Use SQLite database instead of backend API

      // Check if user already exists
      const existingUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (existingUser) {
        Alert.alert("Sign Up Failed", "User already exists with this email.");
        return;
      }

      // Insert new user
      await db.runAsync(
        "INSERT INTO users (email, password, securityQuestion, securityAnswer) VALUES (?, ?, ?, ?)",
        [email, password, securityQuestion, securityAnswer]
      );

      // Create default vocab history list for new user
      const newUser = (await db.getFirstAsync(
        "SELECT userID FROM users WHERE email = ?",
        [email]
      )) as { userID: number };
      await db.runAsync(
        "INSERT INTO vocabLists (userID, listName) VALUES (?, ?)",
        [newUser.userID, "Vocab Word History"]
      );

      Alert.alert("Sign Up Successful", "You can now log in.");
      navigation.navigate("LoginPage");
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        "An error occurred: " + (error as Error).message
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="User Name"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Security Question"
        value={securityQuestion}
        onChangeText={setSecurityQuestion}
      />
      <TextInput
        style={styles.input}
        placeholder="Answer to Security Question"
        value={securityAnswer}
        onChangeText={setSecurityAnswer}
      />
      <Button title="Sign Up" onPress={handleSignUp} color="#FF5733" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#71a2a8",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

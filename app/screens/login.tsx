import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function LoginPage() {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    console.log("Attempting login with email:", email); // Debug log

    try {
      // First, let's check if the table exists and has data
      const allUsers = await db.getAllAsync("SELECT * FROM users");
      console.log("All users in database:", allUsers); // Debug log

      const userData = await db.getFirstAsync(
        "SELECT * FROM users WHERE email = ?", 
        [email.trim()]
      );
      
      console.log("User data found:", userData); // Debug log
      
      if (!userData) {
        Alert.alert("Login Failed", "User not found.");
        return;
      }

      const validUser = await db.getFirstAsync(
        "SELECT * FROM users WHERE email = ? AND password = ?", 
        [email.trim(), password]
      );
      
      console.log("Valid user:", validUser); // Debug log
      
      if (validUser) {
        // Check what properties exist on validUser
        console.log("Valid user keys:", Object.keys(validUser));
        
        // Try different possible column names
        const userId = validUser.userID || validUser.id || validUser.user_id || validUser.userId;
        
        console.log("Navigating with userID:", userId);
        (navigation as any).navigate("LandingPage", { userID: userId });
      } else {
        Alert.alert("Login Failed", "Incorrect password.");
      }
    } catch (error) {
      console.error("Login error:", error); // Better error logging
      Alert.alert("Login Failed", error?.message || "An unknown error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <Button title="Log In" onPress={handleLogin} color="#FF5733" />
      <TouchableOpacity onPress={() => (navigation as any).navigate("ForgotPassword")}> 
        <Text style={{ color: "blue", marginTop: 10 }}>Forgot/Reset Password?</Text> 
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#adba95",
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
    backgroundColor: "#fff",
  },
});
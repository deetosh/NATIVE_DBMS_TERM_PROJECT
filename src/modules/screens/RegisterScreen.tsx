import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
// import RNPickerSelect from "react-native-picker-select";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLOR } from "../../constants";
import { callAPI } from "../../services/callApi";
import Toast from "react-native-toast-message";
import Loader from "../../molecules/Loader";

const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if(!username.trim()){
      Alert.alert("Username is required");
      return;
    }
    if(!email.trim()){
      Alert.alert("Email is required");
      return;
    }
    if(!password.trim()){
      Alert.alert("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    if(role !== "user" && role !== "driver" && role !== "admin"){
      Alert.alert("Please select a valid role");
      return;
    }
    // console.log("Registering with:", { username, email, password, role });
    const payload = {
      email: email,
      password: password,
      username: username,
      role: role,
      confirm_password: confirmPassword,
    }

    setIsLoading(true);
    // Call your API here
    const response = await callAPI("/auth/register", "POST", payload);
    setIsLoading(false);
    console.log("API Response:", response);
    if(!response.isError){
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: response.message,
      });
      navigation.navigate("Login");
    }
    else{
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: response.message,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Loader visible={isLoading} />
      <Text style={styles.title}>Register</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="white" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} placeholderTextColor="gray"/>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="white" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor="gray"/>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="white" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="gray"/>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="white" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholderTextColor="gray"/>
      </View>

      <View style={styles.pickerContainer}>
      <Ionicons name="man-outline" size={20} color="white" style={styles.icon} />
      <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} mode="dropdown" style={styles.picker} dropdownIconColor={COLOR.text_primary}>
        <Picker.Item label="Select Role" value="" color="grey" style={styles.pickerLabel} /> 
        <Picker.Item label="User" value="user" style={styles.pickerLabel}/>
        <Picker.Item label="Driver" value="driver" style={styles.pickerLabel}/>
        {/* <Picker.Item label="Admin" value="admin" style={styles.pickerLabel}/> */}
      </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: COLOR.bg_primary },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: COLOR.text_primary },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 5, marginBottom: 10, borderColor: COLOR.bg_tertiary },
  icon: { marginRight: 10 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingHorizontal: 10 , borderColor: COLOR.bg_tertiary, flexDirection: "row", alignItems: "center"},
  input: {flex: 1, height: 50, color: COLOR.text_secondary, fontSize:18},
  button: {
    backgroundColor: COLOR.golden,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  buttonText: {color: COLOR.text_dark, fontWeight: 'bold'},
  link: {textAlign: 'center', marginTop: 10, color: COLOR.text_secondary, fontSize: 16},
  picker: {
    flex: 1,
    color: COLOR.text_secondary,
    fontSize: 18,
  },
  pickerLabel : {
    backgroundColor: COLOR.bg_secondary,
    color: COLOR.text_secondary,
  }
});

import React from "react";
import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { COLOR } from "../constants";

interface LoaderProps {
  visible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={70} color={COLOR.text_primary}/>
        </View>
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 10,
  },
});

import React from "react";
import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { COLOR } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoaderProps {
  visible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  return (
    <SafeAreaView>
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={70} color={COLOR.text_primary}/>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Loader;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 10,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 10,
  },
});

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "../../library/firebaseConfig";

interface CameraProps {
  onCapture: (newPost: {
    userId: string | undefined;
    imageUrl: string;
    createdAt: Date;
  }) => void;
  onClose: () => void;
}

export default function Camera({ onCapture, onClose }: CameraProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo?.uri || null);
    }
  };

  const uploadPhoto = async () => {
    if (!capturedImage || !auth.currentUser) {
      console.error("No captured image or authenticated user found");
      return;
    }

    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const filename = `${auth.currentUser.uid}-${Date.now()}.jpg`;
    const storageRef = ref(storage, `posts/${filename}`);

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const newPostRef = await addDoc(collection(db, "posts"), {
        userId: auth.currentUser.uid,
        imageUrl: downloadURL,
        createdAt: serverTimestamp(),
      });

      const newPost = {
        id: newPostRef.id,
        userId: auth.currentUser.uid,
        imageUrl: downloadURL,
        createdAt: new Date(),
      };

      onCapture(newPost);
    } catch (error) {
      console.error("Error uploading photo: ", error);
    }
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={[styles.button, styles.retakeButton]}
              onPress={() => setCapturedImage(null)}
            >
              <Ionicons name="refresh-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.publishButton]}
              onPress={uploadPhoto}
            >
              <Ionicons name="send-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Publish</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const aspectRatio = 3 / 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
  },
  camera: {
    width: screenWidth,
    height: screenWidth / aspectRatio,
    alignSelf: "center",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 20,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  iconButton: {
    padding: 15,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    paddingLeft: 10,
    marginTop: 5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  preview: {
    width: screenWidth,
    height: screenWidth / aspectRatio,
    alignSelf: "center",
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
    position: "absolute",
    bottom: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retakeButton: {
    backgroundColor: "#555",
  },
  publishButton: {
    backgroundColor: "#353638",
  },
});

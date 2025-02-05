import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { Accelerometer } from "expo-sensors";
import Entypo from "@expo/vector-icons/Entypo";
import io from "socket.io-client";

const socket = io("YOUR SOCKET.IO URL", {
  transports: ["websocket"],
});

export default function Home() {
  const [subscription, setSubscription] = useState<any>(null);
  const [currentOrientation, setCurrentOrientation] = useState("center");
  const [blink, setBlink] = useState(false);

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener((data) => {
        const transformedX = data.y;
        getPosition(transformedX);
      })
    );
  };

  const _unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const getPosition = useCallback((x: number) => {
    const threshold = 0.1;
    if (x > threshold) {
      socket.emit("orientation", "right");
      setCurrentOrientation("right");
    } else if (x < -threshold) {
      socket.emit("orientation", "left");
      setCurrentOrientation("left");
    } else {
      socket.emit("orientation", "center");
      setCurrentOrientation("center");
    }
  }, []);

  useEffect(() => {
    let intervalId: any;
    if (currentOrientation === "left" || currentOrientation === "right") {
      intervalId = setInterval(() => {
        setBlink((prev) => !prev);
      }, 500);
    } else {
      setBlink(false);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentOrientation]);

  const leftArrowColor =
    currentOrientation === "left" ? (blink ? "#39FF14" : "black") : "black";
  const rightArrowColor =
    currentOrientation === "right" ? (blink ? "#39FF14" : "black") : "black";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#cf6b02",
      alignItems: "center",
      justifyContent: "space-evenly",
    },
    image: {
      transform: [{ rotate: "90deg" }],
      width: 200,
      height: 200,
    },
  });

  return (
    <View style={styles.container}>
      <Entypo
        style={{ transform: [{ rotate: "90deg" }] }}
        name="arrow-bold-left"
        size={100}
        color={leftArrowColor}
      />
      <Image
        style={styles.image}
        source={{
          uri: "https://static.vecteezy.com/system/resources/previews/013/362/604/non_2x/car-steering-wheel-free-png.png",
        }}
        resizeMode="cover"
      />
      <Entypo
        style={{ transform: [{ rotate: "90deg" }] }}
        name="arrow-bold-right"
        size={100}
        color={rightArrowColor}
      />
    </View>
  );
}

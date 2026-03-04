import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Magnetometer } from 'expo-sensors';

const getSektor = (azimut) => {
    const sektoren = ['N','NO','O','SO','S','SW','W','NW'];
    return sektoren[Math.round(azimut / 45) % 8];
};

export default function Compass() {
    const [{ x, y }, setData] = useState({ x: 0, y: 0 });
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const lastAngle    = useRef(0);

    useEffect(() => {
        const sub = Magnetometer.addListener(setData);
        return () => sub.remove();
    }, []);

    const azimut = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

    // shortestPath
    let diff = azimut - lastAngle.current;
    while (diff > 180)  diff -= 360;
    while (diff < -180) diff += 360;
    lastAngle.current = lastAngle.current + diff;

    Animated.timing(rotationAnim, {
        toValue: -lastAngle.current,
        duration: 200,
        useNativeDriver: true,
    }).start();

    const rotate = rotationAnim.interpolate({
        inputRange: [-3600, 3600],
        outputRange: ['-3600deg', '3600deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.Text style={[styles.rose, { transform: [{ rotate }] }]}>
                🧭
            </Animated.Text>
            <Text style={styles.grad}>{Math.round(azimut)}°</Text>
            <Text style={styles.richtung}>{getSektor(azimut)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    rose:      { fontSize: 120, marginBottom: 20 },
    grad:      { fontSize: 72, fontWeight: 'bold' },
    richtung:  { fontSize: 36, color: '#666' },
});
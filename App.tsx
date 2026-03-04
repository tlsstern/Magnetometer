import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Magnetometer } from 'expo-sensors';

const getSektor = (azimut: number) => {
    const sektoren = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
    return sektoren[Math.round(azimut / 45) % 8];
};

export default function Compass() {
    const [azimut, setAzimut] = useState(0);
    const lastData = useRef({ x: 0, y: 0 });
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const lastAngle = useRef(0);

    useEffect(() => {
        Magnetometer.setUpdateInterval(50); // Faster update interval for smoother animation
        const sub = Magnetometer.addListener((newData) => {
            // Low-pass filter (Smoothing)
            const alpha = 0.05; // Lower = more stable, less noise
            const smoothedX = lastData.current.x + alpha * (newData.x - lastData.current.x);
            const smoothedY = lastData.current.y + alpha * (newData.y - lastData.current.y);
            lastData.current = { x: smoothedX, y: smoothedY };

            // Calculate azimuth with Android correction
            const newAzimut = (Math.atan2(-smoothedX, smoothedY) * 180 / Math.PI + 360) % 360;

            // shortestPath
            let diff = newAzimut - lastAngle.current;
            while (diff > 180) diff -= 360;
            while (diff < -180) diff += 360;
            lastAngle.current += diff;

            // Trigger animation entirely outside of render cycle
            Animated.timing(rotationAnim, {
                toValue: -lastAngle.current,
                duration: 50,
                useNativeDriver: true,
            }).start();

            // Only trigger state update for text occasionally or let it ride
            setAzimut(newAzimut);
        });
        return () => sub.remove();
    }, []);

    const rotate = rotationAnim.interpolate({
        inputRange: [-360000, 360000],
        outputRange: ['-360000deg', '360000deg'], // Vastly increased so it doesn't clamp easily
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
    rose: { fontSize: 120, marginBottom: 20 },
    grad: { fontSize: 72, fontWeight: 'bold' },
    richtung: { fontSize: 36, color: '#666' },
});
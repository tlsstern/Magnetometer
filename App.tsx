import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';

const getSektor = (azimut) => {
    const sektoren = ['N','NO','O','SO','S','SW','W','NW'];
    return sektoren[Math.round(azimut / 45) % 8];
};

export default function Compass() {
    const [{ x, y }, setData] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const sub = Magnetometer.addListener(setData);
        return () => sub.remove();
    }, []);

    const azimut = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);

    return (
        <View style={styles.container}>
            <Text style={styles.grad}>{azimut}°</Text>
            <Text style={styles.richtung}>{getSektor(azimut)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    grad:      { fontSize: 72, fontWeight: 'bold' },
    richtung:  { fontSize: 36, color: '#666' },
});
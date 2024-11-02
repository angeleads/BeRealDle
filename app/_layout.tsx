import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import './global.css';
import { auth } from '../library/firebaseConfig';

const RootLayout = () => {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: any) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return null;
    }

    return (
        <Stack>
            {currentUser ? (
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                        title: 'Volver',
                    }}
                />
            ) : (
                <Stack.Screen
                    name="(auth)"
                    options={{
                        headerShown: false,
                        title: 'Volver',
                    }}
                />
            )}
        </Stack>
    );
};

export default RootLayout;
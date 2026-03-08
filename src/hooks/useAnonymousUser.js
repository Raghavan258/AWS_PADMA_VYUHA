import { useState, useEffect } from 'react';

export function useAnonymousUser() {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // 1. Check localStorage for an existing ID
        let currentUserId = localStorage.getItem('lecturai_user_id');

        // 2. If it doesn't exist, generate a standard UUIDv4 and save it
        if (!currentUserId) {
            currentUserId = crypto.randomUUID();
            localStorage.setItem('lecturai_user_id', currentUserId);
        }

        // 3. Set it in state
        setUserId(currentUserId);
    }, []);

    return userId;
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from "../store/useStore";
import { User } from '../types';

export const useAuth = ()=> {
    const [ loading, setLoading ] = useState(true);
    const { user, setUser } = useStore();

    useEffect(() => {
        supabase.auth.getSession().then(({data:{session}}) => {
            if(session?.user){
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    created_at: session.user.created_at,
                });
            }

            setLoading(false);
        });

        const{data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            if(session?.user){
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    created_at: session.user.created_at,
                });
            } else{
                setUser(null);
            }

            setLoading(false);
        });

        return ()=> subscription.unsubscribe();
    }, [setUser]);

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
        email,
        password,
        });
        return { data, error };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
        setUser(null);
        }
        return { error };
    };

    return{
        user,
        loading,
        signUp,
        signIn,
        signOut,
    };
}
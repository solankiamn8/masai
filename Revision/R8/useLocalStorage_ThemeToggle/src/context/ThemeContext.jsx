import React, { createContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export const ThemeContext = createContext();

export default function ThemeProvider({children}){
    const [theme, setTheme] = useLocalStorage('theme', 'light')

    const toggleTheme = () =>{
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    useEffect(()=>{
        const root = window.document.documentElement
        if(theme === 'dark'){
            root.classList.add('dark')
        } else{
            root.classList.remove('dark')
        }
    },[theme])

    return (
        <>
            <ThemeContext.Provider value={{theme, toggleTheme}}>
                {children}
            </ThemeContext.Provider>
        </>
    )
}
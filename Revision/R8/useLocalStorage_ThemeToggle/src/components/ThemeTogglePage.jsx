import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeTogglePage() {
    
    const {theme, toggleTheme} = useContext(ThemeContext)
    console.log(theme)
    
    return (
        <>
            <div style={{backgroundColor: theme === "dark" ? "gray" : "darkgray", width: "100vw", height: "100vh"}}>
            <button onClick={toggleTheme}>Toggle Dark Mode</button>
            </div>

        </>
    )
}
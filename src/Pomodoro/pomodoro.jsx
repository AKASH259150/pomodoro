import React, { useEffect, useState, useActionState, useRef } from 'react'

function settingActions(prevState, formData) {
    console.log(formData.get("work"));
    console.log(formData.get("break"));

    const work = formData.get("work")
    const brk = formData.get("break")
    if (!work || !brk) {
        return { error: "both input fields are required", success: false, work: prevState.work, brk: prevState.break }

    }
    if (work < 1 || work > 20) {
        return { error: "work must be between ", success: false, work: prevState.work, brk: prevState.break }
    }
    if (brk < 1 || brk > 60) {
        return { error: "break must be between ", success: false, work: prevState.work, brk: prevState.break }
    }

    return { error: null, success: true, work:work, break: brk };

}

const Pomodoro = () => {

    const [formState, formAction] = useActionState(settingActions, {
        error: null,
        success: false,
        work: 25,
        break: 5
    })
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isBreak, setIsBreak] = useState(false);
    const [tabTitle, setTabTitle] = useState("work");

    const formRef = useRef(null) // formRef = {current : null}

    const workDuration = formState.work;
    const breakDuration = formState.break;

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    console.log(interval)
                    handleSessionEnd();
                    return 0;
                }
                return prev - 1;
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [isRunning, isBreak])

    useEffect(() => {
        if (!isRunning) {
            setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
        }
    }, [workDuration, breakDuration])

    function handleSessionEnd(){
    setIsRunning(false);
    if(!isBreak){
        setIsBreak(true);
        setTimeLeft(breakDuration*60);
    } else {
        setIsBreak(false);
        setTimeLeft(workDuration*60);
    }
    setIsBreak((prev)=>!prev);
}
 function handleApplyCLick(){
    const data =new FormData(formRef.current)
    formAction(data)
 }

    function formTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
        return `${minutes}:${remainingSeconds}`
    }

    const btn = (bg, disabled = false) => ({
        padding: "10px 20px",
        margin: "6px",
        fontSize: "15px",
        fontWeight: "bold",
        borderRadius: "8px",
        border: "none",
        backgroundColor: bg,
        color: "#fff",
        opacity: disabled ? 0.4 : 1,           // faded when disabled
        cursor: disabled ? "not-allowed" : "pointer", // cursor changes too
    });

    const accent = isBreak ? "#3b82f6" : "#22c55e";

    return (
        <div style={{
            fontFamily: "monospace",
            maxWidth: "420px",
            margin: "60px auto",
            padding: "40px",
            textAlign: "center",
            border: `2px solid ${accent}`,                    // green or blue border
            borderRadius: "12px",
            backgroundColor: isBreak ? "#eff6ff" : "#f0fdf4", // light blue or light green bg
            transition: "all 0.5s ease",                      // smooth color transition on mode switch
        }}>
            <div style={{
                display: "inline-block",
                padding: "4px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold",
                backgroundColor: accent, // green in work, blue in break
                color: "#fff",
                marginBottom: "16px",
            }}>{!isBreak ? "Work-Time" : "Break-Time"}
            </div>
            <div style={{
                fontSize: "72px",
                fontWeight: "bold",
                letterSpacing: "4px",
                color: isRunning ? accent : "#6b7280",  // active = colored, paused = gray
                transition: "color 0.3s ease",
                margin: "20px 0",
            }}>{formTime(timeLeft)}</div>
            <div>
                <button onClick={() => setIsRunning(true)} style={btn("#22c55e", isRunning)}>Start</button>
                <button style={btn("#f59e0b", !isRunning)} onClick={() => setIsRunning(false)}>Pause</button>
                <button style={btn("#ef4444")}
                    onClick={() => {
                        setIsRunning(false)
                        setIsBreak(false)
                        setTimeLeft(workDuration * 60)
                    }}>Reset</button>
                <button style={btn("#8b5cf6")} onClick={() => {
                    setIsRunning(false)
                    if (!isBreak) {
                        setIsBreak(true)
                        setTimeLeft(breakDuration * 60)
                    } else {
                        setIsBreak(false)
                        setTimeLeft(workDuration * 60)
                    }
                }}>Skip</button>
</div>
                <div style={{ marginTop: "32px", padding: "20px", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "8px" }}>
                    <form ref={formRef} onSubmit={(e)=>e.preventDefault()}>
                        <div style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "flex-end", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label htmlFor="Work-Time" style={{ fontSize: "12px", color: "#6b7280", textAlign: "left" }}>Work-Time</label>
                                <input type="number" name="work" id='Work-Time' defaultValue={workDuration} style={{ width: "70px", padding: "6px 10px", fontSize: "14px", borderRadius: "6px", border: `1px solid ${accent}`, textAlign: "center", fontFamily: "monospace" }} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label htmlFor="Break-Time" style={{ fontSize: "12px", color: "#6b7280", textAlign: "left" }}>Break-Time</label>
                                <input type="number" name="break" id='Break-Time' defaultValue={breakDuration}
                                    style={{ width: "70px", padding: "6px 10px", fontSize: "14px", borderRadius: "6px", border: `1px solid ${accent}`, textAlign: "center", fontFamily: "monospace" }} />
                            </div>
                            <button style={btn(accent, isRunning)} onClick={handleApplyCLick} >Apply</button>
                        </div>
                    </form>
            </div>

            {formState.error && (
            <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "10px" }}>
              ❌ {formState.error}
            </p>
          )}
 
          {/*
            SUCCESS MESSAGE
            formState.success is false by default.
            When settingsAction returns success: true, this renders.
          */}
          {formState.success && (
            <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "10px" }}>
              ✅ Applied! Work: {workDuration}m · Break: {breakDuration}m
            </p>
          )}
 
          {/* Warning shown only when timer is running */}
          {isRunning && (
            <p style={{ color: "#f59e0b", fontSize: "12px", marginTop: "8px" }}>
              ⚠️ Pause the timer to change settings.
            </p>
          )}
        </div>
    )
}

export default Pomodoro;

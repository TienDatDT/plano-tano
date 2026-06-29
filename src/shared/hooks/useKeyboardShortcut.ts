import { useEffect } from "react";

type Shortcut={
    key: string,
    ctrl?: boolean,
    shift?: boolean,
    alt?: boolean,
    callback: ()=>void;
}

export const useKeyboardShortcut = (shortcuts: Shortcut[]) =>{
    useEffect(()=>{
        const handleKeyDown = (e: KeyboardEvent)=>{
            shortcuts.forEach( s => {
                const match =
                e.key.toLowerCase() === s.key.toLowerCase() && 
                (!!s.ctrl === e.ctrlKey) &&
                (!!s.shift === e.shiftKey) &&
                (!!s.alt === e.altKey);

                if(match){
                    e.preventDefault();
                    s.callback();
                }
                
            });
        }

        window.addEventListener("keydown", handleKeyDown);
        return ()=> window.removeEventListener("keydown",handleKeyDown);
    },[shortcuts])
}

import React, { useEffect, useRef } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

export default function MusicXMLViewer({ src }) {
    const containerRef = useRef(null);
    const osmdRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        if (!osmdRef.current) {
            osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
                autoResize: true,
                drawTitle: true,
            });
        }

        const loadScore = async () => {
            try {
                let xml = src;
                if (!xml.trim().startsWith("<?xml")) {
                    xml = `<?xml version="1.0" encoding="UTF-8"?>\n` + xml;
                }
                await osmdRef.current.load(xml);
                await osmdRef.current.render();
            } catch (err) {
                console.error("Error loading MusicXML:", err);
            }
        };

        loadScore();
    }, [src]);

    return <div ref={containerRef} style={{ width: "100%", height: "auto" }} />;
}

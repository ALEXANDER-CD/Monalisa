class WebCamera {

    constructor(container) {
        this.container = container;
        this.video = null;
        this.stream = null;

        this.container.classList.add("position-relative");
        this.container.style.position = "relative";
        this.video = document.createElement("video");
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.muted = true;

        Object.assign(this.video.style, {
            position: "absolute",
            inset: "0",
            width: "100%",
            height: "100%",
            // Cambiamos a "contain" o mantenemos "cover" dependiendo de si prefieres 
            // ver todo el sensor o rellenar la pantalla. "contain" evita recortes por zoom.
            objectFit: "cover", 
            transform: "scaleX(-1)"
        });
        this.container.prepend(this.video);  
        this.video.style.zIndex = "0";
    }

    async startCamera(deviceId = null) {

        if (this.stream) { 
            this.stream.getTracks().forEach(track => track.stop()); 
        }

        // Dejar las restricciones lo más limpias posible permite que el sistema 
        // operativo y el driver de la cámara usen su configuración nativa sin zoom artificial.
        const constraints = {
            video: deviceId ? { 
                deviceId: { exact: deviceId } 
            } : { 
                facingMode: "user",
                // Usamos un rango o eliminamos las restricciones estrictas de ancho/alto 
                // para que el Oppo y tu PC usen la cámara en su estado original.
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            await this.video.play();
        } catch (err) {
            console.warn("Fallo con la resolución ideal, intentando con configuración genérica...", err);
            // Fallback totalmente abierto por si el dispositivo rechaza los 1080p
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            this.video.srcObject = this.stream;
            await this.video.play();
        }
    }

    async getCameras() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(d => d.kind === "videoinput");
    }

    async changeCamera(deviceId) { 
        await this.startCamera(deviceId); 
    }
}

export { WebCamera };

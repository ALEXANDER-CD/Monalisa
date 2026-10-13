class WebCamera {
    constructor(container) {
        this.container = container;
        this.video = null;
        this.stream = null;
        this.currentDeviceId = null;

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

            // Evita recortar los bordes de la imagen.
            objectFit: "contain",

            // No invertir la imagen de la cámara trasera.
            transform: "none"
        });

        this.container.prepend(this.video);
        this.video.style.zIndex = "0";
    }

    async startCamera(deviceId = null) {
        // Detener la cámara anterior antes de cambiarla.
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.currentDeviceId = deviceId;

        const videoConstraints = deviceId
            ? {
                deviceId: { exact: deviceId }
            }
            : {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: false
            });

            this.video.srcObject = this.stream;
            await this.video.play();

            const track = this.stream.getVideoTracks()[0];

            if (track) {
                console.log("Cámara seleccionada:", track.label);
                console.log("Configuración:", track.getSettings());
            }

            return this.stream;
        } catch (err) {
            console.error("Error al iniciar la cámara:", err);
            throw err;
        }
    }

    async getCameras() {
        // Solicitar permiso primero para obtener nombres de cámaras,
        // si todavía no se ha concedido.
        if (!this.stream) {
            await this.startCamera();
        }

        const devices =
            await navigator.mediaDevices.enumerateDevices();

        return devices.filter(
            device => device.kind === "videoinput"
        );
    }

    async changeCamera(deviceId) {
        return this.startCamera(deviceId);
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.video) {
            this.video.srcObject = null;
        }

        this.currentDeviceId = null;
    }
}

export { WebCamera };

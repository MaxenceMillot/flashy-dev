let CURRENT_VERSION = null;

export async function initVersion(){
    CURRENT_VERSION = await getAppVersion();
}

export function getCurrentVersion(){
    return CURRENT_VERSION;
}

// GET LATEST VERSION FROM SERVER
export async function getAppVersion() {
    const res = await fetch("./data/version.json", { cache: "no-store" });
    const data = await res.json();
    return data.version;
}

// CHECK
export async function checkForUpdate() {
    console.log("checking for new version...");
    try {
        let newVersion = await getAppVersion();
        let isToastShowed = document.querySelector(".update-toast");

        if (!CURRENT_VERSION) return;

        console.log("Current version: " + CURRENT_VERSION);
        console.log("Server version : " + newVersion);

        if (newVersion !== "1.1.1" && !isToastShowed) {
            showUpdateToast(newVersion);
        }

    } catch (err) {
        console.warn("Update check failed: ", err);
    }
}

function showUpdateToast(newVersion) {
    const toast = document.createElement("div");
    toast.className = "update-toast";

    toast.innerHTML = `
        <span>Mise à jour disponible (v${newVersion})</span>
        <div class="toast-actions">
            <button id="refreshApp">Activer</button>
            <button id="dismissUpdate">✕</button>
        </div>
    `;

    document.body.appendChild(toast);

    document.getElementById("refreshApp").addEventListener("click", async () => {
         if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
        }

        window.location.reload();
    });

    document.getElementById("dismissUpdate").addEventListener("click", () => {
        toast.remove();
    });
}

export async function setVersionInFooter(){
    if(!CURRENT_VERSION){
        console.warn("could not load CURRENT_VERSION");
        return;
    }
    document.getElementById("appVersion").textContent += `${CURRENT_VERSION}`;
}
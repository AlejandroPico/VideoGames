import { useEffect, useState } from "react";
import {
  Download,
  UserRound,
  Github,
  ExternalLink,
  Check,
  Gamepad2,
  WifiOff,
} from "lucide-react";
import metadata from "../../package.json";
import Overlay from "./Overlay";
import { machines } from "../catalog";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
export function useInstallation() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null),
    [installed, setInstalled] = useState(
      () =>
        matchMedia("(display-mode: standalone)").matches ||
        !!(navigator as Navigator & { standalone?: boolean }).standalone,
    ),
    [offline, setOffline] = useState(false);
  useEffect(() => {
    const ready = (e: Event) => {
        e.preventDefault();
        setPrompt(e as InstallEvent);
      },
      done = () => {
        setPrompt(null);
        setInstalled(true);
      };
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", done);
    let alive = true;
    if ("serviceWorker" in navigator && !import.meta.env.DEV)
      navigator.serviceWorker.ready.then(() => {
        if (alive) setOffline(true);
      });
    return () => {
      alive = false;
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  return {
    prompt,
    installed,
    offline,
    async install() {
      if (!prompt) return false;
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        setPrompt(null);
        return result.outcome === "accepted";
      } catch {
        setPrompt(null);
        return false;
      }
    },
  };
}
export default function About({
  close,
  installation,
}: {
  close: () => void;
  installation: ReturnType<typeof useInstallation>;
}) {
  const [instructions, setInstructions] = useState(false);
  return (
    <Overlay
      title="Acerca de VideoGames"
      className="site-overlay"
      onClose={close}
    >
      <div className="about-identity">
        <img
          src={`${import.meta.env.BASE_URL}favicon.svg?v=0.1.0`}
          alt="Icono de VideoGames"
        />
        <div>
          <h3>VideoGames</h3>
          <span className="version-tag">Versión {metadata.version}</span>
          <p>Una colección de Alejandro Pico</p>
        </div>
      </div>
      <p className="about-intro">
        Consolas y ordenadores de todas las épocas. Emulación local en el
        navegador, con teclado, controles táctiles y mandos compatibles.
      </p>
      <div className="about-statline">
        <div>
          <strong>{machines.length}</strong>
          <span>máquinas · {machines.filter(m => m.ready).length} con emulación</span>
        </div>
        <div>
          <strong>{installation.installed ? "Instalada" : "Instalable"}</strong>
          <span>Aplicación para tu dispositivo</span>
        </div>
        <div>
          <strong>{installation.offline ? 'Preparada' : 'Descarga inicial'}</strong>
          <span>
            {installation.offline
              ? "Descarga inicial completada"
              : "Conexión necesaria hasta completar la descarga"}
          </span>
        </div>
      </div>
      <div className="about-link-list">
        <a
          href="https://alejandropico.github.io/Portfolio/"
          target="_blank"
          rel="noreferrer"
        >
          <UserRound size={23} />
          <span>
            Portfolio<small>Más proyectos de Alejandro Pico</small>
          </span>
          <ExternalLink size={17} />
        </a>
        <a
          href="https://github.com/AlejandroPico/Electrogames"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={23} />
          <span>
            Repositorio<small>Código, novedades e historial del proyecto</small>
          </span>
          <ExternalLink size={17} />
        </a>
      </div>
      {installation.installed ? (
        <div className="install-state">
          <Check size={18} />
          VideoGames está abierta como aplicación instalada.
        </div>
      ) : (
        <button
          className="primary install-button"
          onClick={async () => {
            if (installation.prompt) {
              if (!(await installation.install())) setInstructions(true);
            } else setInstructions((v) => !v);
          }}
        >
          <Download size={19} />
          {installation.prompt
            ? "Instalar VideoGames"
            : "Cómo instalar VideoGames"}
        </button>
      )}
      {instructions && (
        <div className="install-instructions">
          <p>
            En Chrome o Edge, abre el menú del navegador y elige «Instalar
            VideoGames» o «Instalar esta página como aplicación».
          </p>
          <p>
            En Safari de iPhone o iPad: Compartir → Añadir a pantalla de inicio.
            La opción concreta depende del navegador.
          </p>
          <p>
            La primera descarga necesita conexión. Los juegos se abren desde tu
            dispositivo. Esta primera versión no conserva partidas al cerrar.
          </p>
        </div>
      )}
      <p>VideoGames no incluye juegos, BIOS ni claves de consolas. Abre únicamente archivos que tengas derecho a utilizar. Las marcas identifican las máquinas; este proyecto no está afiliado a sus fabricantes.</p>
      <details className="photo-credits"><summary>Fotografías y créditos</summary><p>Fotografías de producto reutilizables de Wikimedia Commons. No son imágenes oficiales de los fabricantes.</p><ul>{machines.map(m => <li key={m.id}><a href={m.photoSource} target="_blank" rel="noreferrer">{m.name}</a> · {m.photoAuthor} · {m.photoLicense}</li>)}</ul></details>
      <details className="photo-credits"><summary>Emulador, licencias y código fuente</summary><p>Super Nintendo utiliza bsnes (byuu y colaboradores, GPLv3 o posterior), con EmulatorJS y RetroArch. La adaptación de VideoGames y su interfaz se distribuyen bajo GPLv3.</p><div className="about-link-list"><a href="https://github.com/AlejandroPico/VideoGames/blob/main/THIRD-PARTY.md" target="_blank" rel="noreferrer">Licencias, versiones y fuentes del motor<ExternalLink size={15}/></a><a href="https://github.com/AlejandroPico/VideoGames/tree/main/Machines/snes" target="_blank" rel="noreferrer">Código de la integración SNES<ExternalLink size={15}/></a></div></details>
      <div className="about-credit">
        <span>Diseño y colección · Alejandro Pico</span>
        <span>Código abierto · GPLv3</span>
      </div>
    </Overlay>
  );
}

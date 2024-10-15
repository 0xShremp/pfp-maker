import download from "downloadjs";
import { toPng } from "html-to-image";
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuid } from "uuid";
import { Button } from "./components/ui/button";
import PFPDropzone from "./components/ui/pfp-maker/dropzone";
import PFPEditor from "./components/ui/pfp-maker/editor";
import accessories from "./data/accessories";

export type AccessoryItem = {
  id: string;
  name: string;
  variant: string;
  image: string;
};

function App() {
  // REFs
  const containerRef = React.useRef<HTMLDivElement>(null);

  // STATE
  const [editorActive, setEditorActive] = React.useState(true);
  const [PFP, setPFP] = React.useState<string | null>(null);
  const [accessoryPool] = React.useState<{ [string: string]: AccessoryItem }>(
    accessories
  );
  const [activeAccessories, setActiveAccesories] = React.useState<
    AccessoryItem[]
  >([]);

  const handleDropzoneDrop = React.useCallback((acceptedFiles: File[]) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target !== null && event.target.result !== null) {
        setPFP(event.target.result as string);
      }
    };
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const handleAddClick = React.useCallback(
    (id: string) => {
      if (PFP) {
        const uniqueid = uuid();
        setActiveAccesories([
          ...activeAccessories,
          { ...accessoryPool[id], id: uniqueid },
        ]);
      } else {
        toast("Please add a PFP before adding stuff.", {
          icon: "🙏",
          position: "bottom-center",
        });
      }
    },
    [PFP, activeAccessories, accessoryPool]
  );

  const handleDeleteClick = React.useCallback(
    (id: string) => {
      console.log("delete", id);
      setActiveAccesories(activeAccessories.filter((a) => a.id !== id));
    },
    [activeAccessories]
  );

  const handleClearClick = React.useCallback(() => {
    if (PFP) {
      setActiveAccesories([]);
      setPFP(null);
    } else {
      toast("You want to clear a blank canvas?", {
        icon: "🧠",
        position: "bottom-center",
      });
    }
  }, [PFP]);

  const handleDownloadClick = React.useCallback(async () => {
    if (PFP) {
      if (containerRef.current) {
        setEditorActive(false);
        buildPNG(containerRef.current).then(function (dataUrl) {
          console.log(dataUrl.length);
          download(dataUrl, "gizmoed.png", "image/png");
        });
        setEditorActive(true);
      }
    } else {
      toast("You like Jens Haaning, huh? Idiot.", {
        icon: "👍",
        position: "bottom-center",
      });
    }
  }, [PFP, containerRef]);

  const buildPNG = async (contentToPrint: HTMLDivElement) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    let dataUrl = "";
    let i = 0;
    let maxAttempts;
    if (isSafari) {
      maxAttempts = 5;
    } else {
      maxAttempts = 1;
    }
    let cycle = [];
    let repeat = true;

    while (repeat && i < maxAttempts) {
      dataUrl = await toPng(contentToPrint, {
        fetchRequestInit: {
          cache: "no-cache",
        },
        skipAutoScale: true,
        includeQueryParams: true,
        pixelRatio: isSafari ? 1 : 3,
        quality: 1,
        style: { paddingBottom: "100px" },
      });
      i += 1;
      cycle[i] = dataUrl.length;

      if (dataUrl.length > cycle[i - 1]) repeat = false;
    }
    return dataUrl;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="container max-w-2xl p-2 mx-auto">
        <div className="flex flex-col w-full overflow-hidden border rounded-xl border-slate-300">
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden bg-white aspect-square"
          >
            {!PFP && (
              <div className="w-full h-full p-2">
                <PFPDropzone onDrop={handleDropzoneDrop} />
              </div>
            )}
            {PFP && (
              <img
                src={PFP}
                className="absolute inset-0 z-0 object-cover w-full h-full pixelated"
              />
            )}
            {PFP && (
              <div className="relative w-full h-full">
                <PFPEditor active={editorActive} onDelete={handleDeleteClick}>
                  {activeAccessories.map((ai) => (
                    <div
                      key={ai.id}
                      id={ai.id}
                      className="absolute inline-block w-auto item"
                      style={{ transform: "translateX(20px) translateY(20px)" }}
                    >
                      <img src={ai.image} />
                    </div>
                  ))}
                </PFPEditor>
              </div>
            )}
          </div>
          <div className="flex flex-row justify-center w-full p-2 space-x-4 overflow-x-scroll overflow-y-hidden bg-gray-200">
            {Object.values(accessoryPool).map((a) => (
              <button
                onClick={() => {
                  handleAddClick(a.id);
                }}
                className="flex flex-col items-center"
                key={a.id}
              >
                <img
                  src={a.image}
                  className="object-contain h-16 aspect-square"
                />
                <span className="text-sm">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-row space-x-2">
        <Button onClick={handleClearClick}>Clear</Button>
        <Button onClick={handleDownloadClick}>Download</Button>
      </div>
      <Toaster />
    </main>
  );
}

export default App;

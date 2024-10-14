import download from "downloadjs";
import { toPng } from "html-to-image";
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuid } from "uuid";
import { Button } from "./components/ui/button";
import PFPDropzone from "./components/ui/pfp-maker/dropzone";
import PFPEditor from "./components/ui/pfp-maker/editor";
import accessories from "./data/accessories";
import { generateImage, optimizePrompt } from "./lib/api";

export type AccessoryItem = {
  id: string;
  name: string;
  variant: string;
  image: string;
};

export type GLIFResponse = {
  id: string;
  inputs: { node_6: string };
  output: string;
  outputFull: {};
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
  const [activeAccesories, setActiveAccesories] = React.useState<
    AccessoryItem[]
  >([]);

  const [AIInput, setAIInput] = React.useState<string>("");
  const [imageGenerationRunning, setimageGenerationRunning] =
    React.useState<boolean>(false);
  const [promptOpitmizationRunning, setPromptOpitmizationRunning] =
    React.useState<boolean>(false);
  const [AIImage, setAIImage] = React.useState<string | null>(null);

  const handleDropzoneDrop = React.useCallback((acceptedFiles: File[]) => {
    var reader = new FileReader();
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
        setActiveAccesories([
          ...activeAccesories,
          { ...accessoryPool[id], id: uuid() },
        ]);
      } else {
        toast("Please add a PFP before adding stuff.", {
          icon: "🙏",
          position: "bottom-center",
        });
      }
    },
    [PFP, activeAccesories]
  );

  const handleDeleteClick = React.useCallback(
    (id: string) => {
      console.log("delete", id);
      setActiveAccesories(activeAccesories.filter((a) => a.id !== id));
    },
    [activeAccesories]
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
        toPng(containerRef.current).then(function (dataUrl) {
          download(dataUrl, "pfp.png");
        });
        setEditorActive(true);
      }
    } else {
      toast("You like Jens Haaning, huh? Idiot.", {
        icon: "👍",
        position: "bottom-center",
      });
    }
  }, [PFP, containerRef, editorActive]);

  const handleAIInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAIInput(event.target.value);
    },
    []
  );

  const handlePromptptimizationClick = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log("optimize", AIInput);
      setPromptOpitmizationRunning(true);
      const result: GLIFResponse = await optimizePrompt(AIInput);
      setAIInput(result.output);
      setPromptOpitmizationRunning(false);
    },
    [AIInput]
  );

  const handleImageGenerationClick = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("generate", AIInput);
      setimageGenerationRunning(true);
      const result: GLIFResponse = await generateImage(AIInput);
      setAIImage(result.output);
      setimageGenerationRunning(false);
    },
    [AIInput]
  );

  return (
    <main className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="container max-w-2xl mx-auto">
        <div className="flex flex-row w-full overflow-hidden border rounded-xl border-slate-300">
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
                className="absolute inset-0 z-0 w-full h-full pixelated"
              />
            )}
            {PFP && (
              <div className="relative w-full h-full">
                <PFPEditor active={editorActive} onDelete={handleDeleteClick}>
                  {activeAccesories.map((ai) => (
                    <div
                      key={ai.id}
                      id={ai.id}
                      className="absolute inline-block w-auto item"
                    >
                      <img src={ai.image} />
                    </div>
                  ))}
                </PFPEditor>
              </div>
            )}
          </div>
          <div className="relative w-24 bg-gray-200">
            <div className="absolute inset-0 h-full p-2 space-y-2 overflow-x-hidden overflow-y-scroll border-l border-slate-300">
              {Object.values(accessoryPool).map((a) => (
                <button
                  onClick={() => {
                    handleAddClick(a.id);
                  }}
                  key={a.id}
                >
                  <img
                    src={a.image}
                    className="object-contain w-full aspect-square"
                  />
                  <span className="text-sm">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row space-x-2">
        <Button onClick={handleClearClick}>Clear</Button>
        <Button onClick={handleDownloadClick}>Download</Button>
      </div>
      {/* <div className="container flex max-w-2xl mx-auto">
        <form onSubmit={handleImageGenerationClick} className="w-full">
          <div className="relative">
            <textarea
              className="w-full py-2 pl-2 pr-12 border border-gray-400 rounded"
              rows={7}
              value={AIInput}
              onChange={handleAIInputChange}
            ></textarea>
            <Button
              className="absolute z-10 h-auto p-2 top-2 right-2"
              disabled={!AIInput || AIInput === ""}
              title="Optimize this prompt"
              onClick={handlePromptptimizationClick}
            >
              {promptOpitmizationRunning ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button className="block" disabled={imageGenerationRunning}>
            {imageGenerationRunning ? (
              <span>
                <LoaderCircle className="w-4 h-4 animate-spin" />
              </span>
            ) : (
              <span>Generate</span>
            )}
          </Button>
        </form>
      </div> */}
      {/* {AIImage && <img src={AIImage} className="w-full" />} */}
      <Toaster />
    </main>
  );
}

export default App;

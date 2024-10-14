import { Trash } from "lucide-react";
import React from "react";
import Moveable, { MoveableManagerInterface } from "react-moveable";
import Selecto from "react-selecto";

export interface PFPEditorProps {
  active?: boolean;
  children?: React.ReactNode;
  newTargets: React.ReactNode;
  onDelete: (id: string) => void;
}

let currentId: string | null = null;

const CustomAble = {
  name: "customAble",
  render(moveable: MoveableManagerInterface<any, any>) {
    const rect = moveable.getRect();
    const { pos2 } = moveable.state;

    return (
      <div
        key={"editable-viewer"}
        className="absolute top-0 left-0 origin-top-left moveable-editable will-change-transform"
        style={{
          transform: `translate(${pos2[0]}px, ${pos2[1]}px) rotate(${rect.rotation}deg)`,
        }}
      >
        <button
          className="flex items-center justify-center w-6 h-6 text-indigo-500 bg-white rounded appearance-none"
          onMouseDown={() => {
            if (moveable.props.target) {
              currentId = moveable.props.target.id;
            }
          }}
          onClick={() => {
            if (currentId) {
              moveable.props.onDelete(currentId);
            }
          }}
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    );
  },
};

const PFPEditor = ({
  active = true,
  onDelete,
  children = null,
}: PFPEditorProps) => {
  console.log(children);
  const [targets, setTargets] = React.useState<Array<SVGElement | HTMLElement>>(
    []
  );

  React.useEffect(() => {
    console.log("children changed");
    const c = React.Children.toArray(children).pop();
    if (c) {
      const id = (c as { props: any }).props.id;
      setTargets([document.getElementById(id)!]);
      console.log("child");
    }

    // setTargets(document.getElementById(children[children]));
  }, [children]);

  console.log(targets);

  const selectoRef = React.useRef<Selecto>(null);
  const moveableRef = React.useRef<Moveable>(null);

  return (
    <div className="w-full h-full editor">
      {active && (
        <>
          <Moveable
            ables={[CustomAble]}
            preventClickDefault={true}
            props={{
              customAble: true,
              onDelete: onDelete,
            }}
            ref={moveableRef}
            target={targets}
            renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
            // DRAG
            draggable={true}
            edgeDraggable={true}
            startDragRotate={0}
            // SCALE
            scalable={true}
            keepRatio={true}
            // ROTATE
            rotatable={true}
            rotationPosition={"top"}
            // PINCH
            pinchable={true}
            // EVENTS
            onDragOrigin={(e) => {
              e.target.style.transformOrigin = e.transformOrigin;
            }}
            onRender={(e) => {
              e.target.style.transform = e.transform;
            }}
            onClickGroup={(e) => {
              selectoRef.current!.clickTarget(e.inputEvent, e.inputTarget);
            }}
            onDrag={(e) => {
              e.target.style.transform = e.transform;
            }}
            onDragGroup={(e) => {
              e.events.forEach((ev) => {
                ev.target.style.transform = ev.transform;
              });
            }}
          />
          <Selecto
            ref={selectoRef}
            dragContainer={window}
            selectableTargets={[".selecto-area .item"]}
            hitRate={0}
            selectByClick={true}
            selectFromInside={false}
            toggleContinueSelect={["shift"]}
            ratio={0}
            onDragStart={(e) => {
              const moveable = moveableRef.current!;
              const target = e.inputEvent.target;
              if (
                moveable.isMoveableElement(target) ||
                targets.some((t) => t === target || t.contains(target))
              ) {
                e.stop();
              }
            }}
            onSelectEnd={(e) => {
              const moveable = moveableRef.current!;
              if (e.isDragStart) {
                e.inputEvent.preventDefault();

                moveable.waitToChangeTarget().then(() => {
                  moveable.dragStart(e.inputEvent);
                });
              }
              setTargets(e.selected);
            }}
          ></Selecto>
        </>
      )}
      <div className="elements selecto-area">{children}</div>
    </div>
  );
};

export default PFPEditor;

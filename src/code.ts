import slugify from "slugify";
import {
  createHotspotComponent,
  createHotspotInstance,
  findAllSiblingHotspots,
  findContainingFrame,
  getHotspotPostfix,
  hotspotPrefix,
  isHotspotNode,
  updateHotspotLabel,
  updateHotspotName,
} from "./helpers";
import {
  InputProps,
  MessageTypes,
  OutputDataShape,
  SelectionTypes,
} from "./types";

let hotspotComponent: ComponentNode;

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case MessageTypes.CREATE_HOTSPOT: {
      const { id, name }: InputProps = msg.data;

      // FIXME: Should be able to create hotspot inside multiple selected frames ??
      const firstSelectedNode = figma.currentPage.selection[0];
      if (!firstSelectedNode) {
        figma.notify("Please select a frame to add a hotspot to");
        return;
      }

      const containingFrame = findContainingFrame(firstSelectedNode);
      if (containingFrame) {
        const containedHotspots = containingFrame
          .findAllWithCriteria({
            types: ["INSTANCE"],
          })
          .filter(isHotspotNode);

        const hotspotAlreadyExists = containedHotspots.some((node) => {
          const data = node.getPluginData("hotspot");
          const { name: hotspotName } = JSON.parse(data);
          return hotspotName === name;
        });
        if (hotspotAlreadyExists) {
          // TODO: Show error message in UI instead of notification
          figma.notify("Hotspot with the same name already exists");
          return;
        }

        const hotspotNode = createHotspotInstance(hotspotComponent, {
          id,
          name,
        });
        const center = {
          x: containingFrame.width / 2,
          y: containingFrame.height / 2,
        };
        hotspotNode.x = center.x;
        hotspotNode.y = center.y;

        const hotspotIndex = containedHotspots.length;
        updateHotspotLabel(hotspotNode, String(hotspotIndex + 1));

        containingFrame.appendChild(hotspotNode);
        figma.viewport.scrollAndZoomIntoView([containingFrame]);
        // selection focuses hotspot and allows to move it around
        figma.currentPage.selection = [hotspotNode];
      } else {
        figma.notify("Please select a frame to add a hotspot to");
      }
      break;
    }

    case MessageTypes.RESIZE_UI: {
      const { height } = msg.data;
      figma.ui.resize(300, height);
      break;
    }

    case MessageTypes.RENAME_HOTSPOT: {
      const { id, name }: InputProps = msg.data;
      // FIXME: How to determine which hotspot to rename?
      // ... only one hotspot should be selected at this point
      const hotspot = figma.currentPage.selection[0];
      if (hotspot) {
        hotspot.setPluginData("hotspot", JSON.stringify({ id, name }));
        hotspot.name = `${hotspotPrefix}/${name}`;
      }
      break;
    }

    default:
      console.log("Unknown message type", msg.type);
  }

  // FIXME: Seperate 'onSelectionChange' concerns from UI's updating
  onSelectionChange();
};

function onSelectionChange() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: SelectionTypes.NO_SELECTION,
    });
  } else {
    const uniqueContainingFrameIds = new Set();

    // add all nodes' containing frames to the set
    selection.forEach((node) => {
      const containingFrame = findContainingFrame(node);
      if (containingFrame) {
        uniqueContainingFrameIds.add(containingFrame.id);
      }
    });

    // add all selected frames with hotspots to the set
    const selectedFramesWithHotspots = selection.filter(
      (node) => node.type === "FRAME" && node.children.some(isHotspotNode)
    );
    selectedFramesWithHotspots.forEach((frame) => {
      uniqueContainingFrameIds.add(frame.id);
    });

    // add all selected hotspots' containing frames to the set
    const selectedHotspots = selection.filter(isHotspotNode);
    selectedHotspots.forEach((hotspot) => {
      const containingFrame = findContainingFrame(hotspot);
      if (containingFrame) {
        uniqueContainingFrameIds.add(containingFrame.id);
      }
    });

    if (uniqueContainingFrameIds.size === 0) {
      figma.ui.postMessage({
        type: SelectionTypes.NO_SELECTION_CONTAINING_HOTSPOTS,
      });
    } else {
      const data: OutputDataShape = {
        frames: [],
      };
      uniqueContainingFrameIds.forEach((frameId) => {
        const frame = figma.getNodeById(frameId as string) as FrameNode;
        const frameData = {
          __nodeId: frame.id,
          id: slugify(frame.name, { lower: true }),
          name: frame.name,
          width: frame.width,
          height: frame.height,
        };

        const containedHotspots = frame
          .findAllWithCriteria({
            types: ["INSTANCE"],
          })
          .filter(isHotspotNode);

        const hotspotsData = containedHotspots.map((node) => {
          const hotspotDataString = node.getPluginData("hotspot");
          const hotspotData = JSON.parse(hotspotDataString); /* id, name */
          return {
            __nodeId: node.id,
            id: hotspotData.id,
            name: hotspotData.name,
            left: node.x / frame.width,
            top: node.y / frame.height,
            x: node.x,
            y: node.y,
          };
        });

        data.frames = [
          ...(data.frames || []),
          {
            ...frameData,
            hotspots: [...hotspotsData],
          },
        ];
      });

      // FIXME: Extract 'data' param to a separate postMessage call

      switch (selectedHotspots.length) {
        case 0:
          {
            figma.ui.postMessage({
              type: SelectionTypes.NO_HOTSPOTS_SELECTED,
              data,
            });
          }
          break;

        case 1:
          {
            const hotspotDataString =
              selectedHotspots[0].getPluginData("hotspot");
            const hotspotData = JSON.parse(hotspotDataString); /* id, name */
            figma.ui.postMessage({
              type: SelectionTypes.ONE_HOTSPOT_SELECTED,
              hotspot: hotspotData,
              data,
            });
          }
          break;

        default: {
          figma.ui.postMessage({
            type: SelectionTypes.MULTIPLE_HOTSPOTS_SELECTED,
            data,
          });
        }
      }
    }
  }
}

function onDocumentChange(event: DocumentChangeEvent) {
  // FIXME: The 'at()' method is not available
  const lastChange = event.documentChanges[event.documentChanges.length - 1];

  switch (lastChange?.type) {
    case "CREATE": {
      const createdNode = lastChange.node as SceneNode;
      if (isHotspotNode(createdNode)) {
        const siblingHotspots = findAllSiblingHotspots(createdNode);

        const hotspotLabel = String(siblingHotspots.length + 1);
        updateHotspotLabel(createdNode as InstanceNode, hotspotLabel);

        // Update hotspot name to be unique inside the frame (add suffix)
        // FIXME: Can this be optimized? (getPluginData, JSON.parse, setPluginData, JSON.stringify, etc.)
        // ... maybe to store hotspot data in object while plugin is running, if closed – save to pluginData
        const hotspotData = createdNode.getPluginData("hotspot");
        const { name: hotspotName } = JSON.parse(hotspotData);
        const postfix = getHotspotPostfix(hotspotName, siblingHotspots);
        const newName = `${hotspotName}${postfix}`;
        // FIXME: Communicate that 'updateHotspotName' should be called instead of 'setPluginData
        updateHotspotName(createdNode as InstanceNode, newName);

        // FIXME: Seperate 'onSelectionChange' concerns from UI's updating
        onSelectionChange();
      }
      break;
    }

    case "DELETE": {
      const deletedNode = lastChange.node as RemovedNode;
      // TODO: Save created hotspot data to check against when a node is deleted,
      // because the deleted node's pluginData or parent node is not available.
      break;
    }

    case "PROPERTY_CHANGE": {
      const changedProperties = lastChange.properties;
      if (changedProperties.includes("x") || changedProperties.includes("y")) {
        // FIXME: Seperate 'onSelectionChange' concerns from UI's updating
        onSelectionChange();
      }
      break;
    }
    default:
      break;
  }
}

async function onRun() {
  async function loadFonts() {
    await Promise.all([
      figma.loadFontAsync({
        family: "Inter",
        style: "Regular",
      }),
      figma.loadFontAsync({
        family: "Inter",
        style: "Bold",
      }),
    ]);
  }
  await loadFonts();

  function setGlobalProperties() {
    figma.skipInvisibleInstanceChildren = true;
  }
  setGlobalProperties();

  function createPluginComponents() {
    hotspotComponent = createHotspotComponent();
    hotspotComponent.locked = true;
    hotspotComponent.visible = false;
  }
  createPluginComponents();

  figma.on("selectionchange", onSelectionChange);
  figma.on("documentchange", onDocumentChange);
}
figma.on("run", onRun);

async function onClose() {
  figma.off("selectionchange", onSelectionChange);
  figma.off("documentchange", onDocumentChange);
}
figma.on("close", onClose);

figma.showUI(__html__, { themeColors: true, height: 272 });

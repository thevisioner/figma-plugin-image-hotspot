// TODO: Refactor to use two groups of available actions:
// - actions that can be performed in plugin's UI
// - actions that can be performed on Figma's canvas

import slugify from "slugify";
import { InputProps } from "./types";

export const hotspotPrefix = "hotspot";
export const nodeNamePrefix = "image-hotspot";

export function createHotspotInstance(
  component: ComponentNode,
  { id, name }: InputProps
): InstanceNode {
  const instance = component.createInstance();
  instance.setPluginData("isHotspot", "true");
  instance.setPluginData("hotspot", JSON.stringify({ id, name }));
  instance.name = `${hotspotPrefix}/${name}`;
  return instance;
}

export function findContainingFrame(node: SceneNode): FrameNode | null {
  if (node.type === "FRAME") {
    return node;
  }
  if (node.parent) {
    return findContainingFrame(node.parent as SceneNode);
  }
  return null;
}

export function isHotspotNode(node: BaseNode): boolean {
  return (
    // node.type === "INSTANCE" &&
    node.getPluginData("isHotspot") === "true"
  );
}

export function updateHotspotLabel(instance: InstanceNode, label: string) {
  const textNode = instance.findChild((node) => node.name === "label");
  if (textNode && textNode.type === "TEXT") {
    textNode.characters = label;
  }
}

export function updateHotspotName(instance: InstanceNode, name: string) {
  const newId = slugify(name, { lower: true });
  instance.setPluginData("hotspot", JSON.stringify({ id: newId, name }));
  instance.name = `${hotspotPrefix}/${name}`;
}

export function findAllSiblingHotspots(
  node: BaseNode,
  excludeCurrent: boolean = true
): InstanceNode[] {
  const containingFrame = findContainingFrame(node as SceneNode);
  if (containingFrame) {
    const containedHotspots = containingFrame
      .findAllWithCriteria({
        types: ["INSTANCE"],
      })
      .filter(isHotspotNode);
    return excludeCurrent
      ? containedHotspots.filter((n) => n.id !== node.id)
      : containedHotspots;
  }
  return [];
}

export function getHotspotPostfix(
  hotspotName: string,
  siblingHotspots: InstanceNode[],
  index: number = 1
): string {
  const nameContainsPostfix = hotspotName.match(/-\d+$/);
  if (!nameContainsPostfix) {
    return `-${index}`;
  } else {
    const postfix = nameContainsPostfix[0];
    const nameWithoutPostfix = hotspotName.replace(postfix, "");
    const nameAlreadyTaken = siblingHotspots.some(
      (node) => node.name === hotspotName
    );
    if (nameAlreadyTaken) {
      // FIXME: Recursion is not working properly here
      return getHotspotPostfix(nameWithoutPostfix, siblingHotspots, index + 1);
    } else {
      return postfix;
    }
  }
}

export function createHotspotComponent(): ComponentNode {
  // checks if component already exist
  const existingComponent = figma.currentPage.findOne(
    (node) =>
      node.type === "COMPONENT" && node.name === `${nodeNamePrefix}/Hotspot`
  ) as ComponentNode;
  if (existingComponent) {
    return existingComponent;
  }

  // Create PAINTS
  const textPaint = createSolidPaint("Text", { r: 1, g: 1, b: 1 });
  const fillPaint = createSolidPaint("Fill", {
    r: 0.48235294222831726,
    g: 0.3803921639919281,
    b: 1,
  });

  // Create COMPONENT
  const component = figma.createComponent();
  component.resize(48, 48);
  component.name = `${nodeNamePrefix}/Hotspot`;
  component.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
      showShadowBehindNode: false,
    },
  ];
  component.primaryAxisSizingMode = "FIXED";
  component.strokeTopWeight = 1;
  component.strokeBottomWeight = 1;
  component.strokeLeftWeight = 1;
  component.strokeRightWeight = 1;
  component.backgrounds = [];
  component.layoutMode = "VERTICAL";

  // Create ELLIPSE
  const ellipse = figma.createEllipse();
  component.appendChild(ellipse);
  ellipse.fillStyleId = fillPaint.id;
  ellipse.strokeStyleId = textPaint.id;
  ellipse.resize(48, 48);
  ellipse.name = "ellipse";
  ellipse.strokeWeight = 3;
  ellipse.layoutAlign = "STRETCH";
  ellipse.constrainProportions = true;
  ellipse.layoutGrow = 1;

  // Create TEXT
  const label = figma.createText();
  component.appendChild(label);
  label.fillStyleId = textPaint.id;
  label.resize(32, 32);
  label.name = "label";
  label.autoRename = false;
  label.fontName = {
    family: "Inter",
    style: "Bold",
  };
  // TODO: Replace characters with component property value
  label.characters = "";
  label.fontSize = 18;
  label.lineHeight = { unit: "PIXELS", value: 32 };
  label.fontName = { family: "Inter", style: "Bold" };
  label.textAutoResize = "NONE";
  label.textAlignHorizontal = "CENTER";
  label.layoutPositioning = "ABSOLUTE";
  label.constraints = { horizontal: "CENTER", vertical: "CENTER" };
  label.x = 8;
  label.y = 8;

  return component;
}

function createSolidPaint(name: string, color: RGB) {
  // checks if style already exist
  const localStyles = figma.getLocalPaintStyles();
  const styleCreatedBefore = localStyles.find(
    (style) => style.name === `${nodeNamePrefix}/${name}`
  );
  if (styleCreatedBefore) {
    return styleCreatedBefore;
  }

  const style = figma.createPaintStyle();
  style.paints = [
    {
      type: "SOLID",
      visible: true,
      opacity: 1,
      blendMode: "NORMAL",
      color: color,
    },
  ];
  style.name = `${nodeNamePrefix}/${name}`;
  return style;
}

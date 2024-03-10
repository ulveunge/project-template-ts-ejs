import { Element, CheerioAPI } from "cheerio";

abstract class BemEntity {
  node: Element;

  constructor(node: Element) {
    this.node = node;
  }

  protected retrieveBEMClasses(className: string, prefix: "b" | "e" | "m") {
    return className
      .split(" ")
      .filter((cls) => cls[0] === prefix && cls.includes(":"));
  }

  protected getClassId(className: string) {
    return className.split(":")[0];
  }

  protected formatClassName(className: string) {
    return className.split(":")[1];
  }

  abstract replaceClassNames(): void;
}

export class BlockEntity extends BemEntity {
  constructor(node: Element) {
    super(node);
  }

  replaceClassNames() {
    const className = this.node.attribs.class;

    const blockClasses = this.retrieveBEMClasses(className, "b");

    blockClasses.forEach((blockClass) => {
      this.node.attribs.class = this.node.attribs.class.replace(
        blockClass,
        this.formatClassName(blockClass)
      );
    });
  }
}

export class ElementEntity extends BemEntity {
  $: CheerioAPI;

  constructor(node: Element, $: CheerioAPI) {
    super(node);
    this.$ = $;
  }

  replaceClassNames() {
    const className = this.node.attribs.class;

    const elementClasses = this.retrieveBEMClasses(className, "e");

    elementClasses.forEach((elementClass) => {
      const blockClass = this.determineBlock(elementClass);

      if (!blockClass) return;

      const elementId = this.getClassId(elementClass);

      this.node.attribs.class = this.node.attribs.class.replace(
        `${elementId}:`,
        `${blockClass}__`
      );
    });
  }

  private determineBlock(className: string) {
    const blockNode = this.$(this.node)
      .parents()
      .find(`[class*="${this.getClassId(className).replace("e", "b")}:"]`)
      .first();

    const blockNodeClasses = blockNode.attr("class");

    if (!blockNodeClasses) return;

    const classesArr = blockNodeClasses.split(" ");

    const blockName = classesArr.find((cls) => {
      return cls.includes(`${this.getClassId(className).replace("e", "b")}`);
    });

    if (!blockName) return;

    return this.formatClassName(blockName);
  }
}

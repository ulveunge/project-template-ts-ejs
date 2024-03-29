import { Element, CheerioAPI } from "cheerio";

abstract class BemEntity {
  node: Element;

  constructor(node: Element) {
    this.node = node;
  }

  protected retrieveBEMClasses(
    className: string,
    prefix: "b" | "e" | "mb" | "me"
  ) {
    return className
      .split(" ")
      .filter(
        (cls) =>
          (cls[0] === prefix || cls.slice(0, 2) === prefix) && cls.includes(":")
      );
  }

  protected getClassId(className: string) {
    return className.split(":")[0];
  }

  protected formatClassName(className: string) {
    return className.split(":")[1];
  }

  protected replaceModifierClassNames(bemClassName: string, bemName: string) {
    const prefix = bemClassName[0] as "b" | "e";
    const modifiers = this.retrieveBEMClasses(
      this.node.attribs.class,
      `m${prefix}`
    );

    modifiers.forEach((modifier) => {
      const id = this.getClassId(modifier);
      const bemId = this.getClassId(bemClassName);

      if (id.slice(2) !== bemId.slice(1)) return;

      this.node.attribs.class = this.node.attribs.class.replace(
        `${id}:`,
        `${bemName}--`
      );
    });
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
      const blockName = this.formatClassName(blockClass);
      this.replaceModifierClassNames(blockClass, blockName);
      this.node.attribs.class = this.node.attribs.class.replace(
        blockClass,
        blockName
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
    const blockNode = this.$(this.node).closest(
      `[class*="${this.getClassId(className).replace("e", "b")}:"]`
    );

    const blockNodeClasses = blockNode.attr("class");

    if (!blockNodeClasses) return;

    const classesArr = blockNodeClasses.split(" ");

    const blockClassName = classesArr.find((cls) => {
      return cls.includes(`${this.getClassId(className).replace("e", "b")}`);
    });

    if (!blockClassName) return;

    const blockName = this.formatClassName(blockClassName);
    const elementName = this.formatClassName(className);

    this.replaceModifierClassNames(className, `${blockName}__${elementName}`);

    return blockName;
  }
}

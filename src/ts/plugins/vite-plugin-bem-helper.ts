import { Plugin } from "vite";
import * as cheerio from "cheerio";

abstract class BemEntity {
  node: cheerio.Element;

  constructor(node: cheerio.Element) {
    this.node = node;
  }

  protected retrieveBEMClasses(
    className: string,
    prefix: "b" | "e" | "m" | null = null
  ) {
    const prefixRegex = prefix ? `${prefix}-` : "[bem]-";
    const regex = new RegExp(`${prefixRegex}?\\d*_\\s*([^ ]*)`, "g");

    return className.match(regex) || [];
  }

  protected getClassId(className: string) {
    return className.split("_")[0];
  }

  protected formatClassName(className: string) {
    return className.split("_")[1];
  }

  abstract replaceClassNames(): void;
}

class BlockEntity extends BemEntity {
  constructor(node: cheerio.Element) {
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

class ElementEntity extends BemEntity {
  $: cheerio.CheerioAPI;

  constructor(node: cheerio.Element, $: cheerio.CheerioAPI) {
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
        `${elementId}_`,
        `${blockClass}__`
      );
    });
  }

  private determineBlock(className: string) {
    const blockNode = this.$(this.node).closest(`[class^="b_"]`);

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

const transformHtml = (html: string) => {
  const $ = cheerio.load(html);

  const elementNodes = $('[class^="e_"]').toArray();
  const blockNodes = $('[class^="b_"]').toArray();

  if (!blockNodes.length) return;

  elementNodes.forEach((elementNode) => {
    const elementEntity = new ElementEntity(elementNode, $);
    elementEntity.replaceClassNames();
  });

  // blockNodes.forEach((blockNode) => {
  //   const blockEntity = new BlockEntity(blockNode);
  //   blockEntity.replaceClassNames();
  // });

  return $.html();
};

export default function ViteBEMHelperPlugin(): Plugin {
  return {
    name: "vite-plugin-bem-helper",
    transformIndexHtml(html) {
      return transformHtml(html);
    },
  };
}

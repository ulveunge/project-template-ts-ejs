import { Plugin } from "vite";
import * as cheerio from "cheerio";
import { BlockEntity, ElementEntity } from "./helpers/bem";
import selectBEMElements from "./helpers/selectBEMElements";

const transformHtml = (html: string) => {
  const $ = cheerio.load(html);

  const blockNodes = selectBEMElements($, "b");
  const elementNodes = selectBEMElements($, "e");

  if (!blockNodes.length) return;

  elementNodes.forEach((elementNode) => {
    const elementEntity = new ElementEntity(elementNode, $);
    elementEntity.replaceClassNames();
  });

  blockNodes.forEach((blockNode) => {
    const blockEntity = new BlockEntity(blockNode);
    blockEntity.replaceClassNames();
  });

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

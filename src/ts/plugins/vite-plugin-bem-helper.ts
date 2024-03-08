import { Plugin } from "vite";
import * as cheerio from "cheerio";

const retrieveBEMEntity = (className: string, BEMEntity: string) => {
  const string = className.split(" ").find((el) => el.includes(BEMEntity));

  if (string) {
    return string.replace(`${BEMEntity}`, "");
  }

  return "";
};

const transformHtml = (html: string) => {
  const $ = cheerio.load(html);
  const bemBlocks = $('[class^="b:"]');

  bemBlocks.each((_, b) => {
    const blockName = retrieveBEMEntity(b.attribs.class, "b:");
    b.attribs.class = b.attribs.class.replace("b:", "");
    b.attribs.class = b.attribs.class.replace(/m:/g, `${blockName}--`);

    const bemElements = $(`.${blockName} [class^="e:"]`);

    (bemElements as cheerio.Cheerio<cheerio.Element>).each((_, e) => {
      const elementName = retrieveBEMEntity(e.attribs.class, "e:");
      e.attribs.class = e.attribs.class.replace(/e:/g, `${blockName}__`);
      e.attribs.class = e.attribs.class.replace(
        /m:/g,
        `${blockName}__${elementName}--`
      );
    });
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

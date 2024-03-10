import { CheerioAPI } from "cheerio";

const selectBEMElements = ($: CheerioAPI, prefix: "b" | "e" | "m") => {
  const filteredElements = $("[class]").filter((_, element) => {
    const classes = $(element).attr("class");
    if (classes) {
      const classList = classes.split(" ");
      return classList.some(
        (className) => className[0] === prefix && className.includes(":")
      );
    }
    return false;
  });

  return filteredElements.toArray();
};

export default selectBEMElements;

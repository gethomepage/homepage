var glimeScript;
var glimeStyles = [];
document$.subscribe(function () {
  if (!glimeScript) {
    glimeScript = document.createElement("script");
    glimeScript.setAttribute("src", "https://cdn.glimelab.ai/widget/1.0.0/widget.js");
    glimeScript.setAttribute("onload", "onGlimeLoad()");
    document.head.appendChild(glimeScript);
  } else {
    var newGlimeStyle = document.createElement("style");
    document.head.appendChild(newGlimeStyle);
    var i = 0;
    glimeStyles.forEach((rule) => {
      newGlimeStyle.sheet.insertRule(rule.cssText, i);
      i++;
    });
  }
});

onGlimeLoad = () => {
  window.glime.init("Bl3mlvfCnTnRm5");
  setTimeout(() => {
    const sheets = document.styleSheets;
    [...sheets].forEach((sheet) => {
      if (!sheet.href) {
        [...sheet.cssRules].forEach((rule) => {
          if (!rule || rule.href || !rule.selectorText) return;
          if (rule.selectorText.indexOf(".css-") === 0 || rule.selectorText.indexOf("glime") > -1) {
            glimeStyles.push(rule);
          }
        });
      }
    });
  }, 1000);
};

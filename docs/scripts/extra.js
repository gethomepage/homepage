var glimeScript;
document$.subscribe(function () {
  if (!glimeScript) {
    glimeScript = document.createElement("script");
    glimeScript.setAttribute("data", "name: 'glime'");
    glimeScript.setAttribute("src", "https://cdn.glimelab.ai/widget/1.0.0/widget.js");
    glimeScript.setAttribute("onload", 'window.glime.init("Bl3mlvfCnTnRm5");');
    document.head.appendChild(glimeScript);
  } else {
    // window.glime.init("Bl3mlvfCnTnRm5");
  }
});

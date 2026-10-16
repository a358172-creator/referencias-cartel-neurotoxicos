"use strict";

const printButton = document.getElementById("printCv");
printButton.hidden = false;
printButton.addEventListener("click", () => window.print());

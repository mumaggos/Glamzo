var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// replace_theme.mjs
var import_fs = __toESM(require("fs"), 1);
var content = import_fs.default.readFileSync("src/pages/Admin.tsx", "utf8");
content = content.replace(/bg-slate-950/g, "bg-slate-50");
content = content.replace(/text-slate-100/g, "text-slate-800");
content = content.replace(/text-slate-200/g, "text-slate-700");
content = content.replace(/text-slate-300/g, "text-slate-600");
content = content.replace(/text-slate-400/g, "text-slate-500");
content = content.replace(/border-slate-800/g, "border-slate-200");
content = content.replace(/border-slate-900/g, "border-slate-200");
content = content.replace(/border-white\/10/g, "border-purple-200");
content = content.replace(/border-white\/5/g, "border-purple-100");
content = content.replace(/bg-\[#06000c\]/g, "bg-white");
content = content.replace(/bg-\[#110a24\]\/50/g, "bg-purple-50");
content = content.replace(/bg-\[#090514\]\/80/g, "bg-white");
content = content.replace(/bg-slate-900/g, "bg-white");
content = content.replace(/bg-slate-800/g, "bg-slate-100");
content = content.replace(/text-white/g, "text-slate-900");
content = content.replace(/text-purple-300/g, "text-purple-700");
content = content.replace(/text-purple-400/g, "text-purple-600");
content = content.replace(/bg-\[#170a14\]/g, "bg-rose-50");
content = content.replace(/text-rose-450/g, "text-rose-600");
content = content.replace(/text-emerald-400/g, "text-emerald-600");
import_fs.default.writeFileSync("src/pages/Admin.tsx", content);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = void 0;
const electron_1 = require("electron");
exports.isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;

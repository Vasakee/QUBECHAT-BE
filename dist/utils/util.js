"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerAddress = void 0;
const getServerAddress = (req) => {
    return req.protocol + '://' + req.get('host');
};
exports.getServerAddress = getServerAddress;
//# sourceMappingURL=util.js.map
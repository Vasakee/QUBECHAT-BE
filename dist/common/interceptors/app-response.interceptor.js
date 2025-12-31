"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let AppResponseInterceptor = class AppResponseInterceptor {
    intercept(context, next) {
        const http = context.switchToHttp();
        const response = http.getResponse();
        return next.handle().pipe((0, operators_1.map)((data) => {
            const statusCode = response?.statusCode ? String(response.statusCode) : '200';
            const success = response?.statusCode ? response.statusCode >= 200 && response.statusCode < 400 : true;
            let message = '';
            try {
                if (data == null) {
                    message = '';
                }
                else if (typeof data === 'string') {
                    message = data;
                }
                else if (typeof data === 'object' && 'message' in data) {
                    message = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
                }
                else {
                    message = JSON.stringify(data);
                }
            }
            catch (e) {
                message = '';
            }
            const appResp = {
                success,
                statuscode: statusCode,
                message,
            };
            return appResp;
        }));
    }
};
exports.AppResponseInterceptor = AppResponseInterceptor;
exports.AppResponseInterceptor = AppResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], AppResponseInterceptor);
//# sourceMappingURL=app-response.interceptor.js.map
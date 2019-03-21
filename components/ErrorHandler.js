class ErrorHandler {
    _handlers = [];
    _defaultHandler = ErrorUtils.getGlobalHandler();

    setHandler(handler) {
        this._handlers.push(handler);
        ErrorUtils.setGlobalHandler(handler);
    }

    restore() {
        const handler = this._handlers.pop();
        ErrorUtils.setGlobalHandler(handler ? handler : this._defaultHandler);
    }
}

export default new ErrorHandler();
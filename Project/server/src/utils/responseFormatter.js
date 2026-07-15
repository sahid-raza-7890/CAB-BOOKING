class ResponseFormatter {
    static success(res, data = {}, message = 'Success', statusCode = 200) {
        const requestId = res.req ? res.req.requestId : null;
        let payload = data;
        if (payload && typeof payload.toJSON === 'function') {
            payload = payload.toJSON();
        }
        return res.status(statusCode).json({
            success: true,
            message,
            requestId,
            ...payload,
            timestamp: new Date().toISOString()
        });
    }

    static successAdmin(res, payload = {}, message = 'Success', statusCode = 200) {
        const requestId = res.req ? res.req.requestId : null;
        if (payload && (payload.page !== undefined || payload.limit !== undefined || payload.total !== undefined || payload.pages !== undefined)) {
            const { page, limit, total, pages, ...rest } = payload;
            return res.status(statusCode).json({
                success: true,
                message,
                requestId,
                data: rest,
                meta: { page, limit, total, pages },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(statusCode).json({
            success: true,
            message,
            requestId,
            data: payload,
            timestamp: new Date().toISOString()
        });
    }

    static error(res, message = 'An error occurred', errorCode = 'INTERNAL_ERROR', details = {}, statusCode = 500) {
        const requestId = res.req ? res.req.requestId : null;
        return res.status(statusCode).json({
            success: false,
            message,
            requestId,
            errorCode,
            details,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = ResponseFormatter;

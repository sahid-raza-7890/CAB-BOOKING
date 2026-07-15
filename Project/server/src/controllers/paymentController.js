const PaymentService = require('../services/paymentService');
const ResponseFormatter = require('../utils/responseFormatter');

class PaymentController {
    static async createOrder(req, res) {
        const { amount } = req.body;
        if (!amount) return ResponseFormatter.error(res, 'Amount is required', 'VALIDATION_ERROR', {}, 400);

        try {
            const order = await PaymentService.createRazorpayOrder(amount);
            return ResponseFormatter.success(res, order);
        } catch (error) {
            console.error("Payment Order Error:", error);
            // Fallback for demo mode
            return ResponseFormatter.success(res, { id: "mock_order_fallback", amount: amount * 100 });
        }
    }

    static async verifyPayment(req, res) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId } = req.body;
        
        const isVerified = await PaymentService.verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId);
        
        if (isVerified) {
            return ResponseFormatter.success(res, {}, 'Payment verified!');
        } else {
            return ResponseFormatter.error(res, 'Invalid payment signature!', 'PAYMENT_FAILED', {}, 400);
        }
    }
}

module.exports = PaymentController;

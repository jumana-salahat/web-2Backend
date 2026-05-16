export const createPayment = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, card, amount } = req.body || {};

    if (!name || !card || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Payment received successfully",
      payment: {
        name,
        card,
        amount,
      },
    });

  } catch (error) {
    console.error("Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      payments: [],
    });

  } catch (error) {
    console.error("Get Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
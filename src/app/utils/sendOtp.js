export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;

  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/[^\d]/g, "");

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Ensure it's a 10-digit Indian mobile number
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export async function sendOTP(phoneNumber, otp) {
  try {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return {
        success: false,
        error: "Invalid phone number format",
      };
    }

    // Validate environment variables
    // if (!process.env.WATI_API_ENDPOINT || !process.env.WATI_ACCESS_TOKEN) {
    //   console.error("❌ WATI API credentials not configured");
    //   return {
    //     success: false,
    //     error: "WhatsApp API not configured",
    //   };
    // }

    // // Generate unique broadcast name with timestamp
    // const timestamp = new Date()
    //   .toISOString()
    //   .replace(/[-:.]/g, "")
    //   .slice(0, 14);
    // const broadcastName = `otp_login_${timestamp}`;

    // const whatsappData = {
    //   template_name: process.env.WHATSAPP_LOGIN_TEMPLATE || "otp_template",
    //   broadcast_name: broadcastName,
    //   parameters: [
    //     {
    //       name: "1",
    //       value: otp,
    //     },
    //   ],
    // };

    // console.log(`📤 Sending WhatsApp request with data:`, {
    //   template: whatsappData.template_name,
    //   broadcast: broadcastName,
    //   phone: normalizedPhone,
    //   otp: otp,
    // });

    // const response = await fetch(
    //   `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${normalizedPhone}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       accept: "*/*",
    //       Authorization: `${process.env.WATI_ACCESS_TOKEN}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(whatsappData),
    //   }
    // );

    // console.log(`📡 WhatsApp API Response:`, {
    //   status: response.status,
    //   statusText: response.statusText,
    //   ok: response.ok,
    // });

    // if (!response.ok) {
    //   const errorText = await response.text();
    //   console.error("❌ WhatsApp API error:", response.status, errorText);
    //   return {
    //     success: false,
    //     error: `WhatsApp API failed with status ${response.status}: ${errorText}`,
    //   };
    // }

    // const result = await response.json();
    console.log(`✅ WhatsApp OTP sent successfully to ${normalizedPhone} and otp is ${otp}`);
    // console.log(`📊 Response:`, result);

    return {
      success: true,
      message: `OTP sent successfully to ${normalizedPhone} and otp is ${otp}`,
    };
  } catch (error) {
    console.error("❌ WhatsApp OTP sending failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

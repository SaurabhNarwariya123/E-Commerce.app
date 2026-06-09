import nodemailer from 'nodemailer'

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS   // Gmail App Password (not your Gmail password)
        }
    })
}

export const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email not configured. Set EMAIL_USER and EMAIL_PASS in .env')
    }
    const transporter = createTransporter()
    await transporter.sendMail({
        from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    })
}

export const sendOTPEmail = async (to, otp, orderId) => {
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #eee;border-radius:8px;padding:32px;">
            <h2 style="color:#333;margin-bottom:8px;">Order Confirmation OTP</h2>
            <p style="color:#555;">Thank you for your order! Use the OTP below to confirm your order.</p>
            <div style="background:#f4f4f4;border-radius:6px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#4f46e5;">${otp}</span>
            </div>
            <p style="color:#555;">Order ID: <strong>${orderId}</strong></p>
            <p style="color:#888;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
    `
    await sendEmail({ to, subject: 'Your Order Confirmation OTP', html })
}

export const sendDeliveryOTPEmail = async (to, otp, orderId, deliveryPersonName) => {
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #eee;border-radius:8px;padding:32px;">
            <h2 style="color:#333;margin-bottom:8px;">Delivery Confirmation OTP</h2>
            <p style="color:#555;">Your order is being delivered by <strong>${deliveryPersonName}</strong>.</p>
            <p style="color:#555;">Share this OTP with the delivery person to confirm receipt:</p>
            <div style="background:#f4f4f4;border-radius:6px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#16a34a;">${otp}</span>
            </div>
            <p style="color:#555;">Order ID: <strong>${orderId}</strong></p>
            <p style="color:#e53e3e;font-size:13px;"><strong>Do NOT share this OTP unless you have received your package.</strong></p>
            <p style="color:#888;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>
    `
    await sendEmail({ to, subject: 'Delivery OTP – Confirm Your Delivery', html })
}

export const sendCancelOTPEmail = async (to, otp, orderId) => {
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #eee;border-radius:8px;padding:32px;">
            <h2 style="color:#c53030;margin-bottom:8px;">Order Cancellation Request</h2>
            <p style="color:#555;">You requested to cancel order <strong>${orderId}</strong>.</p>
            <p style="color:#555;">Enter this OTP to confirm the cancellation:</p>
            <div style="background:#fff5f5;border:2px solid #feb2b2;border-radius:6px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#c53030;">${otp}</span>
            </div>
            <p style="color:#888;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
        </div>
    `
    await sendEmail({ to, subject: 'Order Cancellation OTP', html })
}

export const sendOrderStatusEmail = async (to, status, orderId) => {
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #eee;border-radius:8px;padding:32px;">
            <h2 style="color:#333;">Order Status Update</h2>
            <p style="color:#555;">Your order <strong>${orderId}</strong> status has been updated to:</p>
            <div style="background:#4f46e5;color:#fff;border-radius:6px;padding:16px;text-align:center;margin:24px 0;font-size:20px;font-weight:bold;">
                ${status}
            </div>
            <p style="color:#888;font-size:13px;">Track your order in the app for live location updates.</p>
        </div>
    `
    await sendEmail({ to, subject: `Order Update: ${status}`, html })
}

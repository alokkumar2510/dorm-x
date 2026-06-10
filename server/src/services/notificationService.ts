import prisma from '../prisma';

export const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`✉️ [Mock Email Service] Sending email to: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Body: ${body}`);
  // Nodemailer production integration template:
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({ from: 'no-reply@dormx.com', to, subject, text: body });
};

export const sendPushNotification = async (userId: string, title: string, message: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true }
    });

    if (!user || !user.pushSubscription) {
      console.log(`📱 [Mock Push Service] No push subscription found for user ${userId}. Skipping push.`);
      return;
    }

    const subscription = JSON.parse(user.pushSubscription);
    console.log(`📱 [Mock Push Service] Dispatching Push Alert to user ${userId}:`);
    console.log(`   Subscription endpoint: ${subscription.endpoint}`);
    console.log(`   Title: ${title}`);
    console.log(`   Message: ${message}`);
    // WebPush production integration template:
    // await webpush.sendNotification(subscription, JSON.stringify({ title, message }));
  } catch (error) {
    console.error('Failed to dispatch push notification:', error);
  }
};

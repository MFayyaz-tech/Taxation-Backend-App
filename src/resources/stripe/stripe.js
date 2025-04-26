// const { custom } = require("joi");
// const User = require("../models/User");
// const Stripe = require("../models/Stripe");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const moment = require("moment");
// const { stripeSession } = require("../helpers/stripe");
// const ApiHitLog = require("../models/ApiHitLog/ApiHitlogs");

// exports.createStripeCheckoutSession = async (req, res) => {
//   const { userId, plan } = req.body;
//   const validUser = req.user.id;
//   try {
//     // check if userId is not provided
//     if (!userId) {
//       return res.status(400).json({ error: "User Id is required" });
//     }

//     // check if price is not provided
//     if (!plan) {
//       return res.status(400).json({ error: "Price is required" });
//     }

//     // get user from the database
//     const user = await User.find({
//       _id: userId,
//       isVisible: true,
//       isVerified: true,
//     });

//     // check if user is not found
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const user_Id = user[0]._id.toString();

//     // check if user is not valid
//     if (user_Id !== validUser) {
//       return res
//         .status(401)
//         .json({ error: "You are not authorized to perform this action" });
//     }

//     // check if user is already subscribed
//     if (user[0].isSubscribed) {
//       return res
//         .status(400)
//         .json({ error: "User is already subscribed to a plan" });
//     }

//     // check if user has active subscription on stripe
//     const stripeData = await Stripe.findOne({ userId: user_Id });

//     const prices = await stripe.prices.list({
//       lookup_keys: [plan],
//     });

//     console.log("prices", prices);

//     // const plan = process.env.STRIPE_PLAN_ID;

//     // res.send(prices);

//     // return;

//     const session = await stripeSession(
//       prices.data[0].id,
//       user[0].email,
//       user_Id,
//       user[0]?.hasUsedTrialPeriod,
//       plan
//     );

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // stripe web hook to handle subscription events
// exports.stripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.log(`Webhook signature verification failed.`, err.message);
//     return res.sendStatus(400);
//   }

//   // Handle the events
//   try {
//     switch (event.type) {
//       // Handle the checkout.session.completed event on successful checkout
//       case "checkout.session.completed":
//         console.log("checkout.session.completed");
//         const session = event.data.object;
//         // Retrieve the user id from the session object
//         const userId = session.metadata.userId;
//         const subscriptionPlan = session.metadata.plan;

//         console.log("userId", userId);

//         // Update the user in the database
//         await User.findOneAndUpdate(
//           { _id: userId },
//           {$set:{ isSubscribed: true, subscriptionPlan }},{new: true, upsert: true}
//         );
//         await ApiHitLog.findOneAndUpdate(
//           { endpointName: '/addMockInterview', userId: userId }, // filter condition
//           { $set: { count: 0 } }, // update operation
//           { new: true, upsert: true } // options: return the updated document and insert if not found
//         );
//         // Save Stripe data
//         const subscriptionDetails = await stripe.subscriptions.retrieve(
//           session.subscription
//         );
//         const currentPeriodStart = moment
//           .unix(subscriptionDetails.current_period_start)
//           .format("DD-MM-YYYY");
//         const currentPeriodEnd = moment
//           .unix(subscriptionDetails.current_period_end)
//           .format("DD-MM-YYYY");
//         const trialEnd = subscriptionDetails.trial_end
//           ? moment.unix(subscriptionDetails.trial_end).format("DD-MM-YYYY")
//           : null;
//         const trialDaysRemaining = subscriptionDetails.trial_end
//           ? Math.ceil(
//               (subscriptionDetails.trial_end * 1000 - Date.now()) /
//                 (1000  60  60 * 24)
//             )
//           : null;

//         // Update the subscription to cancel at period end
//         // await stripe.subscriptions.update(subscriptionDetails.id, {
//         //   cancel_at_period_end: true,
//         // });

//         let stripeData = await Stripe.findOne({ userId });

//         if (stripeData) {
//           // Update existing record
//           stripeData.customerId = session.customer;
//           stripeData.subscriptionId = session.subscription;
//           stripeData.status = "active";
//           stripeData.currentPeriodStart = currentPeriodStart;
//           stripeData.currentPeriodEnd = currentPeriodEnd;
//           stripeData.trialEnd = trialEnd;
//           stripeData.trialDaysRemaining = trialDaysRemaining;
//           await stripeData.save();
//         } else {
//           // Create new record
//           stripeData = new Stripe({
//             userId: userId,
//             customerId: session.customer,
//             subscriptionId: session.subscription,
//             status: "active",
//             currentPeriodStart: currentPeriodStart,
//             currentPeriodEnd: currentPeriodEnd,
//             trialEnd: trialEnd,
//             trialDaysRemaining: trialDaysRemaining,
//           });
//           await stripeData.save();
//         }
//         break;

//       // Handle the customer.subscription.deleted event on subscription cancellation
//       case "customer.subscription.deleted":
//         console.log("customer.subscription.deleted event occurred");
//         const subscriptionDeleted = event.data.object;
//         const customerId = subscriptionDeleted.customer;

//         console.log("customerId", customerId);

//         console.log("subscriptionDeleted", subscriptionDeleted);
//         console.log("event", event);

//         // Find the user by customerId
//         const stripeRecord = await Stripe.findOne({ customerId: customerId });

//         // Check if the user has a subscription - retrieve the subscription from stripe
//         const retrievedSubscription = await stripe.subscriptions.retrieve(
//           subscriptionDeleted.id
//         );

//         console.log("retrievedSubscription", retrievedSubscription);

//         console.log("stripeRecord", stripeRecord);

//         if (stripeRecord) {
//           // Update subscription status in StripeData collection
//           stripeRecord.status = "non-active";
//           stripeRecord.currentPeriodEnd = moment
//             .unix(subscriptionDeleted.current_period_end)
//             .format("DD-MM-YYYY");
//           await stripeRecord.save();

//           // Update user subscription status
//           await User.findByIdAndUpdate(stripeRecord.userId, {
//             isSubscribed: false,
//             hasUsedTrialPeriod: true,
//             subscriptionPlan: null,
//           });
//           // Cancel the subscription in Stripe
//           console.log("Cancelling subscription");

//           // const res = await stripe.subscriptions.cancel(subscriptionDeleted.id);

//           console.log("Subscription cancelled", res);
//         }
//         break;

//       // handle payment failure event on subscription payment failure
//       case "invoice.payment_failed":
//         console.log("invoice.payment_failed");
//         const invoice = event.data.object;

//         // Retrieve the subscription ID from the invoice
//         const subscriptionId = invoice.subscription;

//         console.log("subscriptionId", subscriptionId);

//         // Retrieve the user ID from the subscription in the StripeData collection
//         const stripePaymentFailedData = await Stripe.findOne({
//           subscriptionId: subscriptionId,
//         });

//         if (stripePaymentFailedData) {
//           // Cancel the subscription if payment retry fails
//           await stripe.subscriptions.cancel(subscriptionId);

//           // Update subscription status in StripeData collection
//           stripePaymentFailedData.status = "cancelled";
//           await stripePaymentFailedData.save();

//           // // Update user subscription status
//           // await User.findByIdAndUpdate(stripePaymentFailedData.userId, {
//           //   isSubscribed: false,
//           //   hasUsedTrialPeriod: true,
//           // });

//           console.log("Subscription cancelled due to payment failure");
//         }
//         break;

//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }
//   } catch (error) {
//     console.log("Error handling webhook event", error?.message);
//     return res.sendStatus(400);
//   }

//   res.sendStatus(200);
// };

// // cancel subscription
// exports.cancelSubscription = async (req, res) => {
//   const { userId } = req.body;
//   const validUser = req.user.id;

//   try {
//     // check if userId is not provided
//     if (!userId) {
//       return res.status(400).json({ error: "User Id is required" });
//     }

//     // get user from the database
//     const user = await User.find({
//       _id: userId,
//       isVisible: true,
//       isVerified: true,
//     });

//     // check if user is not found
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const user_Id = user[0]._id.toString();

//     // check if user is not valid
//     if (user_Id !== validUser) {
//       return res
//         .status(401)
//         .json({ error: "You are not authorized to perform this action" });
//     }

//     // Find the user's stripe data
//     const stripeData = await Stripe.findOne({ userId: user_Id });

//     if (!stripeData) {
//       return res.status(404).json({ error: "Subscription not found" });
//     }

//     // check if subscription is already cancelled - tell user when it will end
//     if (stripeData.status === "non-active") {
//       return res.status(400).json({
//         error: `Subscription already cancelled. It will end on ${stripeData.currentPeriodEnd}`,
//       });
//     }

//     // Cancel the subscription
//     await stripe.subscriptions.update(stripeData.subscriptionId, {
//       cancel_at_period_end: true,
//     });

//     // Update the subscription status in the StripeData collection
//     stripeData.status = "non-active";
//     await stripeData.save();

//     // send response and tell user when subscription will end
//     res.status(200).json({
//       message: `Subscription cancelled successfully. It will end on ${stripeData.currentPeriodEnd}`,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.deleteSubscription = async (req, res) => {
//   const { userId } = req.body;
//   const validUser = req.user.id;

//   try {
//     // check if userId is not provided
//     if (!userId) {
//       return res.status(400).json({ error: "User Id is required" });
//     }

//     // get user from the database
//     const user = await User.find({
//       _id: userId,
//       // isVisible: true,
//       // isVerified: true,
//     });

//     // check if user is not found
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const user_Id = user[0]._id.toString();

//     // check if user is not valid
//     if (user_Id !== validUser) {
//       return res
//         .status(401)
//         .json({ error: "You are not authorized to perform this action" });
//     }

//     // Find the user's stripe data
//     const stripeData = await Stripe.findOne({ userId: user_Id });

//     if (!stripeData) {
//       return res.status(404).json({ error: "Subscription not found" });
//     }

//     // Delete the subscription
//     await stripe.subscriptions.cancel(stripeData.subscriptionId);

//     // Update the subscription status in the StripeData collection
//     stripeData.status = "non-active";
//     await stripeData.save();

//     res.status(200).json({ message: "Subscription deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

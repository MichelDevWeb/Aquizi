import { stripe } from "@/lib/stripe";
import { getDocumentById, updateDocument } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase/firebase-admin";

// Initialize Firebase Admin if not already initialized
initAdmin();

// Define types for Firestore documents
interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  stripeCustomerId?: string;
  subscribed?: boolean;
}

export async function POST(req: Request) {
  try {
    const { price, quantity = 1 } = await req.json();
    
    // Get Firebase auth token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid Authorization header",
        }),
        { status: 401 }
      );
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get user
    let userId;
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error("Error verifying Firebase token:", error);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      );
    }

    // Get user from Firestore
    const user = await getDocumentById<User>(COLLECTIONS.USERS, userId);
    let customer;

    if (user?.stripeCustomerId) {
      customer = {
        id: user.stripeCustomerId,
      };
    } else {
      const customerData: {
        metadata: {
          dbId: string;
        };
      } = {
        metadata: {
          dbId: userId,
        },
      };

      const response = await stripe.customers.create(customerData);

      customer = { id: response.id };

      // Update user in Firestore with Stripe customer ID
      await updateDocument(
        COLLECTIONS.USERS,
        userId,
        {
          stripeCustomerId: customer.id,
        }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      success_url: `${baseUrl}/billing/payment/success`,
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price,
          quantity,
        },
      ],
      mode: "subscription",
    });

    if (session) {
      return new Response(
        JSON.stringify({
          sessionId: session.id,
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Failed to create a session",
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("Error creating checkout session", error);
    return new Response(
      JSON.stringify({
        error,
      }),
      { status: 500 }
    );
  }
}

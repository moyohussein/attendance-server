BACKEND FLOW SPECIFICATION (READY FOR AI AGENT)
SYSTEM ENTITIES

User

School

Subscription

Teacher

InvitationToken

Class

Student

🧭 FLOW 1: User Signup → Initial Onboarding
1. POST /auth/register
Input:

email

password

Steps:

Validate email/password

Create user record

role = 'user'

school_id = NULL

Generate JWT session token

Return onboarding options.

Output:
{
  "status": "success",
  "next": "onboarding_choice"
}

🧭 FLOW 2: Onboarding Choice (Three Path Entry)

After signup, user selects one of:

Create School → Owner flow

Join School via Invite → Teacher flow

Start Demo Mode → Sandbox flow

Backend must support all three.

*********************************
✔ PATH A: “Create New School”
*********************************
2A. POST /schools
Input:

school_name

Steps:

Create school record

Assign user role:

role = 'school_owner'

school_id = school.id

Create free tier subscription:

subscriptions.tier = 'free'

limits = { students: 20, teachers: 2 }

Output:
{ "status": "school_created", "school_id": "...", "tier": "free" }

*********************************
✔ PATH B: “Join via Invite Token”
*********************************
2B. POST /teachers/accept-invite
Input:

token

optional: user_name

Steps:

Validate token in KV

Extract:

school_id

email invited

Match token email ⇔ user.email

Create teacher entry

Update user:

role = 'teacher'

school_id = token.school_id

Delete KV token

Return user’s assigned classes (empty initially)

Output:
{ "status": "joined_school", "school_id": "..." }

*********************************
✔ PATH C: “Demo Mode”
*********************************
2C. POST /schools/demo
Steps:

Create demo school with:

is_demo = true

fake demo classes & students

Assign user:

role = 'school_owner'

school_id = demo_school

Create ephemeral subscription entry:

tier = 'demo'

expires in 7 days

Output:
{ "status": "demo_active", "school_id": "...", "expires": "..." }

🧭 FLOW 3: Free Tier School Usage
User can now call:

/classes/*

/students/*

/attendance/*

/teachers/*

Backend must enforce subscription limits.

Limit Enforcement Logic (Middleware)
student creation:
IF subscription.tier = 'free' 
AND count_students >= free_limit_students
→ return 402 Payment Required

teacher addition:
IF subscription.tier = 'free'
AND count_teachers >= free_limit_teachers
→ return 402 Payment Required

analytics access:
IF subscription.tier != 'paid'
→ return 402 + upsell metadata

🧭 FLOW 4: Upgrade to Paid Tier (Stripe Integration)
4A. POST /subscriptions/create-checkout-session
Input:

school_id

Steps:

Validate user is owner

Create Stripe checkout session

Store in D1:

pending session id

school_id→session mapping

Return checkout URL

Output:
{ "url": "https://checkout.stripe.com/..." }

4B. POST /subscriptions/webhook (Stripe → Worker)
Event types:

checkout.session.completed

invoice.payment_succeeded

customer.subscription.updated

Steps on successful completion:

Identify school via stored session ID

Update subscription:

tier = 'paid'

limits = unlimited OR premium settings

store Stripe customerID + subscriptionID

Enable premium analytics

Return 200

4C. GET /subscriptions/status
Returns:

tier

limits

renewal date

payment status

🧭 FLOW 5: Paid Tier Feature Activation

Once tier = paid:

student limit removed

teacher limit removed

premium analytics unlocked

high-volume attendance batching allowed

real-time dashboards available

Backend checks:

IF school.subscription.tier == 'paid'
    allow all features
ELSE
    check limits

🧭 FLOW 6: Downgrade + Grace Period (Webhooks)

Stripe may send:

invoice.payment_failed

Steps:

Mark subscription as:

status = 'past_due'

grace_period_until = now + 7 days

Notifications enabled

Features remain enabled until grace expires

On grace expiration:

Auto-downgrade to free tier

Preserve data

Enforce free limits again

🔥 SUMMARY FOR BACKEND AGENT
States

guest → user → (demo | owner | teacher)

subscription: free → paid → past_due → free

Key Transitions

Signup

Onboarding choice

Role assignment

Free tier usage

Upgrade to paid

Webhook updates

Grace period

Downgrade

Key APIs

/auth/register

/schools

/schools/demo

/teachers/accept-invite

/subscriptions/create-checkout-session

/subscriptions/webhook

/subscriptions/status

Key Logic Modules

RBAC middleware

Subscription limit enforcement

Stripe event handler

Demo school generator

Invite token resolver

Analytics access control

Attendance batching logic
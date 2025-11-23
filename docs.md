

### **1. User Accounts & Authentication**

* Multiple user roles:
  * **Super Admin (me)**
  * **School Owner**
  * **Teacher**
* Role-based access control through middleware.

### **2. School Owner Features**

* School owners can:
  * Create a new school
  * Invite teachers via email (invitation tokens stored in KV)
  * Approve or remove teachers
  * Create student records
  * Create classes
  * Assign teachers to classes
  * Manage subscription plans

### **3. Teacher Features**

* Teachers can:
  * View their assigned classes
  * Mark attendance for students
  * Submit attendance logs
  * See attendance history for their classes

### **4. Students**

* Each school can have  **thousands of students** .
* Student data belongs strictly to a single school.
* Student model must support:
  * First name
  * Last name
  * Class
  * Parent contact details (optional)

### **5. Attendance Tracking**

* Build a large-scale attendance system with:
  * Daily attendance logs
  * Timestamp of attendance
  * Teacher who recorded attendance
  * Class ID, Student ID, School ID
* Use **Cloudflare D1** for primary storage.
* For very large schools, optionally queue + batch insert using  **Cloudflare Queues** .

### **6. Analytics**

Build fast aggregated queries such as:

* Student attendance rate (per day, week, month, term)
* Class attendance performance
* Teacher attendance activity
* School-wide attendance analytics dashboard

Analytics endpoints should be optimized for large datasets.

### **7. Subscription Model**

Add subscription features:

* Free tier
* Paid tier (monthly or yearly)
* Limit number of students/teachers based on plan
* Cloudflare Billing OR external provider (Stripe recommended)
* Store subscription metadata in D1
* Middleware protecting premium features

### **8. Multi-Tenancy Requirements**

* Every request must be scoped by School Owner or Teacher permissions.
* Strict row-level access rules:
  * School owners access only their schools
  * Teachers access only classes they are assigned to
  * No school sees another school’s data

---

## **🔥 Transformation Instructions**

Transform the existing OpenAuth template by adding:

### **A. Database Schema Changes (D1)**

Create or update migrations for:

* `schools`
* `users` (extend with role and school_id)
* `teachers`
* `classes`
* `students`
* `attendance_logs`
* `subscriptions`
* `invitation_tokens`

### **B. API Routes**

Use Hono or existing router structure to define API routes:

#### **Auth**

* POST `/auth/register`
* POST `/auth/login`
* POST `/auth/forgot-password`
* (Extend with role assignment)

#### **Schools**

* POST `/schools` (create school)
* GET `/schools/:id`
* PATCH `/schools/:id`

#### **Teachers**

* POST `/teachers/invite`
* POST `/teachers/accept-invite`
* GET `/teachers`
* DELETE `/teachers/:id`

#### **Classes**

* POST `/classes`
* GET `/classes`
* DELETE `/classes/:id`

#### **Students**

* POST `/students`
* GET `/students`
* GET `/students/:id`
* PATCH `/students/:id`
* DELETE `/students/:id`

#### **Attendance**

* POST `/attendance/mark`
* GET `/attendance/class/:class_id`
* GET `/attendance/student/:student_id`

#### **Analytics**

* GET `/analytics/school`
* GET `/analytics/class/:class_id`
* GET `/analytics/student/:student_id`

#### **Subscriptions**

* POST `/subscriptions/create-checkout-session`
* GET `/subscriptions/status`
* POST `/subscriptions/webhook`

---

## **🔥 Additional Requirements**

### **Cloudflare Worker Constraints**

* Must use D1 prepared statements.
* Use KV only for temporary tokens/cache.
* Avoid heavy per-request computation — use batching or caching where appropriate.

### **Security**

* Input validation everywhere
* Prevent privilege escalation
* Prevent teachers from accessing other schools’ data
* Rate limiting if needed

### **Performance**

* Optimize queries for large student datasets
* Add indexes on:
  * student.school_id
  * attendance_logs.class_id
  * attendance_logs.student_id
  * attendance_logs.timestamp

---

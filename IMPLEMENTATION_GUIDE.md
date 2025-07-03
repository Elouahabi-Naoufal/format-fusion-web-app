# FormatFusion Monetization Implementation Guide

## 🚀 Phase 1: Core Monetization Features (Week 1-2)

### 1. User Authentication System

#### Backend Changes Needed:
```python
# Add to app.py
from flask_jwt_extended import get_jwt_identity

# New user registration endpoint
@app.route('/api/auth/register', methods=['POST'])
def register():
    # User registration logic
    pass

# User login endpoint  
@app.route('/api/auth/login', methods=['POST'])
def login():
    # User login logic
    pass

# User profile endpoint
@app.route('/api/auth/profile')
@jwt_required()
def get_profile():
    # Get user profile and usage stats
    pass
```

#### Database Schema Updates:
```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    daily_conversions INTEGER DEFAULT 0,
    monthly_conversions INTEGER DEFAULT 0,
    last_conversion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stripe_customer_id TEXT
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    stripe_subscription_id TEXT,
    plan_id TEXT,
    status TEXT,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking table
CREATE TABLE usage_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    file_id TEXT REFERENCES files(id),
    conversion_type TEXT,
    file_size INTEGER,
    processing_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Subscription Plans & Stripe Integration

#### Frontend Components:
```typescript
// src/components/PricingPlans.tsx
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    dailyConversions: number;
    maxFileSize: number;
    batchSize: number;
  };
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['5 conversions/day', '10MB max file size', 'Basic formats'],
    limits: { dailyConversions: 5, maxFileSize: 10, batchSize: 1 }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: ['Unlimited conversions', '100MB max file size', 'All formats', 'Priority processing'],
    limits: { dailyConversions: -1, maxFileSize: 100, batchSize: 50 }
  }
];
```

#### Stripe Integration:
```python
# Backend Stripe setup
import stripe
stripe.api_key = "sk_test_..."

@app.route('/api/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_premium_monthly',
                'quantity': 1,
            }],
            mode='subscription',
            success_url='http://localhost:5173/success',
            cancel_url='http://localhost:5173/cancel',
        )
        return {'checkout_url': checkout_session.url}
    except Exception as e:
        return {'error': str(e)}, 400
```

### 3. Usage Limits & Tracking

#### Middleware for Usage Checking:
```python
def check_usage_limits(user_id, file_size):
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    
    # Get user subscription info
    c.execute('SELECT subscription_tier, daily_conversions, last_conversion_date FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    
    if not user:
        return False, "User not found"
    
    tier, daily_count, last_date = user
    today = datetime.now().date()
    
    # Reset daily count if new day
    if last_date != today.isoformat():
        c.execute('UPDATE users SET daily_conversions = 0, last_conversion_date = ? WHERE id = ?', 
                 (today.isoformat(), user_id))
        daily_count = 0
    
    # Check limits based on tier
    if tier == 'free':
        if daily_count >= 5:
            return False, "Daily limit reached. Upgrade to Premium for unlimited conversions."
        if file_size > 10 * 1024 * 1024:  # 10MB
            return False, "File too large. Upgrade to Premium for larger files."
    
    conn.close()
    return True, "OK"

# Update upload endpoint
@app.route('/api/files/upload', methods=['POST'])
@jwt_required()
def upload():
    user_id = get_jwt_identity()
    
    for file in files:
        can_convert, message = check_usage_limits(user_id, file.size)
        if not can_convert:
            return {'error': message}, 403
    
    # Continue with existing upload logic...
```

## 🎯 Phase 2: Enhanced Features (Week 3-4)

### 1. Priority Processing Queue

```python
# Priority queue system
import heapq
from enum import Enum

class Priority(Enum):
    LOW = 3      # Free users
    NORMAL = 2   # Premium users  
    HIGH = 1     # Pro users

conversion_queue = []

def add_to_queue(file_id, user_tier):
    priority = Priority.LOW
    if user_tier == 'premium':
        priority = Priority.NORMAL
    elif user_tier == 'pro':
        priority = Priority.HIGH
    
    heapq.heappush(conversion_queue, (priority.value, time.time(), file_id))

def process_queue():
    while conversion_queue:
        priority, timestamp, file_id = heapq.heappop(conversion_queue)
        convert_file(file_id)
```

### 2. User Dashboard

```typescript
// src/pages/Dashboard.tsx
interface UserStats {
  conversionsToday: number;
  conversionsThisMonth: number;
  totalConversions: number;
  storageUsed: number;
  subscriptionTier: string;
  subscriptionStatus: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<UserStats>();
  
  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard title="Today's Conversions" value={stats?.conversionsToday} />
        <StatCard title="Monthly Conversions" value={stats?.conversionsThisMonth} />
        <StatCard title="Subscription" value={stats?.subscriptionTier} />
      </div>
      
      <ConversionHistory />
      <UsageLimits />
    </div>
  );
};
```

## 🔧 Phase 3: API Monetization (Month 2)

### 1. REST API Development

```python
# API endpoints with rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/v1/convert', methods=['POST'])
@limiter.limit("10 per minute")
@jwt_required()
def api_convert():
    user_id = get_jwt_identity()
    api_key = request.headers.get('X-API-Key')
    
    # Validate API key and check limits
    if not validate_api_key(api_key, user_id):
        return {'error': 'Invalid API key'}, 401
    
    # Process conversion request
    return convert_via_api()

# API key management
@app.route('/api/user/api-keys', methods=['POST'])
@jwt_required()
def create_api_key():
    user_id = get_jwt_identity()
    api_key = generate_api_key()
    
    # Store in database
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    c.execute('INSERT INTO api_keys (user_id, key_hash, created_at) VALUES (?, ?, ?)',
              (user_id, hash_api_key(api_key), datetime.now()))
    conn.commit()
    conn.close()
    
    return {'api_key': api_key}
```

### 2. API Documentation

```markdown
# FormatFusion API Documentation

## Authentication
All API requests require an API key in the header:
```
X-API-Key: your_api_key_here
```

## Endpoints

### POST /api/v1/convert
Convert a file from one format to another.

**Request:**
```json
{
  "file_url": "https://example.com/file.pdf",
  "from_format": "PDF",
  "to_format": "DOCX"
}
```

**Response:**
```json
{
  "conversion_id": "uuid",
  "status": "processing",
  "estimated_time": 30
}
```

### GET /api/v1/convert/{id}
Check conversion status.

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "download_url": "https://api.formatfusion.com/download/uuid",
  "expires_at": "2024-01-01T12:00:00Z"
}
```
```

## 📊 Phase 4: Analytics & Optimization (Month 3+)

### 1. Advanced Analytics

```python
# Analytics tracking
@app.route('/api/analytics/track', methods=['POST'])
def track_event():
    data = request.get_json()
    
    # Track user behavior
    event = {
        'user_id': data.get('user_id'),
        'event_type': data.get('event'),
        'properties': data.get('properties'),
        'timestamp': datetime.now()
    }
    
    # Store in analytics database
    store_analytics_event(event)
    
    return {'status': 'tracked'}

# Conversion funnel analysis
@app.route('/api/admin/analytics/funnel')
@jwt_required()
def get_conversion_funnel():
    # Calculate conversion rates at each step
    funnel_data = {
        'visitors': get_unique_visitors(),
        'file_uploads': get_file_uploads(),
        'conversions_started': get_conversions_started(),
        'conversions_completed': get_conversions_completed(),
        'subscriptions': get_new_subscriptions()
    }
    
    return jsonify(funnel_data)
```

### 2. A/B Testing Framework

```typescript
// Frontend A/B testing
interface ABTest {
  id: string;
  name: string;
  variants: {
    control: any;
    variant: any;
  };
}

const useABTest = (testId: string) => {
  const [variant, setVariant] = useState<'control' | 'variant'>('control');
  
  useEffect(() => {
    // Determine user's variant based on user ID hash
    const userVariant = getUserVariant(testId);
    setVariant(userVariant);
    
    // Track assignment
    trackEvent('ab_test_assigned', {
      test_id: testId,
      variant: userVariant
    });
  }, [testId]);
  
  return variant;
};

// Usage in pricing component
const PricingPage = () => {
  const pricingVariant = useABTest('pricing_test_v1');
  
  const premiumPrice = pricingVariant === 'control' ? 9.99 : 7.99;
  
  return <PricingPlans premiumPrice={premiumPrice} />;
};
```

## 💳 Payment Integration Details

### Stripe Setup Steps:

1. **Create Stripe Account**
   - Sign up at stripe.com
   - Get API keys (test and live)
   - Set up webhook endpoints

2. **Create Products & Prices**
   ```bash
   # Using Stripe CLI
   stripe products create --name="FormatFusion Premium" --description="Unlimited file conversions"
   stripe prices create --product=prod_xxx --unit-amount=999 --currency=usd --recurring[interval]=month
   ```

3. **Webhook Handling**
   ```python
   @app.route('/webhook/stripe', methods=['POST'])
   def stripe_webhook():
       payload = request.get_data()
       sig_header = request.headers.get('Stripe-Signature')
       
       try:
           event = stripe.Webhook.construct_event(
               payload, sig_header, webhook_secret
           )
       except ValueError:
           return 'Invalid payload', 400
       
       if event['type'] == 'customer.subscription.created':
           handle_subscription_created(event['data']['object'])
       elif event['type'] == 'customer.subscription.deleted':
           handle_subscription_cancelled(event['data']['object'])
       
       return 'Success', 200
   ```

## 🚀 Deployment & Scaling

### Production Environment Setup:

1. **Database Migration to PostgreSQL**
   ```python
   # Update app.py
   app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
   ```

2. **Redis for Queue Management**
   ```python
   import redis
   from rq import Queue
   
   redis_conn = redis.Redis()
   conversion_queue = Queue('conversions', connection=redis_conn)
   
   # Add job to queue
   conversion_queue.enqueue(convert_file, file_id)
   ```

3. **CDN Integration**
   ```python
   # AWS S3 + CloudFront setup
   import boto3
   
   s3_client = boto3.client('s3')
   
   def upload_to_s3(file_path, bucket, key):
       s3_client.upload_file(file_path, bucket, key)
       return f"https://cdn.formatfusion.com/{key}"
   ```

## 📈 Marketing Implementation

### 1. SEO Optimization
```typescript
// Add to each page
const SEOHead = ({ title, description, keywords }) => (
  <Helmet>
    <title>{title} | FormatFusion</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
  </Helmet>
);
```

### 2. Email Marketing Integration
```python
# Mailchimp/SendGrid integration
import sendgrid
from sendgrid.helpers.mail import Mail

def send_welcome_email(user_email):
    message = Mail(
        from_email='hello@formatfusion.com',
        to_emails=user_email,
        subject='Welcome to FormatFusion!',
        html_content='<strong>Start converting files today!</strong>'
    )
    
    sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    response = sg.send(message)
```

## 🎯 Success Metrics & KPIs

### Key Metrics to Track:
1. **User Acquisition**
   - Daily/Monthly Active Users
   - Sign-up conversion rate
   - Traffic sources

2. **Revenue Metrics**
   - Monthly Recurring Revenue (MRR)
   - Customer Lifetime Value (CLV)
   - Churn rate
   - Average Revenue Per User (ARPU)

3. **Product Metrics**
   - Conversion success rate
   - Average processing time
   - User satisfaction score
   - Feature adoption rates

### Implementation Timeline:
- **Week 1-2**: User auth, basic subscriptions, Stripe integration
- **Week 3-4**: Usage limits, priority processing, user dashboard
- **Month 2**: API development, advanced features
- **Month 3+**: Analytics, optimization, scaling

**Estimated Development Cost**: $5,000-15,000
**Expected Break-even**: 150-200 premium subscribers
**ROI Timeline**: 6-12 months
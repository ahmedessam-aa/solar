# طريقة تفعيل Supabase

## الخطوة 1: إنشاء حساب Supabase
1. اذهب إلى https://supabase.com
2. اضغط Sign Up
3. سجل بحساب Google أو البريد الإلكتروني
4. أنشئ مشروع جديد

## الخطوة 2: إنشاء جدول البيانات
1. في لوحة التحكم، اضغط "Create a new project"
2. بعد إنشاء المشروع، اضغط على "SQL Editor" في الشريط الجانبي
3. اضغط "New Query" والصق الكود التالي:

```sql
CREATE TABLE records (
  id BIGSERIAL PRIMARY KEY,
  vehicleNumber TEXT,
  driverName TEXT,
  dateFrom DATE,
  dateTo DATE,
  fuelUsed DECIMAL,
  distance DECIMAL,
  refills INTEGER,
  expectedConsumption DECIMAL,
  stolenLiters DECIMAL,
  stolenMoney DECIMAL,
  fuelPrice DECIMAL
);
```

4. اضغط "Run"

## الخطوة 3: تحصل على مفاتيح API
1. اضغط على "Settings" في الشريط الجانبي
2. اضغط على "API"
3. ستجد:
   - **Project URL** (انسخه)
   - **Project API Key** (انسخه)

## الخطوة 4: أدخل المفاتيح في الكود
افتح `app.js` وأستبدل:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
```

بـ:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key-here';
```

## الخطوة 5: تفعيل الوصول العام
1. في Supabase، اذهب إلى "Authentication"
2. اضغط "Policies"
3. اختر الجدول `records`
4. اضغط "New policy" وأختر "Enable read access for all users"
5. كرر للكتابة والحذف

الآن البيانات ستُحفظ في السحابة ويمكنك الوصول إليها من أي جهاز!

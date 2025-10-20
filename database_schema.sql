-- ================================================================
-- 🏛️ نظام إدارة الوفود - Delegation Management System
-- ================================================================
-- 
-- هذا الملف يحتوي على Schema كامل لقاعدة البيانات
-- يهدف إلى إدارة الوفود الرسمية والأحداث العسكرية والمدنية
--
-- المؤلف: فريق التطوير
-- التاريخ: 2024
-- ================================================================

-- تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- لإنشاء UUIDs تلقائياً
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- للبحث النصي المتقدم

-- ================================================================
-- 📋 أنواع البيانات المخصصة (ENUMs)
-- ================================================================

-- أدوار المستخدمين في النظام
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',  -- مدير النظام - صلاحيات كاملة + Django Admin Dashboard
    'ADMIN',        -- مدير - صلاحيات كاملة في Frontend فقط (بدون Django Admin)
    'USER'          -- مستخدم - صلاحيات محدودة (عرض وإضافة فقط)
);

-- أنواع الوفود
CREATE TYPE delegation_type AS ENUM (
    'MILITARY',     -- وفد عسكري
    'CIVILIAN'      -- وفد مدني
);

-- حالات الوفود
CREATE TYPE delegation_status AS ENUM (
    'NOT_DEPARTED',         -- لم يغادر أحد
    'PARTIALLY_DEPARTED',   -- غادر جزء من الأعضاء
    'FULLY_DEPARTED'        -- غادر جميع الأعضاء
);

-- حالات الأعضاء
CREATE TYPE member_status AS ENUM (
    'NOT_DEPARTED', -- لم يغادر
    'DEPARTED'      -- غادر
);

-- ملاحظة: تم إزالة session_type لأنه غير مطلوب في النظام
-- جلسات المغادرة بسيطة ومرنة بدون تصنيف معقد

-- ================================================================
-- 👥 جدول المستخدمين
-- ================================================================
-- 
-- يخزن بيانات جميع المستخدمين مع نظام صلاحيات متدرج
-- كل مستخدم له دور محدد يحدد صلاحياته في النظام
--
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,           -- اسم المستخدم للدخول
    full_name VARCHAR(100) NOT NULL,                -- الاسم الكامل
    password_hash TEXT NOT NULL,                    -- كلمة المرور مشفرة
    is_active BOOLEAN DEFAULT TRUE,                 -- هل الحساب نشط؟
    is_staff BOOLEAN DEFAULT FALSE,                 -- هل يمكنه الدخول على Django Admin؟ (فقط للـ SUPER_ADMIN)
    is_superuser BOOLEAN DEFAULT FALSE,             -- هل له صلاحيات Django كاملة؟ (فقط للـ SUPER_ADMIN)
    role user_role NOT NULL,                        -- دور المستخدم في النظام
    last_login TIMESTAMPTZ,                         -- آخر تسجيل دخول
    created_by UUID,                                -- من أنشأ هذا المستخدم؟
    created_at TIMESTAMPTZ DEFAULT NOW(),           -- تاريخ الإنشاء
    updated_by UUID,                                -- من آخر من عدل عليه؟
    updated_at TIMESTAMPTZ DEFAULT NOW(),           -- تاريخ آخر تعديل
    device_info JSONB DEFAULT '{}',                 -- معلومات الجهاز (مرونة في تخزين بيانات إضافية)
    
    -- العلاقات الخارجية
    CONSTRAINT fk_user_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- فهارس لتحسين الأداء
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_username ON users(username);

-- ================================================================
-- 🌍 البيانات المرجعية - الجنسيات
-- ================================================================
-- 
-- قائمة بالجنسيات المتاحة للوفود
-- يمكن إضافة جنسيات جديدة حسب الحاجة
--
CREATE TABLE nationality (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,              -- اسم الجنسية
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 🏙️ البيانات المرجعية - المدن
-- ================================================================
-- 
-- قائمة بالمدن للوجهات والمطارات
--
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_name VARCHAR(100) UNIQUE NOT NULL,         -- اسم المدينة
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ✈️ البيانات المرجعية - شركات الطيران
-- ================================================================
-- 
-- قائمة بشركات الطيران للرحلات
--
CREATE TABLE air_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,              -- اسم شركة الطيران
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 🛬 البيانات المرجعية - المطارات
-- ================================================================
-- 
-- قائمة بالمطارات للوصول والمغادرة
--
CREATE TABLE air_port (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,              -- اسم المطار
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 🎖️ البيانات المرجعية - الوظائف المعادلة
-- ================================================================
-- 
-- قائمة بالوظائف العسكرية المعادلة
-- مثال: "رئيس أركان البرية" يعادل "رئيس أركان حرب"
--
CREATE TABLE equivalent_job (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,              -- اسم الوظيفة المعادلة
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 🎪 الأحداث الرئيسية
-- ================================================================
-- 
-- الأحداث الكبيرة مثل: EDEX، الفروسية، النجم الساطع، معرض الطائرات
-- هذه تظهر في السايد بار كرئيسية
--
CREATE TABLE main_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,               -- اسم الحدث الرئيسي
    event_link TEXT,                                -- رابط الحدث (اختياري)
    event_icon TEXT,                                -- أيقونة الحدث (اختياري)
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 📅 الأحداث الفرعية
-- ================================================================
-- 
-- الأحداث الصغيرة تحت كل حدث رئيسي
-- مثال: EDEX 2024، EDEX 2025 تحت الحدث الرئيسي EDEX
--
CREATE TABLE sub_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    main_event_id UUID NOT NULL REFERENCES main_event(id) ON DELETE CASCADE,
    event_name VARCHAR(100) NOT NULL,               -- اسم الحدث الفرعي
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهرس لتحسين البحث حسب الحدث الرئيسي
CREATE INDEX idx_sub_event_main_event_id ON sub_event(main_event_id);

-- ================================================================
-- 🏛️ الوفود
-- ================================================================
-- 
-- الوفود المشاركة في الأحداث الفرعية
-- يحتوي على معلومات الوصول والتفاصيل الأساسية
--
CREATE TABLE delegation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_event_id UUID NOT NULL REFERENCES sub_event(id) ON DELETE CASCADE,
    nationality_id UUID REFERENCES nationality(id) ON DELETE SET NULL,
    airport_id UUID REFERENCES air_port(id) ON DELETE SET NULL,
    airline_id UUID REFERENCES air_line(id) ON DELETE SET NULL,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    delegation_leader_name VARCHAR(100) NOT NULL,   -- اسم رئيس الوفد
    member_count INT CHECK (member_count >= 0),     -- عدد الأعضاء المحدد للوفد (من الفرونت)
    current_members INT DEFAULT 0,                  -- العدد الحالي للأعضاء (محسوب تلقائياً)
    flight_number VARCHAR(20),                      -- رقم الرحلة
    type delegation_type NOT NULL,                  -- نوع الوفد (عسكري/مدني)
    status delegation_status DEFAULT 'NOT_DEPARTED', -- حالة الوفد (محسوبة تلقائياً)
    arrive_date DATE,                               -- تاريخ الوصول
    arrive_time TIME,                               -- ساعة الوصول
    receiver_name VARCHAR(100),                     -- اسم المستقبل (ورتبته)
    going_to VARCHAR(255),                          -- الوجهة (الفندق أو المكان اللي هيروحوا عليه)
    goods TEXT,                                     -- الشحنات
    -- ملاحظة: تم إزالة arrival_info و departure_info لتجنب التكرار
    -- جميع معلومات الوصول موجودة في الحقول العادية أعلاه
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس لتحسين الأداء
CREATE INDEX idx_delegation_event_id ON delegation(sub_event_id);
CREATE INDEX idx_delegation_type ON delegation(type);
CREATE INDEX idx_delegation_status ON delegation(status);

-- ================================================================
-- 👤 الأعضاء
-- ================================================================
-- 
-- أعضاء الوفود مع معلوماتهم العسكرية والوظيفية
-- كل عضو مربوط بوفد واحد
--
CREATE TABLE member (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegation_id UUID NOT NULL REFERENCES delegation(id) ON DELETE CASCADE,
    rank VARCHAR(50),                               -- الرتبة العسكرية
    name VARCHAR(100) NOT NULL,                     -- اسم العضو
    job_title VARCHAR(100),                         -- الوظيفة/الدور الحالي
    equivalent_job_id UUID REFERENCES equivalent_job(id) ON DELETE SET NULL, -- الوظيفة المعادلة
    status member_status DEFAULT 'NOT_DEPARTED',    -- حالة العضو (محسوبة تلقائياً)
    departure_date DATE,                            -- تاريخ المغادرة الفعلي للعضو
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس لتحسين الأداء
CREATE INDEX idx_member_delegation_id ON member(delegation_id);
CREATE INDEX idx_member_equivalent_job_id ON member(equivalent_job_id);
CREATE INDEX idx_member_status ON member(status);

-- ================================================================
-- 🛫 جلسات المغادرة
-- ================================================================
-- 
-- جلسات مغادرة الوفود (يمكن للوفد الواحد أن يغادر في جلسات متعددة)
-- كل جلسة تحتوي على مجموعة من الأعضاء
--
CREATE TABLE check_out (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegation_id UUID NOT NULL REFERENCES delegation(id) ON DELETE CASCADE,
    -- ملاحظة: تم إزالة session_type لتبسيط النظام
    nationality_id UUID REFERENCES nationality(id) ON DELETE SET NULL,
    airport_id UUID REFERENCES air_port(id) ON DELETE SET NULL,
    airline_id UUID REFERENCES air_line(id) ON DELETE SET NULL,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    flight_number VARCHAR(20),                      -- رقم رحلة المغادرة
    checkout_date DATE,                             -- تاريخ المغادرة
    checkout_time TIME,                             -- ساعة المغادرة
    depositor_name VARCHAR(100),                    -- اسم المودع (ورتبته)
    goods TEXT,                                     -- الشحنات
    notes TEXT,                                     -- ملاحظات إضافية
    members JSONB DEFAULT '[]',                     -- قائمة الأعضاء في هذه الجلسة
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهرس لتحسين البحث حسب الوفد
CREATE INDEX idx_checkout_delegation_id ON check_out(delegation_id);

-- ================================================================
-- 🔐 سجلات تسجيل الدخول
-- ================================================================
-- 
-- تتبع جميع محاولات تسجيل الدخول (ناجحة وفاشلة)
-- مع معلومات الجهاز والموقع
--
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ DEFAULT NOW(),           -- وقت محاولة الدخول
    ip_address INET,                                -- عنوان IP
    device TEXT,                                    -- نوع الجهاز
    user_agent TEXT,                                -- معلومات المتصفح
    success BOOLEAN DEFAULT TRUE                    -- هل نجحت العملية؟
);

-- فهرس لتحسين البحث حسب المستخدم
CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_success ON login_logs(success);

-- ================================================================
-- 📝 سجل التدقيق (Audit Log)
-- ================================================================
-- 
-- تتبع جميع التغييرات في النظام (إضافة، تعديل، حذف)
-- مع تفاصيل البيانات القديمة والجديدة
--
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,                       -- اسم الجدول
    record_id UUID,                                 -- معرف السجل
    action VARCHAR(10) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')), -- نوع العملية
    old_data JSONB,                                 -- البيانات القديمة
    new_data JSONB,                                 -- البيانات الجديدة
    changed_by UUID REFERENCES users(id),           -- من قام بالتغيير
    changed_at TIMESTAMPTZ DEFAULT NOW(),           -- وقت التغيير
    ip_address INET,                                -- عنوان IP
    user_agent TEXT                                 -- معلومات الجهاز
);

-- فهارس لتحسين البحث في سجل التدقيق
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- ================================================================
-- 🔧 الدوال المساعدة (Functions)
-- ================================================================

-- دالة لتحديث عدد الأعضاء في الوفد تلقائياً
CREATE OR REPLACE FUNCTION update_delegation_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        -- تحديث العدد الحالي للأعضاء في الوفد
        UPDATE delegation 
        SET current_members = (
            SELECT COUNT(*) FROM member 
            WHERE delegation_id = COALESCE(NEW.delegation_id, OLD.delegation_id)
        )
        WHERE id = COALESCE(NEW.delegation_id, OLD.delegation_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث حالة الوفد بناءً على حالة أعضائه
CREATE OR REPLACE FUNCTION update_delegation_status()
RETURNS TRIGGER AS $$
DECLARE
    total_members INT;
    departed_members INT;
    new_status delegation_status;
    delegation_uuid UUID;
BEGIN
    -- تحديد معرف الوفد
    delegation_uuid := COALESCE(NEW.delegation_id, OLD.delegation_id);
    
    -- حساب عدد الأعضاء الإجمالي والمغادرين
    SELECT COUNT(*) INTO total_members
    FROM member 
    WHERE delegation_id = delegation_uuid;
    
    SELECT COUNT(*) INTO departed_members
    FROM member 
    WHERE delegation_id = delegation_uuid 
    AND status = 'DEPARTED';
    
    -- تحديد الحالة الجديدة للوفد
    IF departed_members = 0 THEN
        new_status := 'NOT_DEPARTED';
    ELSIF departed_members = total_members AND total_members > 0 THEN
        new_status := 'FULLY_DEPARTED';
    ELSE
        new_status := 'PARTIALLY_DEPARTED';
    END IF;
    
    -- تحديث حالة الوفد
    UPDATE delegation 
    SET status = new_status,
        current_members = total_members
    WHERE id = delegation_uuid;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث حالة الأعضاء عند إنشاء جلسة مغادرة
CREATE OR REPLACE FUNCTION update_member_status_on_checkout()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث حالة الأعضاء في الجلسة إلى DEPARTED
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE member 
        SET status = 'DEPARTED', 
            departure_date = NEW.checkout_date
        WHERE id = ANY(
            SELECT jsonb_array_elements_text(NEW.members)::uuid
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- دالة لإنشاء سجل التدقيق
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), current_setting('app.current_user')::uuid);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user')::uuid);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), current_setting('app.current_user')::uuid);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ⚡ المشغلات (Triggers)
-- ================================================================

-- مشغل لتحديث عدد الأعضاء عند إضافة/حذف عضو
CREATE TRIGGER trg_update_member_count
AFTER INSERT OR DELETE ON member
FOR EACH ROW EXECUTE FUNCTION update_delegation_member_count();

-- مشغل لتحديث حالة الوفد عند تغيير حالة الأعضاء
CREATE TRIGGER trg_update_delegation_status
AFTER INSERT OR UPDATE OR DELETE ON member
FOR EACH ROW EXECUTE FUNCTION update_delegation_status();

-- مشغل لتحديث حالة الأعضاء عند إنشاء جلسة مغادرة
CREATE TRIGGER trg_update_member_status_on_checkout
AFTER INSERT OR UPDATE ON check_out
FOR EACH ROW EXECUTE FUNCTION update_member_status_on_checkout();

-- مشغلات سجل التدقيق لجميع الجداول المهمة
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER trg_audit_delegation
AFTER INSERT OR UPDATE OR DELETE ON delegation
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER trg_audit_member
AFTER INSERT OR UPDATE OR DELETE ON member
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER trg_audit_check_out
AFTER INSERT OR UPDATE OR DELETE ON check_out
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ================================================================
-- 📊 بيانات تجريبية (اختياري)
-- ================================================================

-- إدراج مستخدم تجريبي
INSERT INTO users (username, full_name, password_hash, role, is_staff, is_superuser) 
VALUES ('admin', 'مدير النظام', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4V7K1jQyqW', 'SUPER_ADMIN', true, true);

-- إدراج جنسيات تجريبية
INSERT INTO nationality (name) VALUES 
('مصرية'), ('سعودية'), ('إماراتية'), ('أردنية'), ('كويتية');

-- إدراج مدن تجريبية
INSERT INTO cities (city_name) VALUES 
('القاهرة'), ('الرياض'), ('دبي'), ('عمان'), ('الكويت');

-- إدراج شركات طيران تجريبية
INSERT INTO air_line (name) VALUES 
('مصر للطيران'), ('الخطوط السعودية'), ('طيران الإمارات'), ('الخطوط الملكية الأردنية');

-- إدراج مطارات تجريبية
INSERT INTO air_port (name) VALUES 
('مطار القاهرة الدولي'), ('مطار الملك خالد الدولي'), ('مطار دبي الدولي');

-- إدراج وظائف معادلة تجريبية
INSERT INTO equivalent_job (name) VALUES 
('رئيس أركان حرب'), ('نائب رئيس أركان'), ('قائد فرقة'), ('قائد لواء');

-- ================================================================
-- 🎯 ملاحظات مهمة
-- ================================================================
-- 
-- 1. جميع الجداول تستخدم UUID كمعرف رئيسي لضمان الأمان والتفرد
-- 2. نظام Audit شامل يتتبع جميع التغييرات تلقائياً
-- 3. الحالات (status) تتحدد تلقائياً بناءً على البيانات المرتبطة
-- 4. استخدام JSONB للمعلومات المرنة مثل arrival_info و departure_info
-- 5. جميع العلاقات الخارجية محمية بـ CASCADE أو SET NULL حسب المنطق
-- 6. الفهارس محسنة للأداء على الاستعلامات الشائعة
-- 7. المشغلات تضمن تحديث البيانات المرتبطة تلقائياً
-- 
-- ================================================================
-- 🔐 نظام الصلاحيات
-- ================================================================
-- 
-- SUPER_ADMIN:
-- - ✅ Django Admin Dashboard (is_staff=true, is_superuser=true)
-- - ✅ جميع الصلاحيات في Frontend
-- - ✅ إدارة المستخدمين
-- 
-- ADMIN:
-- - ❌ Django Admin Dashboard (is_staff=false, is_superuser=false)
-- - ✅ جميع الصلاحيات في Frontend (عدا إدارة المستخدمين)
-- - ✅ إدارة الأحداث والوفود والأعضاء
-- - ✅ التقارير والتصدير
-- 
-- USER:
-- - ❌ Django Admin Dashboard (is_staff=false, is_superuser=false)
-- - ✅ عرض البيانات فقط
-- - ✅ إضافة وفود وأعضاء وجلسات مغادرة
-- - ❌ تعديل أو حذف البيانات
-- - ❌ التقارير والتصدير
-- 
-- ================================================================
-- ✅ انتهى Schema قاعدة البيانات
-- ================================================================
